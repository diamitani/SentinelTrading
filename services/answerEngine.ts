// Client for the Sentinel answer engine (/api/ask).
// Reads the Server-Sent Events stream and calls a handler for each event,
// so the UI can show research steps, sources and the answer as they arrive.
import { aiKeyHeaders } from './aiKeyService';

export type ResearchFocus = 'all' | 'equities' | 'macro' | 'commodities' | 'crypto' | 'filings';

export interface AnswerSource {
  id: number;
  title: string;
  url: string;
  domain: string;
  snippet?: string;
}

export type AnswerEvent =
  | { type: 'status'; step: string; label: string }
  | { type: 'sources'; sources: AnswerSource[] }
  | { type: 'answer'; text: string; final?: boolean }
  | { type: 'related'; questions: string[] }
  | {
      type: 'meta';
      mode: 'live' | 'demo';
      model: string;
      disclosure: string;
      complianceFlags: string[];
    }
  | { type: 'done' }
  | { type: 'error'; message: string };

export interface AskRequest {
  query: string;
  focus: ResearchFocus;
  history: { role: 'user' | 'model'; text: string }[];
}

export async function streamAnswer(
  request: AskRequest,
  onEvent: (event: AnswerEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream', ...aiKeyHeaders() },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    onEvent({ type: 'error', message: data.error || `Request failed (${response.status}).` });
    return;
  }

  const handleBlock = (block: string) => {
    const dataLines = block
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim());
    if (!dataLines.length) return;
    try {
      onEvent(JSON.parse(dataLines.join('\n')) as AnswerEvent);
    } catch {
      /* ignore malformed block */
    }
  };

  // Some hosts buffer the response; fall back to reading it all at once.
  if (!response.body) {
    (await response.text()).split('\n\n').forEach(handleBlock);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep = buffer.indexOf('\n\n');
    while (sep !== -1) {
      handleBlock(buffer.slice(0, sep));
      buffer = buffer.slice(sep + 2);
      sep = buffer.indexOf('\n\n');
    }
  }
  if (buffer.trim()) handleBlock(buffer);
}

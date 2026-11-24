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
  /** RAG DAL credibility tier: 1 official, 2 major news, 3 community. */
  tier?: 1 | 2 | 3;
  tierLabel?: string;
  credibility?: number;
  fromHub?: boolean;
}

export type NpaoCategory = 'necessity' | 'anxiety' | 'priority' | 'opportunity';

export interface TraceTopic {
  id: string;
  question: string;
  category: NpaoCategory;
  sourceIds: number[];
  confidence: number;
  breakdown: { sources: number; consistency: number; tier: number; recency: number };
  status: 'verified' | 'uncertain' | 'open' | 'reused' | 'deferred';
  passes: number;
  note?: string;
}

/** How an answer was researched (PAL -> NPAO -> RAG DAL -> Hub). */
export interface ResearchTrace {
  intent?: {
    primary_intent: string;
    domain: string;
    subject: string;
    tickers: string[];
    ambiguity_score: number;
    time_sensitive: boolean;
    source: 'model' | 'rules';
  };
  brief?: string;
  route?: { phase: string; reason: string };
  hub?: { enabled: boolean; reason: string | null; context: number; reused: string[] };
  plan?: {
    tasks: {
      id: string;
      question: string;
      category: NpaoCategory;
      priority: number;
      queue: string;
      doer: string;
      gated: boolean;
      scores: { phase_urgency: number; dependency_impact: number; business_impact: number; resource_efficiency: number };
    }[];
    pattern: string;
    weights: Record<string, number>;
  };
  topics?: TraceTopic[];
  report?: {
    passes_run: number;
    overall_confidence: number;
    threshold: number;
    open_questions: string[];
    gaps: string[];
    tier_mix: { tier1: number; tier2: number; tier3: number };
    elapsed_ms: number;
  };
  hubSaved?: number;
}

export type NeedsKeyReason = 'missing' | 'rejected' | 'rate-limited';

export type AnswerEvent =
  | { type: 'status'; step: string; label: string }
  | { type: 'sources'; sources: AnswerSource[] }
  | { type: 'answer'; text: string; final?: boolean }
  | { type: 'related'; questions: string[] }
  | { type: 'pipeline'; stage: 'pal' | 'npao' | 'ragdal-pass' | 'report'; [key: string]: any }
  | { type: 'needs_key'; reason: NeedsKeyReason }
  | {
      type: 'meta';
      mode: 'live';
      model: string;
      disclosure: string;
      complianceFlags: string[];
      hubSaved?: number;
    }
  | { type: 'done' }
  | { type: 'error'; message: string };

export interface AskRequest {
  query: string;
  focus: ResearchFocus;
  history: { role: 'user' | 'model'; text: string }[];
  /** The user's plan, so answers match their level (beginner = plain English). */
  plan?: string;
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

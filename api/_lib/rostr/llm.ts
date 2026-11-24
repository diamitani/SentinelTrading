// Thin wrapper over Gemini (the user's own key) with timeouts.
// Every call can fail; callers always have a rules-based fallback.
import { GoogleGenAI } from '@google/genai';

export const EMBED_MODEL = 'gemini-embedding-001';
export const EMBED_DIMS = 768;

export interface GroundedResult {
  text: string;
  chunks: { uri: string; title: string }[];
  supports: { segment?: { text?: string }; groundingChunkIndices?: number[] }[];
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms)),
  ]);
}

export class Llm {
  constructor(private ai: GoogleGenAI, public model: string) {}

  /** Ask for JSON matching a schema. Returns null on any failure. */
  async json<T>(prompt: string, schema: unknown, timeoutMs = 8000): Promise<T | null> {
    try {
      const resp: any = await withTimeout(
        this.ai.models.generateContent({
          model: this.model,
          contents: prompt,
          config: { temperature: 0.1, responseMimeType: 'application/json', responseJsonSchema: schema },
        }),
        timeoutMs,
        'json'
      );
      const raw = String(resp?.text || '').trim();
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
      console.info('[rostr] json call failed:', String((err as any)?.message || err).slice(0, 160));
      return null;
    }
  }

  /** One Google-Search-grounded call (a single RAG DAL search). */
  async grounded(prompt: string, timeoutMs = 14000): Promise<GroundedResult> {
    const resp: any = await withTimeout(
      this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: { temperature: 0.2, tools: [{ googleSearch: {} }] },
      }),
      timeoutMs,
      'grounded search'
    );
    const gm = resp?.candidates?.[0]?.groundingMetadata || {};
    return {
      text: String(resp?.text || ''),
      chunks: ((gm.groundingChunks as any[]) || [])
        .map((c) => ({ uri: String(c?.web?.uri || ''), title: String(c?.web?.title || '') }))
        .filter((c) => c.uri),
      supports: (gm.groundingSupports as any[]) || [],
    };
  }

  /** Streamed final answer (no tools: it writes only from the research corpus). */
  async *stream(prompt: string, system: string): AsyncGenerator<string> {
    const stream: any = await this.ai.models.generateContentStream({
      model: this.model,
      contents: prompt,
      config: { systemInstruction: system, temperature: 0.3 },
    });
    for await (const chunk of stream) {
      const piece = typeof chunk?.text === 'string' ? chunk.text : '';
      if (piece) yield piece;
    }
  }

  async embed(text: string, kind: 'query' | 'document', timeoutMs = 5000): Promise<number[] | null> {
    try {
      const resp: any = await withTimeout(
        this.ai.models.embedContent({
          model: EMBED_MODEL,
          contents: [text.slice(0, 6000)],
          config: { taskType: kind === 'query' ? 'RETRIEVAL_QUERY' : 'RETRIEVAL_DOCUMENT', outputDimensionality: EMBED_DIMS },
        }),
        timeoutMs,
        'embed'
      );
      const values = resp?.embeddings?.[0]?.values;
      return Array.isArray(values) && values.length === EMBED_DIMS ? values : null;
    } catch (err) {
      console.info('[rostr] embed failed:', String((err as any)?.message || err).slice(0, 160));
      return null;
    }
  }
}

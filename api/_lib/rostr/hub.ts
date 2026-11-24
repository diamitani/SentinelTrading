// ============================================================================
// Rostr Hub: persistent semantic knowledge base (paper §5.5-5.6, §7).
// Verified findings are embedded (Gemini embeddings, 768 dims) and stored in
// Supabase pgvector with provenance (sources, tiers, confidence, date).
// PAL Stage 2 (context injection) searches it by meaning before any web search,
// so knowledge compounds: a sub-question answered well today is reused
// tomorrow instead of searched again (while it is still fresh).
//
// Server-only. Uses SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (set automatically
// by the Vercel <-> Supabase connection). Table: supabase/migrations/*_rostr_hub.sql
// If either is missing the Hub turns itself off and research still works.
// ============================================================================
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { HubEntry, Intent, RagDalReport } from './types.js';
import type { SourceRegistry } from './ragdal.js';
import type { Llm } from './llm.js';

const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '').trim();

let client: SupabaseClient | null = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
let disabledReason: string | null = client ? null : 'database keys not configured';

export const MATCH_THRESHOLD = 0.75; // paper §4.2: prior decisions with similarity > 0.75
const REUSE_SIMILARITY = 0.9; // close enough to reuse instead of re-searching
const FRESH_MS = 72 * 3600 * 1000; // paper §5.7: cache TTL 72 hours for time-sensitive topics

export function hubStatus() {
  return { enabled: Boolean(client), reason: disabledReason };
}

function disable(reason: string) {
  console.info('[rostr] hub disabled:', reason);
  disabledReason = reason;
  client = null;
}

async function match(embedding: number[], count: number): Promise<HubEntry[]> {
  if (!client) return [];
  const { data, error } = await client.rpc('match_rostr_kb', {
    query_embedding: embedding,
    match_threshold: MATCH_THRESHOLD,
    match_count: count,
    p_namespace: 'global',
  });
  if (error) {
    // Missing table/function: turn the Hub off for this instance instead of failing every request.
    if (/does not exist|could not find|schema cache/i.test(error.message)) disable('knowledge base table not created yet');
    else console.info('[rostr] hub match error:', error.message.slice(0, 160));
    return [];
  }
  return (data || []) as HubEntry[];
}

const isFresh = (e: HubEntry) => !e.time_sensitive || (e.created_at && Date.now() - new Date(e.created_at).getTime() < FRESH_MS);

/** PAL Stage 2: semantic context for the whole question, and per-topic reuse. */
export async function retrieveContext(llm: Llm, query: string, intent: Intent) {
  const context: HubEntry[] = [];
  const reused = new Map<string, HubEntry>();
  if (!client) return { context, reused };

  const qEmb = await llm.embed(query, 'query');
  if (qEmb) context.push(...(await match(qEmb, 5)).filter(isFresh));

  // Per sub-question: reuse only verified, fresh, near-identical findings.
  await Promise.all(
    intent.sub_topics.map(async (t) => {
      if (!client) return;
      const emb = await llm.embed(t.question, 'query');
      if (!emb) return;
      const best = (await match(emb, 1))[0];
      if (best && (best.similarity ?? 0) >= REUSE_SIMILARITY && best.verification_status === 'verified' && best.confidence >= 0.8 && isFresh(best)) {
        reused.set(t.id, best);
      }
    })
  );
  return { context, reused };
}

/** Knowledge-base ingestion: save verified/uncertain findings with provenance. */
export async function ingest(llm: Llm, query: string, intent: Intent, report: RagDalReport, reg: SourceRegistry): Promise<number> {
  if (!client) return 0;
  const rows: any[] = [];
  for (const t of report.topics) {
    if (t.status === 'reused' || t.status === 'deferred' || t.confidence < 0.6 || !t.findings) continue;
    // Strip citation markers: the stored text stands alone; provenance is in `sources`.
    const summary = t.findings.replace(/\s*\[\d+\]/g, '').slice(0, 2400);
    const emb = await llm.embed(`${t.question}\n${summary}`, 'document');
    if (!emb) continue;
    rows.push({
      namespace: 'global',
      query_origin: query.slice(0, 500),
      topic: t.question.slice(0, 500),
      summary,
      sources: t.sourceIds.map((id) => reg.get(id)).filter(Boolean).map((s) => ({ title: s!.title, url: s!.url, domain: s!.domain, tier: s!.tier, credibility: s!.credibility })),
      confidence: t.confidence,
      verification_status: t.confidence >= 0.8 ? 'verified' : 'uncertain',
      time_sensitive: intent.time_sensitive,
      domain: intent.domain,
      tickers: intent.tickers,
      embedding: emb,
    });
  }
  if (!rows.length || !client) return 0;
  const { error } = await client.from('rostr_kb').insert(rows);
  if (error) {
    if (/does not exist|could not find|schema cache/i.test(error.message)) disable('knowledge base table not created yet');
    else console.info('[rostr] hub insert error:', error.message.slice(0, 160));
    return 0;
  }
  return rows.length;
}

/** Funnel analytics (anonymous events). Returns false if the table is missing. */
export async function recordFunnelEvent(row: { event: string; anon_id: string; plan?: string | null; props?: Record<string, unknown> }) {
  if (!client) return false;
  const { error } = await client.from('funnel_events').insert({
    event: row.event.slice(0, 64),
    anon_id: row.anon_id.slice(0, 64),
    plan: row.plan ? String(row.plan).slice(0, 32) : null,
    props: row.props || {},
  });
  if (error) {
    console.info('[funnel] insert error:', error.message.slice(0, 160));
    return false;
  }
  return true;
}

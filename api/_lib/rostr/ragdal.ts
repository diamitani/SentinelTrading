// ============================================================================
// RAG DAL: Dynamic Acquisition Layer (paper §5).
// Multi-pass, credibility-scored retrieval with convergence:
//   Pass 1  broad sweep         all tiers, every N/A/P sub-question in parallel
//   Pass 2  gap fill            Tier 1-2 targeted searches for topics < θ
//   Pass 3  deep verification   Tier 1 only for topics < θ - 0.1
//   Pass 4  (optional)          if >= 2 topics are still < 0.6
// Opportunity topics run only after every N/A/P topic reaches θ (W = 1).
//
// Confidence (paper §5.4):
//   0.35*sources + 0.30*consistency + 0.25*tier_distribution + 0.10*recency
//   sources     = min(1, Tier1/2 sources confirming / 2)
//   consistency = 1 - contradictions / claims
//   tier        = mean credibility of the topic's sources
//   recency     = 1 if newest source < 90 days old or topic is timeless, else 0.5
// The score is computed in code from the evidence, never guessed by the model.
// ============================================================================
import type { Emit, Intent, NpaoPlan, RagDalReport, ResearchSource, TopicCoverage, Tier, HubEntry } from './types.js';
import type { Llm, GroundedResult } from './llm.js';
import { publisherDomain, tierOf, TIER_CREDIBILITY, TIER_LABEL } from './tiers.js';

export const THETA = 0.8;
const MAX_PASSES = 4;
const MAX_SOURCES = 25;
const W = { sources: 0.35, consistency: 0.3, tier: 0.25, recency: 0.1 };

/** Shared source registry so every topic cites one global [n] list. */
export class SourceRegistry {
  list: ResearchSource[] = [];
  private byKey = new Map<string, number>();

  add(uri: string, title: string, topicId: string, extra: Partial<ResearchSource> = {}): number | null {
    const domain = publisherDomain(uri, title);
    const key = domain + '|' + (title || uri);
    let id = this.byKey.get(key);
    if (!id) {
      if (this.list.length >= MAX_SOURCES) return null;
      const tier = tierOf(domain);
      id = this.list.length + 1;
      this.byKey.set(key, id);
      this.list.push({
        id,
        title: title && title !== domain ? title : domain,
        url: uri,
        domain,
        tier,
        credibility: TIER_CREDIBILITY[tier],
        tierLabel: TIER_LABEL[tier],
        subTopics: [],
        ...extra,
      });
    }
    const src = this.list[id - 1];
    if (!src.subTopics.includes(topicId)) src.subTopics.push(topicId);
    return id;
  }

  get(id: number) {
    return this.list[id - 1];
  }
}

/** Insert [n] markers after the text segments each source supports. */
function cite(text: string, g: GroundedResult, localToGlobal: Map<number, number>): string {
  const inserts: { at: number; marker: string }[] = [];
  let from = 0;
  for (const s of g.supports) {
    const seg = s?.segment?.text || '';
    const ids = Array.from(new Set((s?.groundingChunkIndices || []).map((i) => localToGlobal.get(i)).filter((x): x is number => !!x))).sort((a, b) => a - b);
    if (!seg || !ids.length) continue;
    let idx = text.indexOf(seg, from);
    if (idx === -1) idx = text.indexOf(seg);
    if (idx === -1) continue;
    from = idx + seg.length;
    inserts.push({ at: idx + seg.length, marker: ids.map((n) => ` [${n}]`).join('') });
  }
  inserts.sort((a, b) => b.at - a.at);
  let out = text;
  for (const ins of inserts) out = out.slice(0, ins.at) + ins.marker + out.slice(ins.at);
  return out;
}

const PASS_GUIDANCE: Record<number, string> = {
  1: 'Search broadly. Use any reputable source.',
  2: 'Fill the gaps: prefer official sources (SEC filings, the Federal Reserve, government statistics, company investor relations) and major news (Reuters, AP, WSJ, Bloomberg, Financial Times). Avoid blogs and forums.',
  3: 'Verify with PRIMARY sources only: regulators, central banks, official statistics, exchanges, company filings or investor-relations pages.',
  4: 'Search from a different angle with different keywords; include any source that directly addresses the question.',
};

async function searchTopic(llm: Llm, mainQuestion: string, topicQ: string, pass: number, beginner: boolean) {
  return llm.grounded(
    `Today is ${new Date().toDateString()}. You are a research assistant gathering evidence (not giving advice).
Overall question: "${mainQuestion}"
Sub-question to research now: "${topicQ}"
${PASS_GUIDANCE[pass]}
Write 80-170 words of factual findings: specific facts, figures with dates, and who reported them. If sources disagree, say so explicitly. If evidence is thin, say so.${beginner ? ' Use plain words.' : ''} Do not recommend buying or selling anything.`
  );
}

interface Assessment {
  id: string;
  confirming_source_ids: number[];
  contradictions: number;
  claims: number;
  timeless: boolean;
  newest_date: string | null;
}

const ASSESS_SCHEMA = {
  type: 'object',
  properties: {
    topics: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          confirming_source_ids: { type: 'array', items: { type: 'integer' }, description: 'source numbers whose cited text supports the main claim' },
          contradictions: { type: 'integer', description: 'number of key facts on which sources disagree' },
          claims: { type: 'integer', description: 'number of distinct factual claims in the findings' },
          timeless: { type: 'boolean', description: 'true if the answer does not depend on recent events (e.g. a definition)' },
          newest_date: { type: ['string', 'null'], description: 'most recent date mentioned for the evidence, YYYY-MM-DD, or null' },
        },
        required: ['id', 'confirming_source_ids', 'contradictions', 'claims', 'timeless'],
      },
    },
  },
  required: ['topics'],
};

function score(t: TopicCoverage, a: Assessment | undefined, reg: SourceRegistry, timeSensitive: boolean) {
  const own = t.sourceIds.map((id) => reg.get(id)).filter(Boolean);
  const confirming = (a?.confirming_source_ids || t.sourceIds).filter((id) => t.sourceIds.includes(id));
  const confirmingTop = confirming.filter((id) => (reg.get(id)?.tier ?? 3) <= 2).length;
  const sources = Math.min(1, confirmingTop / 2);
  const claims = Math.max(1, a?.claims ?? 3);
  const consistency = Math.max(0, 1 - (a?.contradictions ?? 0) / claims);
  const tier = own.length ? own.reduce((s, x) => s + x!.credibility, 0) / own.length : 0;
  let recency = 0.5;
  if (a?.timeless || !timeSensitive) recency = 1;
  else if (a?.newest_date) {
    const age = (Date.now() - new Date(a.newest_date).getTime()) / 86_400_000;
    if (Number.isFinite(age) && age < 90) recency = 1;
  }
  const confidence = W.sources * sources + W.consistency * consistency + W.tier * tier + W.recency * recency;
  t.breakdown = { sources: round(sources), consistency: round(consistency), tier: round(tier), recency };
  t.confidence = t.sourceIds.length ? round(confidence) : 0;
}

const round = (n: number) => Math.round(n * 100) / 100;

async function assess(llm: Llm, topics: TopicCoverage[], reg: SourceRegistry, timeSensitive: boolean) {
  const payload = topics
    .map((t) => `### ${t.id}: ${t.question}\nSources: ${t.sourceIds.map((id) => `[${id}] ${reg.get(id)?.domain}`).join(', ') || 'none'}\nFindings: ${t.findings.slice(0, 1400)}`)
    .join('\n\n');
  const out = await llm.json<{ topics: Assessment[] }>(
    `You are RAG DAL's coverage assessor. Today is ${new Date().toDateString()}. For each topic, judge ONLY from the findings text and its [n] citations below.\n\n${payload}`,
    ASSESS_SCHEMA,
    9000
  );
  const byId = new Map((out?.topics || []).map((a) => [a.id, a]));
  for (const t of topics) score(t, byId.get(t.id), reg, timeSensitive);
}

export interface RagDalInput {
  llm: Llm;
  query: string;
  intent: Intent;
  plan: NpaoPlan;
  reused: Map<string, HubEntry>;
  beginner: boolean;
  emit: Emit;
  deadlineMs: number; // absolute time by which retrieval must stop
  isClosed: () => boolean;
}

export async function runRagDal(input: RagDalInput): Promise<{ report: RagDalReport; registry: SourceRegistry }> {
  const started = Date.now();
  const { llm, query, intent, plan, reused, beginner, emit } = input;
  const reg = new SourceRegistry();

  const topics: TopicCoverage[] = plan.tasks.map((t) => ({
    id: t.id,
    question: t.question,
    category: t.category,
    findings: '',
    sourceIds: [],
    confidence: 0,
    breakdown: { sources: 0, consistency: 0, tier: 0, recency: 0 },
    status: 'open',
    passes: 0,
  }));

  // Hub reuse: already-verified knowledge counts as covered.
  for (const t of topics) {
    const hit = reused.get(t.id);
    if (!hit) continue;
    const ids = hit.sources.map((s) => reg.add(s.url, s.title, t.id, { fromHub: true })).filter((x): x is number => !!x);
    t.sourceIds = ids;
    t.findings = hit.summary;
    t.confidence = hit.confidence;
    t.status = 'reused';
    t.note = 'Verified earlier and still current, reused from the knowledge base.';
  }

  const timeLeft = () => input.deadlineMs - Date.now();
  let passes = 0;

  const runPass = async (pass: number, targets: TopicCoverage[], opportunityRun = false) => {
    if (!targets.length) return;
    passes = pass;
    emit({
      type: 'status',
      step: `ragdal-${pass}`,
      label:
        opportunityRun ? `Main answer verified (W = 1): researching ${targets.length} go-deeper question${targets.length > 1 ? 's' : ''}`
        : pass === 1 ? `RAG DAL pass 1: searching ${targets.length} sub-questions in parallel`
        : pass === 2 ? `RAG DAL pass 2: filling ${targets.length} gap${targets.length > 1 ? 's' : ''} with official and major sources`
        : pass === 3 ? `RAG DAL pass 3: verifying with primary sources`
        : `RAG DAL pass 4: searching from a new angle`,
    });
    const results = await Promise.allSettled(targets.map((t) => searchTopic(llm, query, t.question, pass, beginner)));
    // If every first-pass search failed, the key or quota is the problem: surface it.
    if (pass === 1 && results.every((r) => r.status === 'rejected')) throw (results[0] as PromiseRejectedResult).reason;
    results.forEach((r, i) => {
      const t = targets[i];
      t.passes = pass;
      if (r.status !== 'fulfilled') return;
      const local = new Map<number, number>();
      r.value.chunks.forEach((c, ci) => {
        const id = reg.add(c.uri, c.title, t.id);
        if (id) local.set(ci, id);
      });
      const text = cite(r.value.text.trim(), r.value, local);
      if (!text) return;
      t.findings = t.findings ? `${t.findings}\n\n${text}` : text;
      for (const id of local.values()) if (!t.sourceIds.includes(id)) t.sourceIds.push(id);
    });
    await assess(llm, targets, reg, intent.time_sensitive);
    for (const t of targets) t.status = t.confidence >= THETA ? 'verified' : t.sourceIds.length ? 'uncertain' : 'open';
    emit({ type: 'pipeline', stage: 'ragdal-pass', pass, topics: snapshot(topics), sources: reg.list });
  };

  const core = () => topics.filter((t) => t.category !== 'opportunity' && t.status !== 'reused');
  const opportunity = () => topics.filter((t) => t.category === 'opportunity' && t.status !== 'reused');

  // Pass 1: broad sweep across N, A, P.
  await runPass(1, core());
  // Pass 2: gap fill (< θ).
  if (!input.isClosed() && timeLeft() > 14_000) await runPass(2, core().filter((t) => t.confidence < THETA));
  // Pass 3: deep verification (< θ - 0.1), Tier 1 only.
  if (!input.isClosed() && timeLeft() > 14_000) await runPass(3, core().filter((t) => t.confidence < THETA - 0.1));
  // Pass 4: only if >= 2 topics are still below 0.6.
  const veryLow = core().filter((t) => t.confidence < 0.6);
  if (!input.isClosed() && veryLow.length >= 2 && passes < MAX_PASSES && timeLeft() > 14_000) await runPass(4, veryLow);

  // Opportunity gate: only once the whole is complete (every N/A/P topic >= θ).
  const whole = core().every((t) => t.confidence >= THETA);
  const opp = opportunity();
  if (opp.length) {
    if (whole && !input.isClosed() && timeLeft() > 12_000) {
      await runPass(Math.max(passes, 1), opp, true);
    } else {
      for (const t of opp) {
        t.status = 'deferred';
        t.note = whole ? 'Skipped to keep the answer fast. Ask it as a follow-up.' : 'Waits until the main answer is fully verified (W = 1).';
      }
    }
  }

  for (const t of core()) {
    if (t.sourceIds.length === 0) t.status = 'open';
    else if (t.confidence < 0.7) t.status = 'uncertain';
  }

  const scored = topics.filter((t) => t.status !== 'deferred' && t.sourceIds.length);
  const overall = scored.length ? round(scored.reduce((s, t) => s + t.confidence, 0) / scored.length) : 0;
  const count = (tier: Tier) => reg.list.filter((s) => s.tier === tier).length;

  const report: RagDalReport = {
    passes_run: passes,
    overall_confidence: overall,
    threshold: THETA,
    topics,
    open_questions: topics
      .filter((t) => t.status === 'uncertain')
      .map((t) => `${t.question}: confidence ${Math.round(t.confidence * 100)}%${t.breakdown.sources < 1 ? ', fewer than two official or major sources confirm it' : ''}${t.breakdown.consistency < 1 ? ', sources disagree on some facts' : ''}.`),
    gaps: topics.filter((t) => t.status === 'open').map((t) => `${t.question}: no reliable sources found.`),
    tier_mix: { tier1: count(1), tier2: count(2), tier3: count(3) },
    elapsed_ms: Date.now() - started,
  };
  return { report, registry: reg };
}

export function snapshot(topics: TopicCoverage[]) {
  return topics.map(({ findings: _f, ...rest }) => ({ ...rest, sourceIds: [...rest.sourceIds], breakdown: { ...rest.breakdown } }));
}

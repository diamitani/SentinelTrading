// ============================================================================
// PAL: Prompt Abstraction Layer (paper §4.2), five stages:
//   1 Intent extraction    -> structured intent + sub-topic decomposition
//   2 Context injection    -> Hub semantic search + user level (done in pipeline)
//   3 Semantic enhancement -> precise research brief (rules, no hedging)
//   4 Runtime compilation  -> manifest the researcher runs under
//   5 Output routing       -> NPAO phase + RAG DAL trigger
// ============================================================================
import type { Intent, SubTopic, RuntimeManifest, Route, HubEntry } from './types.js';
import type { Llm } from './llm.js';

const DOMAINS: Intent['domain'][] = ['stocks', 'etfs', 'macro', 'commodities', 'crypto', 'prediction-markets', 'filings', 'education', 'personal-finance', 'other'];

const INTENT_SCHEMA = {
  type: 'object',
  properties: {
    primary_intent: { type: 'string', description: 'verb + object, e.g. "understand why Nvidia stock fell"' },
    domain: { type: 'string', enum: DOMAINS },
    subject: { type: 'string' },
    tickers: { type: 'array', items: { type: 'string' } },
    constraints: { type: 'array', items: { type: 'string' } },
    desired_output: { type: 'string' },
    urgency: { type: 'string', enum: ['immediate', 'queued', 'scheduled'] },
    ambiguity_score: { type: 'number' },
    time_sensitive: { type: 'boolean', description: 'true if the answer depends on recent prices, news or data' },
    sub_topics: {
      type: 'array',
      description: '2-4 research sub-questions that together fully answer the question',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          kind: {
            type: 'string',
            enum: ['definition', 'risk', 'core', 'extension'],
            description: 'definition = basics needed first; risk = what could go wrong; core = the main answer; extension = a useful next step',
          },
        },
        required: ['question', 'kind'],
      },
    },
  },
  required: ['primary_intent', 'domain', 'subject', 'time_sensitive', 'ambiguity_score', 'sub_topics'],
};

/* ------------------------------ Stage 1 ---------------------------------- */

function rulesIntent(query: string, focus: string): Intent {
  const q = query.toLowerCase();
  const tickers = Array.from(new Set((query.match(/\$?\b[A-Z]{2,5}\b/g) || []).map((t) => t.replace('$', ''))))
    .filter((t) => !['ETF', 'CPI', 'GDP', 'FED', 'SEC', 'IPO', 'USA', 'AI', 'FOMC', 'EPS', 'THE', 'AND', 'WHAT', 'HOW', 'WHY'].includes(t))
    .slice(0, 4);
  const domain: Intent['domain'] =
    focus === 'macro' || /fed|fomc|rate|inflation|cpi|gdp|yield|recession|jobs?\b/.test(q) ? 'macro'
    : focus === 'commodities' || /oil|gold|copper|alumin|commodit|futures|wheat|natural gas/.test(q) ? 'commodities'
    : focus === 'crypto' || /bitcoin|crypto|ethereum|btc|eth\b|stablecoin/.test(q) ? 'crypto'
    : focus === 'filings' || /10-k|10-q|8-k|filing|earnings report/.test(q) ? 'filings'
    : /kalshi|polymarket|prediction market|event contract/.test(q) ? 'prediction-markets'
    : /\betf|index fund/.test(q) ? 'etfs'
    : /what is|what are|how do|how does|explain|difference between|meaning/.test(q) ? 'education'
    : tickers.length ? 'stocks'
    : 'other';
  const timeSensitive = /today|this week|now|latest|recent|current|right now|why did|why is|fell|rose|jump|drop|news/.test(q) || tickers.length > 0;
  const isConcept = domain === 'education';
  const subject = tickers[0] || query.replace(/[?.!]+$/, '').slice(0, 80);
  const sub_topics: SubTopic[] = isConcept
    ? [
        { id: 't1', question: `What is the basic definition: ${query}`, kind: 'definition' },
        { id: 't2', question: `How does it work in practice, with a simple example?`, kind: 'core' },
        { id: 't3', question: `What are the main risks or common mistakes?`, kind: 'risk' },
      ]
    : [
        { id: 't1', question: `What background does someone need to understand: ${query}`, kind: 'definition' },
        { id: 't2', question: query, kind: 'core' },
        { id: 't3', question: `What are the risks and the opposing view?`, kind: 'risk' },
        { id: 't4', question: `What should someone watch next or research further?`, kind: 'extension' },
      ];
  const explicit = [tickers.length > 0, timeSensitive, query.length > 25].filter(Boolean).length;
  return {
    primary_intent: `understand ${subject}`,
    domain,
    subject,
    tickers,
    constraints: [],
    desired_output: 'plain-English research answer with sources',
    urgency: timeSensitive ? 'immediate' : 'queued',
    ambiguity_score: Math.round((1 - explicit / 3) * 100) / 100,
    time_sensitive: timeSensitive,
    sub_topics,
    source: 'rules',
  };
}

export async function extractIntent(llm: Llm | null, query: string, focus: string, history: { role: string; text: string }[]): Promise<Intent> {
  const fallback = rulesIntent(query, focus);
  if (!llm) return fallback;
  const convo = history.slice(-4).map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text.slice(0, 400)}`).join('\n');
  const out = await llm.json<any>(
    `You are PAL's intent extractor for an investing research assistant. Today is ${new Date().toDateString()}.
${convo ? `Conversation so far:\n${convo}\n` : ''}User focus: ${focus}.
User question: "${query}"

Extract the structured intent. Decompose the question into 2-4 research sub-questions that together answer it fully:
- include one "definition" sub-question only if the user likely needs basics first,
- always one "core" sub-question (the heart of the question),
- always one "risk" sub-question (what could go wrong / the opposing view),
- optionally one "extension" sub-question (what to watch or learn next).
Sub-questions must be self-contained (name the company/asset explicitly). Do not invent facts.
ambiguity_score = 1 - (explicit parameters / parameters needed to answer well), between 0 and 1.`,
    INTENT_SCHEMA
  );
  if (!out || !Array.isArray(out.sub_topics) || out.sub_topics.length === 0) return fallback;
  const subs: SubTopic[] = out.sub_topics
    .filter((s: any) => s && typeof s.question === 'string' && ['definition', 'risk', 'core', 'extension'].includes(s.kind))
    .slice(0, 4)
    .map((s: any, i: number) => ({ id: `t${i + 1}`, question: String(s.question).slice(0, 240), kind: s.kind }));
  if (!subs.some((s) => s.kind === 'core')) subs.unshift({ id: 't0', question: query, kind: 'core' });
  return {
    primary_intent: String(out.primary_intent || fallback.primary_intent).slice(0, 160),
    domain: DOMAINS.includes(out.domain) ? out.domain : fallback.domain,
    subject: String(out.subject || fallback.subject).slice(0, 120),
    tickers: Array.isArray(out.tickers) ? out.tickers.map(String).slice(0, 6) : fallback.tickers,
    constraints: Array.isArray(out.constraints) ? out.constraints.map(String).slice(0, 6) : [],
    desired_output: String(out.desired_output || fallback.desired_output).slice(0, 160),
    urgency: ['immediate', 'queued', 'scheduled'].includes(out.urgency) ? out.urgency : fallback.urgency,
    ambiguity_score: Math.max(0, Math.min(1, Number(out.ambiguity_score) || 0)),
    time_sensitive: Boolean(out.time_sensitive),
    sub_topics: subs.map((s, i) => ({ ...s, id: `t${i + 1}` })),
    source: 'model',
  };
}

/* ------------------------------ Stage 3 ---------------------------------- */

const VERB_EXPANSIONS: [RegExp, string][] = [
  [/\b(is|are) .* (good|bad|worth)\b/i, 'Lay out the evidence for and against, without giving a buy/sell verdict.'],
  [/\bwhy did\b|\bwhy is\b/i, 'Identify the specific reported causes, with dates, and separate confirmed facts from speculation.'],
  [/\bcompare\b|\bvs\.?\b|\bversus\b|difference between/i, 'Compare side by side on the same criteria (cost, risk, how it works, who it suits).'],
  [/\bshould i\b/i, 'Explain the considerations a person would weigh; do not tell them what to do.'],
];

export function enhance(query: string, intent: Intent, opts: { beginner: boolean; hubContext: HubEntry[] }): string {
  const lines: string[] = [];
  lines.push(`Research goal: ${intent.primary_intent}.`);
  for (const [re, expansion] of VERB_EXPANSIONS) if (re.test(query)) lines.push(expansion);
  if (intent.time_sensitive) lines.push(`Use the most recent information available as of ${new Date().toDateString()}; give dates for every figure.`);
  else lines.push('This is foundational knowledge; prefer stable, authoritative explanations.');
  lines.push('Cite a source for every factual claim. Check more than one perspective. State confidence where evidence is thin.');
  lines.push('Prefer Tier 1 sources (regulators, central banks, official statistics, company filings), then major news, then community sources only for sentiment.');
  if (opts.beginner) lines.push('Audience: a beginner. Define jargon in plain words the first time it appears. Short sentences.');
  if (intent.tickers.length) lines.push(`Assets in scope: ${intent.tickers.join(', ')}.`);
  if (opts.hubContext.length) lines.push(`${opts.hubContext.length} related prior finding(s) exist in the knowledge base; verify they are still current before reusing.`);
  lines.push('Done when: every sub-question is answered with cited evidence, risks are stated, and nothing is presented as a recommendation.');
  return lines.join('\n');
}

/* ---------------------------- Stages 4 & 5 ------------------------------- */

export function compileManifest(model: string, hubEnabled: boolean): RuntimeManifest {
  return {
    agent_type: 'researcher',
    model,
    temperature: 0.2,
    tools_enabled: { allow: ['google_search', 'knowledge_base:read', 'knowledge_base:write'], deny: ['trade:execute', 'email:send'] },
    memory: { mode: hubEnabled ? 'persistent' : 'session', retrieve_strategy: 'vector_similarity' },
    completion_criteria: ['all sub-questions answered or flagged open', 'every claim cited', 'risks section present', 'compliance review passed'],
    escalation_policy: 'auto-proceed',
    output: { format: 'markdown', verification: 'compliance-review' },
  };
}

export function route(intent: Intent): Route {
  // Every user question is research work: PreD phase, research agent, RAG DAL on.
  return {
    phase: 'PreD',
    agent_type: 'researcher',
    trigger_ragdal: true,
    reason: `"${intent.primary_intent}" is a research request, so it routes to NPAO PreD with RAG DAL retrieval.`,
  };
}

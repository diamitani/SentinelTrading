// ============================================================================
// ROSTR research pipeline for Ask Sentinel (paper §3.2 information flow):
//   PAL 1 intent -> PAL 2 Hub context -> PAL 3 enhance -> PAL 4 manifest
//   -> PAL 5 route -> NPAO plan -> RAG DAL multi-pass -> synthesis
//   -> compliance review -> Hub ingestion
// Every stage is streamed to the browser so the user can see how the answer
// was researched. Live only: the caller guarantees a working AI key.
// ============================================================================
import type { Emit } from './types.js';
import { Llm } from './llm.js';
import { extractIntent, enhance, compileManifest, route } from './pal.js';
import { plan as npaoPlan } from './npao.js';
import { runRagDal, snapshot, THETA } from './ragdal.js';
import { retrieveContext, ingest, hubStatus } from './hub.js';

export interface PipelineInput {
  llm: Llm;
  query: string;
  focus: string;
  history: { role: string; text: string }[];
  beginner: boolean;
  systemInstruction: string;
  compliance: (text: string) => { text: string; flags: string[] };
  emit: Emit;
  isClosed: () => boolean;
  budgetMs?: number;
}

export interface PipelineResult {
  answer: string;
  flags: string[];
  related: string[];
  hubSaved: number;
}

const RELATED_SCHEMA = { type: 'object', properties: { questions: { type: 'array', items: { type: 'string' } } }, required: ['questions'] };

export async function runResearch(p: PipelineInput): Promise<PipelineResult> {
  const t0 = Date.now();
  const budget = p.budgetMs ?? 38_000; // retrieval budget; synthesis runs after
  const { llm, emit } = p;

  // ---- PAL Stage 1: intent extraction -------------------------------------
  emit({ type: 'status', step: 'pal-intent', label: 'PAL: understanding your question' });
  const intent = await extractIntent(llm, p.query, p.focus, p.history);

  // ---- PAL Stage 2: context injection (semantic search of the Hub) --------
  const hub = hubStatus();
  if (hub.enabled) emit({ type: 'status', step: 'hub', label: 'Searching Sentinel’s knowledge base by meaning' });
  const { context, reused } = await retrieveContext(llm, p.query, intent);

  // ---- PAL Stages 3-5: enhance, compile, route ------------------------------
  const brief = enhance(p.query, intent, { beginner: p.beginner, hubContext: context });
  const manifest = compileManifest(llm.model, hubStatus().enabled);
  const routed = route(intent);
  emit({
    type: 'pipeline',
    stage: 'pal',
    intent,
    brief,
    manifest,
    route: routed,
    hub: { ...hubStatus(), context: context.length, reused: Array.from(reused.keys()) },
  });

  // ---- NPAO: navigate, prioritize, allocate --------------------------------
  emit({ type: 'status', step: 'npao', label: `NPAO: planning ${intent.sub_topics.length} research tasks` });
  const plan = npaoPlan(intent, new Set(reused.keys()));
  emit({ type: 'pipeline', stage: 'npao', plan });

  // ---- RAG DAL: multi-pass retrieval (orchestrated fan-out) -----------------
  const { report, registry } = await runRagDal({
    llm,
    query: p.query,
    intent,
    plan,
    reused,
    beginner: p.beginner,
    emit,
    deadlineMs: t0 + budget,
    isClosed: p.isClosed,
  });
  emit({ type: 'sources', sources: registry.list });
  emit({ type: 'pipeline', stage: 'report', report: { ...report, topics: snapshot(report.topics) } });

  // ---- Synthesis (fan-in) ---------------------------------------------------
  emit({ type: 'status', step: 'write', label: 'Writing your answer from the verified findings' });
  const findings = report.topics
    .filter((t) => t.findings && t.status !== 'deferred')
    .map((t) => `### ${t.question}\nConfidence: ${Math.round(t.confidence * 100)}% (${t.status})\n${t.findings}`)
    .join('\n\n');
  const sourceList = registry.list.map((s) => `[${s.id}] ${s.title} (${s.domain}, ${s.tierLabel})`).join('\n');
  const background = context
    .slice(0, 3)
    .map((c) => `- ${c.topic}: ${c.summary.slice(0, 300)}`)
    .join('\n');

  const prompt = `User question: ${p.query}

Research brief (PAL):
${brief}

Verified research findings (RAG DAL). Citation numbers refer to the source list:
${findings || '(no findings)'}

Source list:
${sourceList || '(none)'}
${background ? `\nBackground from Sentinel's knowledge base (context only, do not cite):\n${background}\n` : ''}
${report.open_questions.length ? `Lower-confidence points (say they are uncertain):\n${report.open_questions.map((q) => '- ' + q).join('\n')}\n` : ''}
Write the answer now.
- Use ONLY the findings above. Keep their [n] citations exactly; never invent a number that is not in the source list.
- Start with a direct 1-2 sentence answer. Then short "## " sections with "- " bullets.
- If a point is below ${Math.round(THETA * 100)}% confidence, say the evidence is limited.
- End with "## Key risks".${p.beginner ? '\n- The reader is a beginner: explain any jargon in plain words.' : ''}`;

  let raw = '';
  let lastSent = 0;
  try {
    for await (const piece of llm.stream(prompt, p.systemInstruction)) {
      if (p.isClosed()) break;
      raw += piece;
      if (raw.length - lastSent > 40) {
        emit({ type: 'answer', text: p.compliance(raw).text });
        lastSent = raw.length;
      }
    }
  } catch (err) {
    console.info('[rostr] synthesis failed:', String((err as any)?.message || err).slice(0, 160));
    // Fall back to the findings themselves so the user still gets the research.
    raw = report.topics
      .filter((t) => t.findings && t.status !== 'deferred')
      .map((t) => `## ${t.question}\n${t.findings}`)
      .join('\n\n');
  }
  const filtered = p.compliance(raw);
  emit({ type: 'answer', text: filtered.text, final: true });

  // ---- Related questions: deferred Opportunity tasks first -----------------
  let related = report.topics.filter((t) => t.status === 'deferred').map((t) => t.question);
  if (related.length < 3 && !p.isClosed()) {
    const out = await llm.json<{ questions: string[] }>(
      `Question: ${p.query}\nAnswer summary: ${filtered.text.slice(0, 1000)}\nWrite 3 short, neutral follow-up research questions a curious investor might ask next. No buy/sell language.`,
      RELATED_SCHEMA,
      5000
    );
    related = related.concat((out?.questions || []).map((q) => p.compliance(String(q)).text.slice(0, 160)));
  }

  // ---- Hub ingestion: knowledge compounds ----------------------------------
  let hubSaved = 0;
  if (!p.isClosed()) {
    emit({ type: 'status', step: 'hub-save', label: 'Saving verified findings to the knowledge base' });
    hubSaved = await ingest(llm, p.query, intent, report, registry).catch(() => 0);
  }

  return { answer: filtered.text, flags: filtered.flags, related: related.slice(0, 3), hubSaved };
}

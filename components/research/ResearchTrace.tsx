import React, { useState } from 'react';
import { ChevronDown, KeyRound, Database, ListOrdered, ScanSearch, Brain, AlertTriangle } from 'lucide-react';
import { AnswerSource, NeedsKeyReason, NpaoCategory, ResearchTrace as Trace } from '../../services/answerEngine';

// "How Sentinel researched this": a readable view of the ROSTR pipeline
// (PAL -> NPAO -> RAG DAL -> Hub) behind every answer.

export const OPEN_AI_KEY_EVENT = 'sentinel-open-ai-key';
export const openAiKeySettings = () => window.dispatchEvent(new Event(OPEN_AI_KEY_EVENT));

export const CATEGORY_META: Record<NpaoCategory, { label: string; short: string; cls: string }> = {
  necessity: { label: 'Basics first', short: 'N', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  anxiety: { label: 'Risks', short: 'A', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  priority: { label: 'Main answer', short: 'P', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  opportunity: { label: 'Go deeper', short: 'O', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
};

const TIER_CLS: Record<number, string> = {
  1: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  2: 'bg-blue-50 text-blue-700 border-blue-200',
  3: 'bg-slate-50 text-slate-600 border-slate-200',
};

export const TierChip: React.FC<{ source: AnswerSource }> = ({ source }) =>
  source.tier ? (
    <span className={`inline-flex items-center rounded-full border px-1.5 py-px text-[10px] font-semibold ${TIER_CLS[source.tier]}`} title={`Credibility ${source.credibility ?? ''}`}>
      {source.fromHub ? 'Saved · ' : ''}
      {source.tierLabel}
    </span>
  ) : null;

const pct = (n: number) => `${Math.round(n * 100)}%`;

function confidenceTone(c: number) {
  if (c >= 0.8) return { bar: 'bg-emerald-500', text: 'text-emerald-700', label: 'High' };
  if (c >= 0.6) return { bar: 'bg-amber-500', text: 'text-amber-700', label: 'Medium' };
  return { bar: 'bg-red-500', text: 'text-red-700', label: 'Low' };
}

export const ConfidenceBadge: React.FC<{ value: number }> = ({ value }) => {
  const t = confidenceTone(value);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold ${t.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${t.bar}`} />
      {t.label} confidence · {pct(value)}
    </span>
  );
};

const STATUS_LABEL: Record<string, string> = {
  verified: 'Verified',
  uncertain: 'Limited evidence',
  open: 'Not found',
  reused: 'From knowledge base',
  deferred: 'Saved for follow-up',
};

const Section: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
  <div className="space-y-2">
    <h5 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
      <Icon className="h-3.5 w-3.5" /> {title}
    </h5>
    {children}
  </div>
);

export const ResearchTracePanel: React.FC<{ trace?: Trace; streaming: boolean }> = ({ trace, streaming }) => {
  const [open, setOpen] = useState(false);
  if (!trace?.intent && !trace?.plan) return null;
  const topics = trace.topics || [];
  const report = trace.report;
  const mix = report?.tier_mix;
  const total = mix ? mix.tier1 + mix.tier2 + mix.tier3 : 0;

  return (
    <section aria-label="How this was researched" className="rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center gap-2 px-4 py-3 text-left"
      >
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? '' : '-rotate-90'}`} />
        <span className="text-sm font-semibold text-slate-900">How Sentinel researched this</span>
        {report && <ConfidenceBadge value={report.overall_confidence} />}
        {report && (
          <span className="text-xs text-slate-500">
            {report.passes_run} search pass{report.passes_run === 1 ? '' : 'es'} · {total} sources
            {mix ? ` · ${mix.tier1} official` : ''}
          </span>
        )}
        {streaming && !report && <span className="sentinel-shimmer text-xs">researching…</span>}
      </button>

      {open && (
        <div className="space-y-5 border-t border-slate-100 px-4 py-4 sentinel-fade-in">
          {trace.intent && (
            <Section icon={Brain} title="1 · Understood your question (PAL)">
              <p className="text-sm text-slate-800">
                Goal: <strong className="font-semibold">{trace.intent.primary_intent}</strong>
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">Topic: {trace.intent.domain}</span>
                {trace.intent.tickers.map((t) => (
                  <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-slate-700">{t}</span>
                ))}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                  {trace.intent.time_sensitive ? 'Needs current data' : 'Timeless knowledge'}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">Clarity {pct(1 - trace.intent.ambiguity_score)}</span>
              </div>
            </Section>
          )}

          {trace.plan && (
            <Section icon={ListOrdered} title="2 · Research plan (NPAO: basics → risks → main answer → go deeper)">
              <ol className="space-y-1.5">
                {trace.plan.tasks.map((t, i) => {
                  const meta = CATEGORY_META[t.category];
                  const topic = topics.find((x) => x.id === t.id);
                  const tone = topic ? confidenceTone(topic.confidence) : null;
                  return (
                    <li key={t.id} className="rounded-xl border border-slate-200 p-2.5">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 font-mono text-[11px] text-slate-400">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] leading-snug text-slate-800">{t.question}</p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                            <span className={`rounded-full border px-1.5 py-px font-semibold ${meta.cls}`}>{meta.label}</span>
                            <span title="NPAO priority score (0-10)">Priority {t.priority.toFixed(1)}</span>
                            <span>·</span>
                            <span>{t.doer}</span>
                          </div>
                        </div>
                        {topic && topic.status !== 'deferred' && (
                          <div className="w-24 shrink-0 text-right">
                            <div className={`text-[11px] font-semibold ${tone!.text}`}>{topic.sourceIds.length ? pct(topic.confidence) : '—'}</div>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div className={`h-full rounded-full ${tone!.bar}`} style={{ width: pct(topic.confidence) }} />
                            </div>
                            <div className="mt-1 text-[10px] text-slate-400">{STATUS_LABEL[topic.status]}</div>
                          </div>
                        )}
                        {topic?.status === 'deferred' && <span className="shrink-0 text-[10px] text-slate-400">{STATUS_LABEL.deferred}</span>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Section>
          )}

          {report && (
            <Section icon={ScanSearch} title="3 · Search and source check (RAG DAL)">
              <p className="text-xs leading-relaxed text-slate-600">
                Searched in {report.passes_run} pass{report.passes_run === 1 ? '' : 'es'} until each answer reached {pct(report.threshold)} confidence or the time limit.
                Confidence = how many official or major sources agree, whether they contradict each other, source quality and how recent it is.
              </p>
              {total > 0 && (
                <div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="bg-emerald-500" style={{ width: `${(mix!.tier1 / total) * 100}%` }} />
                    <div className="bg-blue-500" style={{ width: `${(mix!.tier2 / total) * 100}%` }} />
                    <div className="bg-slate-300" style={{ width: `${(mix!.tier3 / total) * 100}%` }} />
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-slate-500">
                    <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />{mix!.tier1} official</span>
                    <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-500" />{mix!.tier2} major news</span>
                    <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-slate-300" />{mix!.tier3} community</span>
                  </div>
                </div>
              )}
              {(report.open_questions.length > 0 || report.gaps.length > 0) && (
                <ul className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
                  {[...report.open_questions, ...report.gaps].map((q) => (
                    <li key={q} className="flex gap-1.5">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {q}
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}

          {trace.hub && (
            <Section icon={Database} title="4 · Knowledge base (Hub)">
              <p className="text-xs leading-relaxed text-slate-600">
                {trace.hub.enabled
                  ? `Found ${trace.hub.context} related earlier finding${trace.hub.context === 1 ? '' : 's'} by meaning${trace.hub.reused.length ? `, reused ${trace.hub.reused.length} still-current answer${trace.hub.reused.length === 1 ? '' : 's'}` : ''}.${trace.hubSaved ? ` Saved ${trace.hubSaved} new verified finding${trace.hubSaved === 1 ? '' : 's'} for next time.` : ''}`
                  : 'Not connected yet, so this answer was researched from scratch.'}
              </p>
            </Section>
          )}
        </div>
      )}
    </section>
  );
};

const NEEDS_KEY_COPY: Record<NeedsKeyReason, { title: string; body: string; cta: string }> = {
  missing: {
    title: 'Connect your AI to start researching',
    body: 'Sentinel researches live on the web using your own free Google Gemini key. It takes about a minute and you only do it once.',
    cta: 'Connect AI key',
  },
  rejected: {
    title: 'Your AI key was not accepted',
    body: 'Google rejected the key. It may have been deleted or copied incorrectly. Paste a fresh key to continue.',
    cta: 'Update AI key',
  },
  'rate-limited': {
    title: 'Your AI key reached its limit',
    body: 'Google’s free tier allows a set number of requests per minute and per day. Wait a couple of minutes and ask again, or check your key’s limits.',
    cta: 'Check my key',
  },
};

export const NeedsKeyCard: React.FC<{ reason: NeedsKeyReason; onRetry?: () => void }> = ({ reason, onRetry }) => {
  const c = NEEDS_KEY_COPY[reason];
  return (
    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 sentinel-fade-in" role="status">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
          <KeyRound className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-900">{c.title}</h4>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{c.body}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={openAiKeySettings} className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700">
              {c.cta}
            </button>
            {onRetry && reason !== 'missing' && (
              <button type="button" onClick={onRetry} className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

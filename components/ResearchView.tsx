import React, { useEffect, useRef, useState } from 'react';
import { Plus, MessageSquareText, Trash2, TrendingUp, Landmark, Factory, FileSearch, History, X } from 'lucide-react';
import { ResearchFocus } from '../services/answerEngine';
import { useResearch } from './research/useResearch';
import { AnswerTurn, Composer } from './research/ResearchParts';
import { InlineDisclaimer } from './compliance/Compliance';

type ResearchApi = ReturnType<typeof useResearch>;

const STARTERS: { icon: React.ElementType; label: string; query: string; focus: ResearchFocus }[] = [
  { icon: Landmark, label: 'Macro', query: 'What are markets expecting from the next Fed meeting, and why?', focus: 'macro' },
  { icon: Factory, label: 'Commodities', query: 'How could rising beverage-can demand affect aluminum prices and producers?', focus: 'commodities' },
  { icon: TrendingUp, label: 'Stocks', query: 'What are the main bull and bear cases for semiconductor stocks right now?', focus: 'equities' },
  { icon: FileSearch, label: 'Filings', query: 'What should I look for first when reading a company 10-K?', focus: 'filings' },
];

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const HistoryList: React.FC<{ research: ResearchApi; onPick?: () => void }> = ({ research, onPick }) => {
  const { threads, activeId, setActiveId, deleteThread, newThread } = research;
  return (
    <div className="flex h-full flex-col">
      <button
        type="button"
        onClick={() => {
          newThread();
          onPick?.();
        }}
        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 shadow-xs hover:border-slate-300 hover:bg-slate-50"
      >
        <Plus className="w-4 h-4" /> New research
      </button>
      <div className="mt-5 mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">History</div>
      {threads.length === 0 ? (
        <p className="px-1 text-xs text-slate-400">Your research threads will appear here.</p>
      ) : (
        <ul className="-mx-1 flex-1 space-y-0.5 overflow-y-auto">
          {threads.map((t) => (
            <li key={t.id} className="group relative">
              <button
                type="button"
                onClick={() => {
                  setActiveId(t.id);
                  onPick?.();
                }}
                className={`w-full rounded-lg px-2.5 py-2 pr-8 text-left transition-colors ${
                  t.id === activeId ? 'bg-slate-900/5 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="truncate text-[13px] font-medium">{t.title}</div>
                <div className="text-[11px] text-slate-400">
                  {t.turns.length} {t.turns.length === 1 ? 'question' : 'questions'} · {timeAgo(t.updatedAt)}
                </div>
              </button>
              <button
                type="button"
                onClick={() => deleteThread(t.id)}
                aria-label={`Delete thread ${t.title}`}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-300 opacity-0 hover:bg-white hover:text-red-600 group-hover:opacity-100 focus:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const ResearchView: React.FC<{
  research: ResearchApi;
  pendingQuery?: { query: string; focus: ResearchFocus } | null;
  onPendingConsumed?: () => void;
}> = ({ research, pendingQuery, onPendingConsumed }) => {
  const { activeThread, ask, stop, regenerate, isStreaming } = research;
  const [focus, setFocus] = useState<ResearchFocus>('all');
  const [historyOpen, setHistoryOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const lastTurnCount = useRef(0);

  // Guard so a hand-off from the dashboard is only asked once
  // (React StrictMode runs effects twice in development).
  const consumedRef = useRef<object | null>(null);
  useEffect(() => {
    if (pendingQuery && consumedRef.current !== pendingQuery) {
      consumedRef.current = pendingQuery;
      ask(pendingQuery.query, pendingQuery.focus, { newThread: true });
      setFocus(pendingQuery.focus);
      onPendingConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuery]);

  // Scroll to the newest question when one is added.
  const turnCount = activeThread?.turns.length || 0;
  useEffect(() => {
    if (turnCount > lastTurnCount.current && turnCount > 1) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    lastTurnCount.current = turnCount;
  }, [turnCount]);

  const submit = (q: string, f: ResearchFocus) => ask(q, f);

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-8 min-h-[calc(100vh-12rem)]">
      {/* History rail (desktop) */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 h-[calc(100vh-8rem)]">
          <HistoryList research={research} />
        </div>
      </aside>

      {/* History drawer (mobile) */}
      {historyOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Research history">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setHistoryOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[82%] max-w-xs bg-slate-50 p-4 shadow-2xl sentinel-slide-in">
            <button onClick={() => setHistoryOpen(false)} aria-label="Close history" className="mb-3 rounded-lg p-1.5 text-slate-500 hover:bg-slate-200">
              <X className="w-4 h-4" />
            </button>
            <HistoryList research={research} onPick={() => setHistoryOpen(false)} />
          </div>
        </div>
      )}

      <div className="min-w-0">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <button onClick={() => setHistoryOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
            <History className="w-3.5 h-3.5" /> History
          </button>
          {activeThread && (
            <button onClick={research.newThread} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          )}
        </div>

        {!activeThread ? (
          /* ------------------------------ Empty state ------------------------------ */
          <div className="mx-auto flex max-w-2xl flex-col items-center pt-6 sm:pt-16 sentinel-fade-in">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
              <MessageSquareText className="w-6 h-6" />
            </div>
            <h1 className="mt-5 text-center text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
              What do you want to research?
            </h1>
            <p className="mt-2 text-center text-sm text-slate-500 max-w-md">
              Ask about any market, company or economic trend. Every answer shows its sources so you can check the facts.
            </p>
            <div className="mt-8 w-full">
              <Composer
                size="lg"
                autoFocus
                focus={focus}
                onFocusChange={setFocus}
                onSubmit={submit}
                isStreaming={isStreaming}
                onStop={stop}
              />
            </div>
            <div className="mt-6 grid w-full grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STARTERS.map((s) => (
                <button
                  key={s.query}
                  type="button"
                  onClick={() => ask(s.query, s.focus, { newThread: true })}
                  className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-left transition-all hover:-translate-y-px hover:border-slate-300 hover:shadow-sm"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700">
                    <s.icon className="w-4 h-4" />
                  </span>
                  <span>
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</span>
                    <span className="mt-0.5 block text-sm text-slate-700 leading-snug">{s.query}</span>
                  </span>
                </button>
              ))}
            </div>
            <InlineDisclaimer className="mt-8 justify-center text-center" />
          </div>
        ) : (
          /* ------------------------------ Thread view ------------------------------ */
          <div className="mx-auto max-w-3xl">
            <div className="space-y-10 divide-y divide-slate-100">
              {activeThread.turns.map((turn, i) => (
                <div key={turn.id} ref={i === activeThread.turns.length - 1 ? endRef : undefined} className={`scroll-mt-24 ${i > 0 ? 'pt-10' : ''}`}>
                  <AnswerTurn
                    turn={turn}
                    isLast={i === activeThread.turns.length - 1}
                    onFollowUp={(q) => ask(q, turn.focus)}
                    onRegenerate={turn.status === 'streaming' ? undefined : () => regenerate(turn.id)}
                  />
                </div>
              ))}
            </div>
            <div className="sticky bottom-4 z-20 mt-4 pb-2">
              <div className="rounded-[20px] bg-gradient-to-t from-white via-white/90 to-transparent pt-6">
                <Composer
                  placeholder="Ask a follow-up…"
                  focus={focus}
                  onFocusChange={setFocus}
                  onSubmit={submit}
                  isStreaming={isStreaming}
                  onStop={stop}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

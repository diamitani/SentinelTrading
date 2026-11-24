import React, { useEffect, useRef, useState } from 'react';
import { MessageSquareText, X, Maximize2, Plus } from 'lucide-react';
import { ResearchFocus } from '../services/answerEngine';
import { useResearch } from './research/useResearch';
import { AnswerTurn, Composer } from './research/ResearchParts';
import { InlineDisclaimer } from './compliance/Compliance';

type ResearchApi = ReturnType<typeof useResearch>;

const QUICK_PROMPTS = [
  'Summarize today’s biggest market risks',
  'Explain how options can lose value',
  'What moves aluminum prices?',
];

/**
 * Floating research assistant. Shares the same answer engine and history
 * as the full Research page, so a conversation can be opened full-screen.
 */
export const ChatAssistant: React.FC<{ research: ResearchApi; onOpenFull: () => void }> = ({
  research,
  onOpenFull,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focus, setFocus] = useState<ResearchFocus>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { activeThread, ask, stop, isStreaming, regenerate, newThread } = research;
  const lastTurn = activeThread?.turns[activeThread.turns.length - 1];

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [isOpen, activeThread?.turns.length, lastTurn?.answer.length]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div
          role="dialog"
          aria-label="Sentinel research assistant"
          className="mb-3 flex h-[min(640px,calc(100vh-6.5rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_64px_-16px_rgba(15,23,42,0.35)] sm:w-[420px] sentinel-pop origin-bottom-right"
        >
          <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white">
                <MessageSquareText className="w-4 h-4" />
              </span>
              <div>
                <div className="text-sm font-semibold text-slate-900">Ask Sentinel</div>
                <div className="text-[11px] text-slate-500">Cited answers · research only</div>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              {activeThread && (
                <button onClick={newThread} aria-label="New conversation" title="New conversation" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <Plus className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenFull();
                }}
                aria-label="Open full research view"
                title="Open full view"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button onClick={() => setIsOpen(false)} aria-label="Close assistant" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            {!activeThread ? (
              <div className="flex h-full flex-col justify-end">
                <p className="text-lg font-semibold tracking-tight text-slate-900">How can I help you research?</p>
                <p className="mt-1 text-sm text-slate-500">Answers include sources you can check.</p>
                <div className="mt-4 space-y-1.5">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q}
                      onClick={() => ask(q, 'all', { newThread: true })}
                      className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-left text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <InlineDisclaimer className="mt-4" />
              </div>
            ) : (
              <div className="space-y-8">
                {activeThread.turns.map((turn, i) => (
                  <AnswerTurn
                    key={turn.id}
                    turn={turn}
                    compact
                    isLast={i === activeThread.turns.length - 1}
                    onFollowUp={(q) => ask(q, turn.focus)}
                    onRegenerate={turn.status === 'streaming' ? undefined : () => regenerate(turn.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 p-3">
            <Composer
              size="sm"
              autoFocus
              showFocus={false}
              focus={focus}
              onFocusChange={setFocus}
              placeholder={activeThread ? 'Ask a follow-up…' : 'Ask about any market…'}
              onSubmit={(q, f) => ask(q, f)}
              isStreaming={isStreaming}
              onStop={stop}
            />
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? 'Close research assistant' : 'Open research assistant'}
        aria-expanded={isOpen}
        className={`group flex h-12 items-center gap-2 rounded-full pl-4 pr-5 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 ${
          isOpen ? 'bg-white text-slate-700 border border-slate-200' : 'bg-slate-900 text-white shadow-slate-900/25'
        }`}
      >
        {isOpen ? <X className="w-4 h-4" /> : <MessageSquareText className="w-4 h-4" />}
        <span className="hidden sm:inline">{isOpen ? 'Close' : 'Ask Sentinel'}</span>
        {isStreaming && !isOpen && <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />}
      </button>
    </div>
  );
};

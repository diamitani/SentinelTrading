import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  Square,
  Copy,
  Check,
  RotateCcw,
  Layers,
  CornerDownRight,
  Globe,
  Search,
  BookOpen,
  PenLine,
  Sparkles,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { AnswerSource, ResearchFocus } from '../../services/answerEngine';
import { ResearchTurn } from './useResearch';
import { Markdown } from './Markdown';
import { SHORT_DISCLOSURE } from '../compliance/Compliance';
import { ResearchTracePanel, NeedsKeyCard, TierChip, ConfidenceBadge } from './ResearchTrace';
import { Brain, ListOrdered, ScanSearch, Database } from 'lucide-react';

export const FOCUS_OPTIONS: { id: ResearchFocus; label: string; hint: string }[] = [
  { id: 'all', label: 'All markets', hint: 'Search across every source' },
  { id: 'equities', label: 'Stocks & ETFs', hint: 'Companies, sectors, funds' },
  { id: 'macro', label: 'Macro', hint: 'Rates, inflation, central banks' },
  { id: 'commodities', label: 'Commodities', hint: 'Metals, energy, futures' },
  { id: 'crypto', label: 'Digital assets', hint: 'Bitcoin, ETFs, on-chain' },
  { id: 'filings', label: 'SEC filings', hint: '10-K, 10-Q, 8-K' },
];

const favicon = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;

/* ------------------------------- Composer -------------------------------- */

export const Composer: React.FC<{
  onSubmit: (query: string, focus: ResearchFocus) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  size?: 'lg' | 'md' | 'sm';
  focus: ResearchFocus;
  onFocusChange: (f: ResearchFocus) => void;
  showFocus?: boolean;
}> = ({
  onSubmit,
  onStop,
  isStreaming,
  placeholder = 'Ask anything about markets…',
  autoFocus,
  size = 'md',
  focus,
  onFocusChange,
  showFocus = true,
}) => {
  const [value, setValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [value]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const submit = () => {
    if (!value.trim() || isStreaming) return;
    onSubmit(value.trim(), focus);
    setValue('');
  };

  const current = FOCUS_OPTIONS.find((f) => f.id === focus) || FOCUS_OPTIONS[0];
  const pad = size === 'lg' ? 'p-4' : size === 'md' ? 'p-3' : 'p-2.5';
  const textSize = size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <div
      className={`group relative rounded-2xl border border-slate-200 bg-white ${pad} shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] transition-all focus-within:border-slate-300 focus-within:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(37,99,235,0.25)]`}
    >
      <label htmlFor={`composer-${size}`} className="sr-only">
        Ask a research question
      </label>
      <textarea
        id={`composer-${size}`}
        ref={ref}
        rows={1}
        value={value}
        maxLength={2000}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        className={`block w-full resize-none bg-transparent px-1.5 py-1 ${textSize} text-slate-900 placeholder:text-slate-400 focus:outline-none`}
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        {showFocus ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {current.label}
              <ChevronDown className={`w-3 h-3 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
            {menuOpen && (
              <div role="listbox" className="absolute bottom-full left-0 mb-2 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 sentinel-pop">
                {FOCUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    role="option"
                    aria-selected={opt.id === focus}
                    type="button"
                    onClick={() => {
                      onFocusChange(opt.id);
                      setMenuOpen(false);
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                      opt.id === focus ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-[11px] text-slate-500">{opt.hint}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          {value.length > 1500 && (
            <span className="text-[11px] tabular-nums text-slate-400">{value.length}/2000</span>
          )}
          {isStreaming && onStop ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop generating"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-700 transition-colors"
            >
              <Square className="w-3 h-3 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!value.trim()}
              aria-label="Send question"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------------------------- Research steps ----------------------------- */

const STEP_ICON: Record<string, React.ElementType> = {
  'pal-intent': Brain,
  hub: Database,
  'hub-save': Database,
  npao: ListOrdered,
  'ragdal-1': ScanSearch,
  'ragdal-2': ScanSearch,
  'ragdal-3': ScanSearch,
  'ragdal-4': ScanSearch,
  plan: Sparkles,
  review: ShieldCheck,
  search: Search,
  read: BookOpen,
  write: PenLine,
};

const ResearchSteps: React.FC<{ turn: ResearchTurn }> = ({ turn }) => {
  const [open, setOpen] = useState(true);
  const active = turn.status === 'streaming';
  useEffect(() => {
    if (!active && turn.answer) setOpen(false);
  }, [active, turn.answer]);
  if (!turn.steps.length) {
    return active ? (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="sentinel-shimmer">Starting research…</span>
      </div>
    ) : null;
  }
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
        aria-expanded={open}
      >
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? '' : '-rotate-90'}`} />
        {active ? (
          <span className="sentinel-shimmer">{turn.steps[turn.steps.length - 1].label}</span>
        ) : (
          <span>
            Researched {turn.sources.length} source{turn.sources.length === 1 ? '' : 's'} in{' '}
            {turn.steps.length} steps
          </span>
        )}
      </button>
      {open && (
        <ol className="mt-2.5 ml-1.5 space-y-2 border-l border-slate-200 pl-4">
          {turn.steps.map((s, i) => {
            const Icon = STEP_ICON[s.step] || Sparkles;
            const isCurrent = active && i === turn.steps.length - 1;
            return (
              <li key={s.step} className="relative flex items-center gap-2 text-xs text-slate-600 sentinel-fade-in">
                <span
                  className={`absolute -left-[22px] flex h-3 w-3 items-center justify-center rounded-full border ${
                    isCurrent ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isCurrent ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'}`} />
                </span>
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <span className={isCurrent ? 'sentinel-shimmer' : ''}>{s.label}</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

/* -------------------------------- Sources -------------------------------- */

const SourceCard: React.FC<{ source: AnswerSource }> = ({ source }) => (
  <a
    href={source.url}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex h-full min-w-[170px] max-w-[220px] flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm sm:min-w-0 sm:max-w-none"
  >
    <span className="line-clamp-2 text-xs font-medium leading-snug text-slate-800 group-hover:text-slate-900">
      {source.title}
    </span>
    <span className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
      <img src={favicon(source.domain)} alt="" className="h-3.5 w-3.5 rounded-sm" loading="lazy" />
      <span className="truncate">{source.domain}</span>
      <span className="ml-auto font-mono text-slate-400">{source.id}</span>
    </span>
    {source.tier && (
      <span className="mt-1.5">
        <TierChip source={source} />
      </span>
    )}
  </a>
);

const SourcesRow: React.FC<{ sources: AnswerSource[]; loading: boolean; compact?: boolean }> = ({
  sources,
  loading,
  compact,
}) => {
  const [showAll, setShowAll] = useState(false);
  if (!sources.length && !loading) return null;
  const visible = showAll ? sources : sources.slice(0, compact ? 3 : 4);
  const extra = sources.length - visible.length;
  return (
    <section aria-label="Sources">
      <h4 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Layers className="w-4 h-4 text-slate-400" /> Sources
      </h4>
      {!sources.length ? (
        <div className={`grid gap-2 ${compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
          {Array.from({ length: compact ? 3 : 4 }).map((_, i) => (
            <div key={i} className="h-[72px] rounded-xl bg-slate-100 sentinel-skeleton" />
          ))}
        </div>
      ) : (
        <div
          className={`flex gap-2 overflow-x-auto pb-1 sm:grid sm:overflow-visible ${
            compact ? 'sm:grid-cols-3' : 'sm:grid-cols-4'
          }`}
        >
          {visible.map((s) => (
            <SourceCard key={s.id} source={s} />
          ))}
          {extra > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="flex min-w-[120px] flex-col items-start justify-between rounded-xl border border-dashed border-slate-200 p-3 text-left text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="flex -space-x-1">
                {sources.slice(visible.length, visible.length + 3).map((s) => (
                  <img key={s.id} src={favicon(s.domain)} alt="" className="h-4 w-4 rounded-full ring-2 ring-white" />
                ))}
              </span>
              <span className="mt-2 font-medium">View {extra} more</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
};

/* ------------------------------- Answer turn ------------------------------ */

export const AnswerTurn: React.FC<{
  turn: ResearchTurn;
  onFollowUp: (q: string) => void;
  onRegenerate?: () => void;
  compact?: boolean;
  isLast?: boolean;
}> = ({ turn, onFollowUp, onRegenerate, compact, isLast }) => {
  const [copied, setCopied] = useState(false);
  const streaming = turn.status === 'streaming';

  const copy = async () => {
    const refs = turn.sources.map((s) => `[${s.id}] ${s.title} — ${s.url}`).join('\n');
    try {
      await navigator.clipboard.writeText(
        `${turn.query}\n\n${turn.answer}${refs ? `\n\nSources:\n${refs}` : ''}\n\n${SHORT_DISCLOSURE}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <article className={`space-y-5 ${compact ? '' : 'pb-8'} sentinel-fade-in`} aria-busy={streaming}>
      <h2
        className={`${
          compact ? 'text-base' : 'text-2xl sm:text-[28px]'
        } font-semibold tracking-tight text-slate-900 leading-snug break-words`}
      >
        {turn.query}
      </h2>

      {turn.needsKey ? (
        <NeedsKeyCard reason={turn.needsKey} onRetry={onRegenerate} />
      ) : (
        <>
          <ResearchSteps turn={turn} />
          {!compact && <ResearchTracePanel trace={turn.trace} streaming={streaming} />}
        </>
      )}

      {!turn.needsKey && <SourcesRow sources={turn.sources} loading={streaming && !turn.answer} compact={compact} />}

      {(turn.answer || (streaming && turn.sources.length > 0)) && (
        <section aria-label="Answer">
          <h4 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Sparkles className="w-4 h-4 text-blue-600" /> Answer
            {turn.trace?.report && <ConfidenceBadge value={turn.trace.report.overall_confidence} />}
          </h4>
          {turn.answer ? (
            <Markdown text={turn.answer} sources={turn.sources} streaming={streaming} compact={compact} />
          ) : (
            <div className="space-y-2.5">
              {[92, 100, 78, 85].map((w, i) => (
                <div key={i} className="h-3.5 rounded-full bg-slate-100 sentinel-skeleton" style={{ width: `${w}%` }} />
              ))}
            </div>
          )}
        </section>
      )}

      {turn.status === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-center justify-between gap-3">
          <span>{turn.error || 'Something went wrong.'}</span>
          {onRegenerate && (
            <button onClick={onRegenerate} className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-red-700 border border-red-200 hover:bg-red-100">
              Try again
            </button>
          )}
        </div>
      )}
      {turn.status === 'stopped' && (
        <p className="text-xs text-slate-400">Generation stopped.</p>
      )}

      {!streaming && turn.answer && (
        <>
          <div className="flex flex-wrap items-center gap-1 border-t border-slate-100 pt-3">
            <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            {onRegenerate && (
              <button onClick={onRegenerate} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                <RotateCcw className="w-3.5 h-3.5" /> Rewrite
              </button>
            )}
            {turn.complianceFlags.length > 0 && (
              <span
                title={`Softened: ${turn.complianceFlags.join(', ')}`}
                className="ml-auto inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] text-slate-500"
              >
                <ShieldCheck className="w-3 h-3" /> Compliance review applied
              </span>
            )}
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">{turn.disclosure || SHORT_DISCLOSURE}</p>
        </>
      )}

      {isLast && !streaming && turn.related.length > 0 && (
        <section aria-label="Related questions">
          <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CornerDownRight className="w-4 h-4 text-slate-400" /> Related
          </h4>
          <ul className="divide-y divide-slate-100">
            {turn.related.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => onFollowUp(q)}
                  className="group flex w-full items-center justify-between gap-3 py-2.5 text-left text-sm text-slate-700 hover:text-blue-700"
                >
                  <span>{q}</span>
                  <span className="text-lg leading-none text-slate-300 group-hover:text-blue-600">+</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
};

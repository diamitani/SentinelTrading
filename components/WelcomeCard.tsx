import React, { useState } from 'react';
import { Check, MessageSquareText, Wallet, TrendingUp, X, DollarSign } from 'lucide-react';
import { UserProfile } from '../services/authService';
import { EVERYDAY_BUDGET_PRESETS } from '../services/paperPortfolioService';

interface WelcomeCardProps {
  user: UserProfile;
  startingBudget: number;
  onSelectBudget: (amount: number) => void;
  onOpenUpgrade?: () => void;
  onAsk: (question: string) => void;
  onOpenIdeas: () => void;
  onOpenSimulator: () => void;
}

type StepId = 'ask' | 'paper' | 'simulate';

const load = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
};

export const WelcomeCard: React.FC<WelcomeCardProps> = ({
  user,
  startingBudget,
  onSelectBudget,
  onOpenUpgrade,
  onAsk,
  onOpenIdeas,
  onOpenSimulator,
}) => {
  const storageKey = `sentinel_onboarding_${user.id}`;
  const saved = load(storageKey) as { done: StepId[]; dismissed: boolean } | null;
  const [done, setDone] = useState<StepId[]>(saved?.done ?? []);
  const [dismissed, setDismissed] = useState<boolean>(saved?.dismissed ?? false);
  const [customBudget, setCustomBudget] = useState<string>('');

  const persist = (next: { done: StepId[]; dismissed: boolean }) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  if (dismissed) return null;

  const firstName = user.isGuest ? 'Guest' : user.fullName.split(' ')[0] || 'there';
  const isBeginner = user.plan === 'beginner';

  const steps: { id: StepId; icon: React.ElementType; title: string; body: string; cta: string; run: () => void }[] = [
    {
      id: 'ask',
      icon: MessageSquareText,
      title: 'Ask a live market question',
      body: isBeginner
        ? 'Ask anything in plain English—Sentinel checks 100 live financial feeds and explains clearly.'
        : 'Get a sourced brief combining live RSS headlines, Yahoo quotes, and US Treasury rates.',
      cta: 'Ask now',
      run: () =>
        onAsk(
          isBeginner
            ? 'What is moving stocks and US Treasury bond yields today, in plain English?'
            : 'Summarize the biggest live stories across equities, Fed policy, AI, and cybersecurity today.'
        ),
    },
    {
      id: 'paper',
      icon: Wallet,
      title: 'Place your first paper trade',
      body: `Allocate part of your $${startingBudget.toLocaleString()} virtual cash to test an idea risk-free.`,
      cta: 'Browse ideas',
      run: onOpenIdeas,
    },
    {
      id: 'simulate',
      icon: TrendingUp,
      title: 'Map out steady growth',
      body: 'Model how small monthly contributions can compound over time—realistic math, no promises.',
      cta: 'Open simulator',
      run: onOpenSimulator,
    },
  ];

  const complete = (id: StepId) => {
    const next = done.includes(id) ? done : [...done, id];
    setDone(next);
    persist({ done: next, dismissed: false });
  };

  const dismiss = () => {
    setDismissed(true);
    persist({ done, dismissed: true });
  };

  const applyCustomBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(customBudget);
    if (Number.isFinite(val) && val >= 25) {
      onSelectBudget(val);
      setCustomBudget('');
    }
  };

  return (
    <section
      aria-label="Getting started"
      className="sentinel-fade-in mb-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">
            GETTING STARTED · {done.length}/3 COMPLETED
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
            Welcome, {firstName}. Set your practice budget.
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Pick a virtual starting amount that matches your real comfort zone. You can change or reset it anytime.
            {user.isGuest && onOpenUpgrade && (
              <>
                {' '}
                <button
                  type="button"
                  onClick={onOpenUpgrade}
                  className="font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-800"
                >
                  Save progress with email
                </button>
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Hide getting started"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Inline Starting Budget Picker ($100 to $50,000+) */}
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-[#FAFAF9] p-3">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 mr-1">
          <DollarSign className="h-3.5 w-3.5 text-blue-600" />
          Starting budget:
        </span>
        {EVERYDAY_BUDGET_PRESETS.map((amt) => {
          const active = Math.round(startingBudget) === amt;
          return (
            <button
              key={amt}
              type="button"
              onClick={() => onSelectBudget(amt)}
              className={`rounded-lg px-2.5 py-1 font-mono text-xs font-semibold tabular-nums transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700'
              }`}
            >
              ${amt.toLocaleString()}
            </button>
          );
        })}
        <form onSubmit={applyCustomBudget} className="ml-auto flex items-center gap-1.5">
          <input
            type="number"
            min={25}
            max={1000000}
            value={customBudget}
            onChange={(e) => setCustomBudget(e.target.value)}
            placeholder="Custom $"
            className="w-24 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-mono text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
          {customBudget && (
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Set
            </button>
          )}
        </form>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {steps.map((s, i) => {
          const isDone = done.includes(s.id);
          return (
            <div
              key={s.id}
              className={`flex flex-col rounded-xl border bg-[#FAFAF9] p-4 ${
                isDone ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    isDone ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : <s.icon className="h-4 w-4" />}
                </span>
                <span className="font-mono text-[11px] font-semibold text-slate-400">STEP {i + 1}</span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">{s.title}</h3>
              <p className="mt-1 flex-1 text-[13px] leading-relaxed text-slate-600">{s.body}</p>
              <button
                type="button"
                onClick={() => {
                  complete(s.id);
                  s.run();
                }}
                className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  isDone
                    ? 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isDone ? 'Do it again' : s.cta}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

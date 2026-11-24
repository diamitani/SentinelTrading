import React, { useState } from 'react';
import { Check, MessageSquareText, Wallet, TrendingUp, X } from 'lucide-react';
import { UserProfile } from '../services/authService';
import { getPlan } from '../config/plans';

// "Getting started" checklist shown at the top of the dashboard until the
// person finishes it or closes it. Progress is remembered per account.

interface WelcomeCardProps {
  user: UserProfile;
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

export const WelcomeCard: React.FC<WelcomeCardProps> = ({ user, onAsk, onOpenIdeas, onOpenSimulator }) => {
  const storageKey = `sentinel_onboarding_${user.id}`;
  const saved = load(storageKey) as { done: StepId[]; dismissed: boolean } | null;
  const [done, setDone] = useState<StepId[]>(saved?.done ?? []);
  const [dismissed, setDismissed] = useState<boolean>(saved?.dismissed ?? false);

  const persist = (next: { done: StepId[]; dismissed: boolean }) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  if (dismissed) return null;

  const plan = getPlan(user.plan);
  const firstName = user.fullName.split(' ')[0] || 'there';
  const isBeginner = plan.id === 'beginner';

  const steps: { id: StepId; icon: React.ElementType; title: string; body: string; cta: string; run: () => void }[] = [
    {
      id: 'ask',
      icon: MessageSquareText,
      title: 'Ask your first question',
      body: isBeginner ? 'Start simple. No question is too basic.' : 'Get a sourced answer on anything moving markets.',
      cta: 'Ask now',
      run: () =>
        onAsk(
          isBeginner
            ? "I'm new to investing. In simple terms, what's the difference between a stock, an ETF and a bond?"
            : 'What are the biggest market-moving stories this week, and why do they matter?'
        ),
    },
    {
      id: 'paper',
      icon: Wallet,
      title: 'Try a paper trade',
      body: 'Pick an idea and practice with pretend money. Nothing real is bought.',
      cta: 'See ideas',
      run: onOpenIdeas,
    },
    {
      id: 'simulate',
      icon: TrendingUp,
      title: 'See how small amounts can grow',
      body: 'Play with the growth simulator. It shows what-ifs, not promises.',
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

  return (
    <section aria-label="Getting started" className="sentinel-fade-in mb-6 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Welcome, {firstName} 👋</h2>
          <p className="mt-1 text-sm text-slate-600">
            You're on the <strong className="text-slate-900">{plan.name}</strong> plan. Here are three quick things to try first
            ({done.length}/3 done).
          </p>
        </div>
        <button type="button" onClick={dismiss} aria-label="Hide getting started" className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {steps.map((s, i) => {
          const isDone = done.includes(s.id);
          return (
            <div key={s.id} className={`flex flex-col rounded-xl border bg-white p-4 ${isDone ? 'border-emerald-200' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2.5">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDone ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}>
                  {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : <s.icon className="h-4 w-4" />}
                </span>
                <span className="text-xs font-semibold text-slate-400">STEP {i + 1}</span>
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
                  isDone ? 'border border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-slate-900 text-white hover:bg-slate-800'
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

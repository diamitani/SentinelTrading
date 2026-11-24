import React, { useState } from 'react';
import { ArrowLeft, Check, Loader2, MailCheck } from 'lucide-react';
import { PLANS, PlanId, DEFAULT_PLAN, BILLING_ENABLED, getPlan, isPlanId, priceLabel } from '../config/plans';
import { signUp, logIn, UserProfile, AUTH_MODE } from '../services/authService';
import { ROUTES, getQueryParam, linkClick } from '../lib/router';
import { recordRiskAcknowledgement, DisclosuresModal } from './compliance/Compliance';
import { Logo } from './Logo';

interface AuthPageProps {
  mode: 'signup' | 'login';
  onAuthed: (user: UserProfile) => void;
}

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600';

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onAuthed }) => {
  const startingPlan = getQueryParam('plan');
  const [step, setStep] = useState<1 | 2>(1);
  const [plan, setPlan] = useState<PlanId>(isPlanId(startingPlan) ? startingPlan : DEFAULT_PLAN);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [disclosuresOpen, setDisclosuresOpen] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError('Please tick the box to confirm you understand the risks.');
      return;
    }
    setLoading(true);
    try {
      const result = await signUp({ email, password, fullName, plan });
      recordRiskAcknowledgement();
      if (result.needsEmailConfirmation) setCheckEmail(true);
      else if (result.user) onAuthed(result.user);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      onAuthed(await logIn(email, password));
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------ Layout ---------------------------------- */

  const shell = (children: React.ReactNode, wide = false) => (
    <div className="flex min-h-screen flex-col bg-[#fafaf9]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        {mode === 'signup' ? (
          <span className="text-sm text-slate-600">
            Have an account?{' '}
            <a href={ROUTES.login} onClick={linkClick(ROUTES.login)} className="font-semibold text-blue-700 hover:underline">
              Log in
            </a>
          </span>
        ) : (
          <span className="text-sm text-slate-600">
            New here?{' '}
            <a href={ROUTES.signup} onClick={linkClick(ROUTES.signup)} className="font-semibold text-blue-700 hover:underline">
              Start free
            </a>
          </span>
        )}
      </header>
      <main className={`mx-auto w-full flex-1 px-4 pb-16 pt-4 sm:px-6 sm:pt-10 ${wide ? 'max-w-4xl' : 'max-w-md'}`}>
        {AUTH_MODE === 'preview' && (
          <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-900">
            <strong>Preview mode:</strong> accounts are saved in this browser only until the database is connected.
          </p>
        )}
        {children}
      </main>
      <DisclosuresModal isOpen={disclosuresOpen} onClose={() => setDisclosuresOpen(false)} />
    </div>
  );

  const errorBox = error && (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      {error}
    </div>
  );

  /* ------------------------------- Log in ---------------------------------- */

  if (mode === 'login') {
    return shell(
      <div className="sentinel-fade-in">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-1.5 text-sm text-slate-600">Log in to open your dashboard.</p>
        <form onSubmit={handleLogIn} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {errorBox}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@example.com" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
            <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          </label>
          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>
    );
  }

  /* --------------------------- Check your email ---------------------------- */

  if (checkEmail) {
    return shell(
      <div className="sentinel-fade-in rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <MailCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-900">Check your email</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          We sent a confirmation link to <strong>{email}</strong>. Click it and you'll land straight in your dashboard.
        </p>
      </div>
    );
  }

  /* ------------------------ Sign up, step 1: plan ------------------------- */

  const selected = getPlan(plan);

  if (step === 1) {
    return shell(
      <div className="sentinel-fade-in">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Step 1 of 2</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Where are you starting?</h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Pick the one that sounds most like you. You can change it later.
          {!BILLING_ENABLED && ' All plans are free during early access, and no card is needed.'}
        </p>

        <div role="radiogroup" aria-label="Choose a plan" className="mt-6 grid gap-3 md:grid-cols-3">
          {PLANS.map((p) => {
            const active = p.id === plan;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPlan(p.id)}
                className={`relative flex flex-col rounded-2xl border bg-white p-5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  active ? 'border-blue-600 ring-1 ring-blue-600 shadow-md' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-base font-bold text-slate-900">{p.name}</div>
                    <div className="mt-0.5 text-sm text-slate-600">“{p.who}”</div>
                  </div>
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'}`}>
                    {active && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-slate-900">{priceLabel(p)}</span>
                  {!BILLING_ENABLED && p.price > 0 && <span className="text-xs font-medium text-emerald-700">free in early access</span>}
                </div>
                {p.recommended && (
                  <span className="mt-2 inline-flex w-fit rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                    Best place to start
                  </span>
                )}
                <ul className="mt-3 space-y-1.5 text-[13px] text-slate-600">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
          >
            Continue with {selected.name}
          </button>
        </div>
      </div>,
      true
    );
  }

  /* ----------------------- Sign up, step 2: details ----------------------- */

  return shell(
    <div className="sentinel-fade-in">
      <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-blue-700">Step 2 of 2</p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Create your account</h1>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-sm">
        <span className="text-slate-700">
          Plan: <strong className="text-slate-900">{selected.name}</strong> · {priceLabel(selected)}
          {!BILLING_ENABLED && selected.price > 0 && ' (free in early access)'}
        </span>
        <button type="button" onClick={() => setStep(1)} className="font-semibold text-blue-700 hover:underline">
          Change
        </button>
      </div>

      <form onSubmit={handleSignUp} className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {errorBox}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Your name</span>
          <input required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="First and last name" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@example.com" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
          <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="At least 8 characters" />
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
          <span className="text-[13px] leading-relaxed text-slate-700">
            I understand Sentinel is an educational research tool, not investment advice, and that investing can lose money. I agree to the{' '}
            <button type="button" onClick={() => setDisclosuresOpen(true)} className="font-medium text-blue-700 underline underline-offset-2">
              disclosures
            </button>
            .
          </span>
        </label>
        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Creating your account…' : 'Create account and open dashboard'}
        </button>
      </form>
    </div>
  );
};

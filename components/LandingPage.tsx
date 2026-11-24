import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, ChevronDown, MessageSquareText, FileSearch, Wallet, ShieldCheck } from 'lucide-react';
import { PLANS, BILLING_ENABLED, priceLabel } from '../config/plans';
import { ROUTES, linkClick } from '../lib/router';
import { UserProfile } from '../services/authService';
import { SHORT_DISCLOSURE, DisclosuresModal } from './compliance/Compliance';
import { Logo } from './Logo';
import { track } from '../services/funnel';

const STEPS = [
  {
    icon: MessageSquareText,
    title: 'Ask in plain English',
    body: '“Why did oil jump today?” “What is an ETF?” Sentinel answers like a patient friend, with no jargon.',
  },
  {
    icon: FileSearch,
    title: 'See where it came from',
    body: 'Every answer shows its sources, so you can check the facts yourself instead of trusting a stranger online.',
  },
  {
    icon: Wallet,
    title: 'Practice with fake money',
    body: 'Try your ideas as paper trades. Learn what happens before a single real dollar is on the line.',
  },
];

const FAQS = [
  {
    q: 'Do I need money to start?',
    a: 'No. The Beginner plan is free, and paper trading uses pretend money, so you can learn without risking anything.',
  },
  {
    q: 'Does Sentinel buy or sell stocks for me?',
    a: 'No. Sentinel never places real trades and never touches your money. It is a research and learning tool. If you decide to invest, you do that yourself with your own broker.',
  },
  {
    q: 'Is this investment advice?',
    a: 'No. Sentinel gives general, educational information. It doesn’t know your full financial situation, and AI can make mistakes. Always check the sources, and consider talking to a licensed professional before investing.',
  },
  {
    q: 'I’ve never invested before. Is this for me?',
    a: 'Yes. That’s exactly who the Beginner plan is for. Start by asking basic questions, then try a paper trade when you feel ready.',
  },
  {
    q: 'Can I change my plan later?',
    a: BILLING_ENABLED
      ? 'Yes, you can switch plans at any time from your account.'
      : 'Yes. And during early access every plan is free, with no card needed.',
  },
];

export const LandingPage: React.FC<{ user: UserProfile | null }> = ({ user }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [disclosuresOpen, setDisclosuresOpen] = useState(false);
  useEffect(() => {
    if (!user) track('landing_view');
  }, [user]);
  // Every "start" button records which spot on the page converted.
  const ctaClick = (to: string, where: string) => (e: React.MouseEvent) => {
    if (!user) track('cta_click', { props: { where } });
    linkClick(to)(e);
  };

  const primaryCta = user
    ? { href: ROUTES.app, label: 'Open your dashboard' }
    : { href: `${ROUTES.signup}?plan=beginner`, label: 'Start free' };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900">
      {/* ------------------------------ Nav ------------------------------ */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-[#fafaf9]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#how" className="hover:text-slate-900">How it works</a>
            <a href="#plans" className="hover:text-slate-900">Plans</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            {!user && (
              <a href={ROUTES.login} onClick={linkClick(ROUTES.login)} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
                Log in
              </a>
            )}
            <a
              href={primaryCta.href}
              onClick={ctaClick(primaryCta.href, 'nav')}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              {user ? 'Dashboard' : 'Start free'}
            </a>
          </div>
        </div>
      </header>

      {/* ------------------------------ Hero ----------------------------- */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
          style={{ background: 'radial-gradient(60% 60% at 50% 0%, rgba(37,99,235,0.10) 0%, rgba(250,250,249,0) 70%)' }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.1fr_1fr]">
          <div className="sentinel-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Made for beginners. Useful for pros.
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
              Understand the market <span className="text-blue-600">before</span> you put money in it.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Sentinel is an AI research assistant that explains what’s moving markets in plain English, shows you its
              sources, and lets you practice with paper trades before you risk real money.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={primaryCta.href}
                onClick={ctaClick(primaryCta.href, 'hero')}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-blue-600/20 transition-colors hover:bg-blue-700"
              >
                {primaryCta.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a href="#how" className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-50">
                See how it works
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-500">Free to start · No card needed · Takes under a minute</p>
          </div>

          {/* Product preview: built in HTML so it stays sharp and honest */}
          <div className="sentinel-pop relative">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ask Sentinel</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Example</span>
              </div>
              <div className="mt-4 ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-md bg-slate-900 px-4 py-2.5 text-sm text-white">
                What happens to stocks when the Fed cuts interest rates?
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
                <p>
                  <strong className="text-slate-900">Short answer:</strong> lower rates make borrowing cheaper, which
                  <em> can</em> help company profits and stock prices, but it isn’t guaranteed.
                </p>
                <ul className="space-y-1.5 pl-4 [list-style:disc] marker:text-slate-300">
                  <li>Cheaper loans can help businesses grow and people spend.</li>
                  <li>Savings accounts and bonds pay less, so some money moves into stocks.</li>
                  <li>But a cut can also signal the economy is slowing, and markets sometimes fall.</li>
                </ul>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                  <span className="flex h-4 w-4 items-center justify-center rounded bg-white text-[9px] font-bold text-slate-500 ring-1 ring-slate-200">1</span>
                  federalreserve.gov
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                  <span className="flex h-4 w-4 items-center justify-center rounded bg-white text-[9px] font-bold text-slate-500 ring-1 ring-slate-200">2</span>
                  investor.gov
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
                <span className="text-xs font-medium text-emerald-800">Want to test an idea? Try it as a paper trade, no real money.</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------- How it works ------------------------- */}
      <section id="how" className="scroll-mt-20 border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Learn first. Then decide.
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Most beginners lose money because they buy on hype. Sentinel slows you down in the right places.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-slate-200 bg-[#fafaf9] p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-400">STEP {i + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ Plans ---------------------------- */}
      <section id="plans" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Start where you are</h2>
            <p className="mt-3 text-lg text-slate-600">
              Brand new? Start with Beginner. It’s free.
              {!BILLING_ENABLED && ' During early access, every plan is free.'}
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PLANS.map((p) => {
              const href = `${ROUTES.signup}?plan=${p.id}`;
              return (
                <div
                  key={p.id}
                  className={`relative flex flex-col rounded-2xl border bg-white p-7 ${
                    p.recommended ? 'border-blue-600 shadow-xl shadow-blue-600/10 ring-1 ring-blue-600' : 'border-slate-200'
                  }`}
                >
                  {p.recommended && (
                    <span className="absolute -top-3 left-7 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                      Best place to start
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">“{p.who}”</p>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight text-slate-900">{priceLabel(p)}</span>
                    {!BILLING_ENABLED && p.price > 0 && (
                      <span className="text-sm font-medium text-emerald-700">free in early access</span>
                    )}
                  </div>
                  <p className="mt-3 text-[15px] text-slate-600">{p.tagline}</p>
                  <ul className="mt-6 flex-1 space-y-3 text-[15px] text-slate-700">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={user ? ROUTES.app : href}
                    onClick={ctaClick(user ? ROUTES.app : href, `plan_${p.id}`)}
                    className={`mt-8 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${
                      p.recommended ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {user ? 'Open dashboard' : p.price === 0 ? 'Start free' : `Start with ${p.name}`}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------- FAQ ----------------------------- */}
      <section id="faq" className="scroll-mt-20 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Questions</h2>
          <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    {f.q}
                    <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && <p className="px-5 pb-5 text-[15px] leading-relaxed text-slate-600">{f.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------- Final CTA -------------------------- */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-3xl bg-slate-900 px-8 py-12 text-white sm:px-12 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Your first question is free.</h2>
            <p className="mt-2 text-slate-300">Create an account in under a minute. No card needed.</p>
          </div>
          <a
            href={primaryCta.href}
            onClick={ctaClick(primaryCta.href, 'footer_band')}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-900 transition-colors hover:bg-blue-50"
          >
            {primaryCta.label} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* ------------------------------ Footer --------------------------- */}
      <footer className="border-t border-slate-200 px-4 py-10 text-sm text-slate-500 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <Logo />
            <div className="flex items-center gap-5">
              <a href={ROUTES.login} onClick={linkClick(ROUTES.login)} className="hover:text-slate-900">Log in</a>
              <button type="button" onClick={() => setDisclosuresOpen(true)} className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900">
                Disclosures
              </button>
            </div>
          </div>
          <p className="flex max-w-4xl items-start gap-2 text-xs leading-relaxed">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              {SHORT_DISCLOSURE} Sentinel Trading is not a registered broker-dealer or investment adviser. AI-generated
              content may be inaccurate. Paper trades and simulations are hypothetical.
            </span>
          </p>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Sentinel Trading</p>
        </div>
      </footer>

      <DisclosuresModal isOpen={disclosuresOpen} onClose={() => setDisclosuresOpen(false)} />
    </div>
  );
};

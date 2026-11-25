import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  MessageSquareText,
  FileSearch,
  Wallet,
  ShieldCheck,
  Radio,
  Clock,
  Check,
  TrendingUp,
  Layers,
  Globe,
} from 'lucide-react';
import { ROUTES, linkClick } from '../lib/router';
import { UserProfile } from '../services/authService';
import { SHORT_DISCLOSURE, DisclosuresModal } from './compliance/Compliance';
import { Logo } from './Logo';

interface LandingPageProps {
  user: UserProfile | null;
  onEnterGuest: () => void;
}

type TraderStageId = 'beginner' | 'builder' | 'active';

const TRADER_STAGES: Record<
  TraderStageId,
  {
    id: TraderStageId;
    tabLabel: string;
    budgetRange: string;
    headline: string;
    summary: string;
    dailyFit: string;
    highlights: string[];
    samplePrompt: string;
    sampleAnswer: string;
  }
> = {
  beginner: {
    id: 'beginner',
    tabLabel: 'Starting with $100',
    budgetRange: '$100 – $1,000',
    headline: 'Learn the language of markets without risking a paycheck.',
    summary:
      'Start with a $100 or $500 virtual paper portfolio. Ask plain-English questions about ETFs, government bonds, or news headlines and see real cited sources—never hype.',
    dailyFit: '5 minutes with morning coffee to understand one headline before work.',
    highlights: [
      'Plain-English AI answers grounded in 100 live financial feeds',
      'Pick a $100, $500, or $1,000 virtual starting budget to practice risk-free',
      'Clear risk checks on every research idea before you click anything',
    ],
    samplePrompt: 'Why do US Treasury bond rates affect mortgage rates and tech stocks?',
    sampleAnswer:
      'Higher Treasury yields raise borrowing costs for homebuyers and make future company profits worth less today—which is why REITs and growth stocks watch the 10-year yield closely.',
  },
  builder: {
    id: 'builder',
    tabLabel: 'Growing $1K–$10K',
    budgetRange: '$1,000 – $10,000',
    headline: 'Research real catalysts across stocks, bonds, real estate, and AI.',
    summary:
      'Connect the dots between Federal Reserve releases, SEC 8-K filings, PitchBook deal flow, and cybersecurity advisories. Test every thesis in your paper portfolio first.',
    dailyFit: '10 minutes at lunch or after market close to review your watchlist and test ideas.',
    highlights: [
      'Live RSS & API feeds from Seeking Alpha, WSJ, Fed, HousingWire, CISA & SEC EDGAR',
      'Live US Treasury bond yields and Polymarket probability tracker side by side',
      'Track virtual holdings, cost basis, and simulated P&L across sessions',
    ],
    samplePrompt: 'How do major CISA cybersecurity advisories impact CrowdStrike, Palo Alto, and CIBR?',
    sampleAnswer:
      'High-severity federal advisories tend to accelerate enterprise endpoint and firewall renewal cycles, lifting sector attention while raising execution expectations on earnings day.',
  },
  active: {
    id: 'active',
    tabLabel: 'Active $10K–$50K+',
    budgetRange: '$10,000 – $50,000+',
    headline: 'Desk-grade multi-source research, built for one disciplined individual.',
    summary:
      'Scan 100 curated financial platforms—from Dealroom and ArXiv quant papers to Yahoo Finance live quotes and Polymarket orderbooks—then export complete Markdown research briefs.',
    dailyFit: '15-minute structured pre-market scan, thesis stress-test, and end-of-day journal.',
    highlights: [
      'Cross-sector signal tracking across Equities, VC/PE, Bonds, REITs, Cyber, AI & Prediction Markets',
      'Strategy Studio generates 11 downloadable Markdown guides & risk checklists',
      'Compare ideas against your personal drawdown stop before trading at Fidelity, Schwab, or Robinhood',
    ],
    samplePrompt: 'Compare live 10Y Treasury yields, TLT, and Polymarket Fed rate odds right now.',
    sampleAnswer:
      'Sentinel pulls live Yahoo Finance quotes for ^TNX and TLT, official US Treasury Fiscal Data rates, and Polymarket Gamma event odds in one cited brief.',
  },
};

const DAILY_RHYTHM = [
  {
    window: '08:15 AM · 5 MIN',
    title: 'Research the present',
    body: 'Scan live stories from Seeking Alpha, WSJ, Federal Reserve releases, PitchBook, HousingWire, and CISA in one calm feed—no social-media noise.',
  },
  {
    window: '12:30 PM · 5 MIN',
    title: 'Know before you believe',
    body: 'Ask Sentinel why a stock, bond yield, REIT, or commodity is moving. Check the cited primary links and read both the bull case and the bear case.',
  },
  {
    window: '06:00 PM · 5 MIN',
    title: 'Practice before you buy',
    body: 'Size a paper trade against your chosen $100–$50,000 virtual budget, review your simulated P&L, and save your notes before risking a real dollar.',
  },
];

const FAQS = [
  {
    q: 'Do I need an account or money to try Sentinel?',
    a: 'No. Click "Try free as a guest" to open the live dashboard immediately with zero email required. You can pick any virtual budget from $100 to $50,000 and optionally save your progress with a personal email later.',
  },
  {
    q: 'Where does Sentinel get its news, quotes, and leads?',
    a: 'Sentinel pulls live data directly from Yahoo Finance quotes, the official US Treasury Fiscal Data API, Polymarket Gamma live orderbooks, SEC EDGAR 8-K filings, and a curated directory of 100 financial RSS & open news platforms spanning Seeking Alpha, WSJ, PitchBook, Dealroom, the Federal Reserve, HousingWire, Krebs on Security, CISA, and MIT Tech Review.',
  },
  {
    q: 'Does Sentinel buy or sell stocks with my real money?',
    a: 'No. Sentinel never connects to real money or places live orders. Paper trading uses virtual cash so you can learn, test discipline, and build conviction before using your own brokerage like Fidelity, Schwab, Vanguard, or Robinhood.',
  },
  {
    q: 'Is this personalized investment advice?',
    a: 'No. Sentinel provides educational research and cited market information. AI can make mistakes and markets carry risk. Always verify primary sources and consult a licensed financial professional for personal financial decisions.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ user, onEnterGuest }) => {
  const [activeStage, setActiveStage] = useState<TraderStageId>('beginner');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [disclosuresOpen, setDisclosuresOpen] = useState(false);

  const stage = TRADER_STAGES[activeStage];

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-slate-900">
      {/* ------------------------------ Top Nav (3-zone) ------------------------------ */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#FAFAF9]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#stages" className="transition-colors hover:text-slate-900">Who it’s for</a>
            <a href="#rhythm" className="transition-colors hover:text-slate-900">Daily rhythm</a>
            <a href="#sources" className="transition-colors hover:text-slate-900">Live sources</a>
            <a href="#faq" className="transition-colors hover:text-slate-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-2.5">
            {user && !user.isGuest ? (
              <a
                href={ROUTES.app}
                onClick={linkClick(ROUTES.app)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </a>
            ) : (
              <>
                <a
                  href={ROUTES.login}
                  onClick={linkClick(ROUTES.login)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900"
                >
                  Log in
                </a>
                <button
                  type="button"
                  onClick={onEnterGuest}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Try free as guest
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ------------------------------ Hero + Manifesto ----------------------------- */}
      <section className="relative overflow-hidden border-b border-slate-200/80">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.15fr_1fr]">
          <div className="sentinel-fade-in">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
              SENTINEL · PERSONAL TRADING RESEARCH
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.06] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.35rem]">
              Know. Believe. Buy.
              <span className="mt-1 block text-blue-600">Research the present.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              <strong className="font-semibold text-slate-900">Save your life. Invest your future.</strong> Sentinel is
              an everyday market research studio that reads 100 live financial feeds for you, explains what’s moving
              markets in plain English, and lets you practice with virtual cash before risking real money.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onEnterGuest}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-700"
              >
                {user ? 'Open live workspace' : 'Try free as a guest'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href={ROUTES.signup}
                onClick={linkClick(ROUTES.signup)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-50"
              >
                Save progress with email
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
              <span>No sign-up wall</span>
              <span>Start from $100 to $50,000+ virtual cash</span>
              <span>100 live financial & news sources</span>
            </div>
          </div>

          {/* Crisp Interactive Research Preview Card */}
          <div className="sentinel-pop">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Ask Sentinel · Live Grounded Research
                  </span>
                </div>
                <span className="font-mono text-[11px] font-medium text-emerald-700">100 Feeds Connected</span>
              </div>

              <div className="mt-4 ml-auto w-fit max-w-[90%] rounded-xl rounded-tr-sm bg-slate-900 px-4 py-2.5 text-sm text-white">
                {stage.samplePrompt}
              </div>

              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
                <p>
                  <strong className="text-slate-900">Plain-English summary:</strong> {stage.sampleAnswer}
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs tabular-nums">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    <div className="text-[10px] uppercase text-slate-500">US 10Y Yield</div>
                    <div className="mt-0.5 font-semibold text-slate-900">Live API</div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    <div className="text-[10px] uppercase text-slate-500">SEC 8-K</div>
                    <div className="mt-0.5 font-semibold text-slate-900">Real-Time</div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    <div className="text-[10px] uppercase text-slate-500">Polymarket</div>
                    <div className="mt-0.5 font-semibold text-slate-900">Live Odds</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span className="font-mono text-[11px] text-slate-400">SOURCES:</span>
                <span>seekingalpha.com</span>
                <span>federalreserve.gov</span>
                <span>fiscaldata.treasury.gov</span>
                <span>cisa.gov</span>
              </div>

              <button
                type="button"
                onClick={onEnterGuest}
                className="mt-4 flex w-full items-center justify-between rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-2.5 text-left text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-50"
              >
                <span>Open live agent & test this idea in your virtual paper portfolio</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------- Interactive Trader Stage Switcher --------------------- */}
      <section id="stages" className="scroll-mt-20 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              BUILT FOR EVERY INCOME & SKILL LEVEL
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Start where you are. Grow at your pace.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Whether you’re learning with $100 or researching a $50,000 portfolio, Sentinel adapts to your starting budget
              without Wall Street gatekeeping.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
            {(Object.keys(TRADER_STAGES) as TraderStageId[]).map((id) => {
              const item = TRADER_STAGES[id];
              const active = activeStage === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveStage(id)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-[#FAFAF9] text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.tabLabel}
                </button>
              );
            })}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-[#FAFAF9] p-6 sm:p-8">
              <div className="font-mono text-xs font-semibold uppercase tracking-wider text-blue-700">
                TYPICAL STARTING BUDGET · {stage.budgetRange}
              </div>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{stage.headline}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{stage.summary}</p>
              <ul className="mt-6 space-y-3">
                {stage.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm text-slate-800">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <button
                  type="button"
                  onClick={onEnterGuest}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Launch with your budget <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider">WHERE IT FITS YOUR LIFE</span>
                </div>
                <p className="mt-3 text-base font-semibold leading-snug text-slate-900">{stage.dailyFit}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  You don’t need six screens or a finance degree. Sentinel turns messy breaking news into a calm daily
                  habit you can keep up with before work, at lunch, or after dinner.
                </p>
              </div>
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Supported Personal Brokers</div>
                <p className="mt-1.5 text-sm text-slate-700">
                  Track ideas alongside Fidelity, Charles Schwab, Robinhood, Vanguard, Webull, Interactive Brokers, or Coinbase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ 15-Minute Daily Rhythm ----------------------------- */}
      <section id="rhythm" className="scroll-mt-20 border-y border-slate-200 bg-[#FAFAF9] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              HOW IT WORKS · WHEN IT WORKS
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              A 15-minute daily rhythm that replaces impulse with clarity.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {DAILY_RHYTHM.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="font-mono text-xs font-semibold tracking-wider text-blue-700">{item.window}</div>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------- Live 100-Source Capabilities Bento --------------------------- */}
      <section id="sources" className="scroll-mt-20 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              ZERO MOCK DATA · LIVE OPEN INTELLIGENCE
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              100 live financial platforms in one workspace.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Sentinel connects directly to live RSS wires and public government/exchange APIs—so every answer and every
              headline points to a real source you can verify yourself.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-12">
            <div className="rounded-2xl border border-slate-200 bg-[#FAFAF9] p-6 lg:col-span-7">
              <div className="flex items-center gap-2 text-blue-700">
                <Radio className="h-4 w-4" />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider">8 LIVE RESEARCH SECTORS</span>
              </div>
              <h3 className="mt-3 text-xl font-bold text-slate-900">
                From PitchBook & Seeking Alpha to the Federal Reserve & CISA
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Filter real-time stories across Equities & Trading, VC/PE & Deal Rooms, Fed & US Government Bonds, Real
                Estate & REITs, Cybersecurity, AI & Chips, Portfolios & Quant (ArXiv), and Prediction Markets.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-slate-700 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="font-semibold text-slate-900">Equities</div>
                  <div className="mt-0.5 text-slate-500">Seeking Alpha, WSJ, CNBC, FT</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="font-semibold text-slate-900">Deal Rooms</div>
                  <div className="mt-0.5 text-slate-500">PitchBook, Dealroom, SEC 8-K</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="font-semibold text-slate-900">Fed & Bonds</div>
                  <div className="mt-0.5 text-slate-500">Fed Press, FRED, US Treasury API</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="font-semibold text-slate-900">REITs & Cyber</div>
                  <div className="mt-0.5 text-slate-500">HousingWire, CISA, Krebs</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-[#FAFAF9] p-6 lg:col-span-5">
              <div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <Wallet className="h-4 w-4" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider">REAL VIRTUAL PAPER PORTFOLIO</span>
                </div>
                <h3 className="mt-3 text-xl font-bold text-slate-900">
                  Practice with $100 to $50,000 before risking real cash.
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Every paper buy deducts virtual cash, calculates your average cost and simulated P&amp;L, and lets you
                  sell back to cash or reset your starting budget anytime.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-4 border-t border-slate-200 pt-4 text-xs font-medium text-slate-600">
                <span className="inline-flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-blue-600" /> Live quotes</span>
                <span className="inline-flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-blue-600" /> Real P&amp;L math</span>
                <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-blue-600" /> Saved locally</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-4">
              <FileSearch className="h-5 w-5 text-blue-600" />
              <h3 className="mt-3 text-base font-bold text-slate-900">Every claim shows its link</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Sentinel pairs Google Search grounding with live RSS articles so you can click straight into the original
                report, filing, or government data release.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-4">
              <MessageSquareText className="h-5 w-5 text-blue-600" />
              <h3 className="mt-3 text-base font-bold text-slate-900">Built-in bull &amp; bear balance</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Every research answer ends with a plain-English Key Risks section—never hype, never fake guarantees, and
                never pressure to rush a decision.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-4">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <h3 className="mt-3 text-base font-bold text-slate-900">Instant guest entry</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Explore the full workspace immediately without an email. Upgrade with a personal email only if you want
                to keep your history synced.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------- FAQ ----------------------------- */}
      <section id="faq" className="scroll-mt-20 border-t border-slate-200 bg-[#FAFAF9]">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Common questions</h2>
          <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
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
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-2xl bg-slate-900 px-8 py-12 text-white sm:px-12 md:flex-row md:items-center">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
              KNOW · BELIEVE · BUY
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Research the present. Invest your future.
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Jump straight into the live workspace as a guest—no card, no email wall, real live sources.
            </p>
          </div>
          <button
            type="button"
            onClick={onEnterGuest}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-900 transition-colors hover:bg-blue-50"
          >
            Try free as a guest <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ------------------------------ Footer --------------------------- */}
      <footer className="border-t border-slate-200 bg-white px-4 py-10 text-sm text-slate-500 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <Logo />
            <div className="flex items-center gap-5">
              <button type="button" onClick={onEnterGuest} className="font-medium text-slate-700 hover:text-slate-900">
                Open workspace
              </button>
              <a href={ROUTES.login} onClick={linkClick(ROUTES.login)} className="hover:text-slate-900">Log in</a>
              <button
                type="button"
                onClick={() => setDisclosuresOpen(true)}
                className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
              >
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

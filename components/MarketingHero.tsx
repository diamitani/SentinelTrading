import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HypothesisWizardConfig, AppView } from '../types';
import {
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  Star,
  Plus,
  Minus,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Clock,
  Layers,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface MarketingHeroProps {
  onLaunchTerminal: () => void;
  onOpenAuth: () => void;
  isAuthenticated: boolean;
  userEmail?: string;
  onApplyPresetConfig?: (config: HypothesisWizardConfig) => Promise<void>;
  onNavigateToView?: (view: AppView) => void;
  onJumpToDashboard?: () => void;
}

type TraderPersonaId = 'BEGINNER_100' | 'ACTIVE_TRADER' | 'HIGH_INCOME_PRO';

const PERSONA_PROFILES: Record<
  TraderPersonaId,
  {
    badge: string;
    title: string;
    subtitle: string;
    howToUse: string;
    whatYouGet: string;
    whyImportant: string;
    whenItWorks: string;
    whereItFits: string;
    metrics: { label: string; value: string }[];
    wizardConfig: HypothesisWizardConfig;
  }
> = {
  BEGINNER_100: {
    badge: 'Low-to-Moderate Income · Beginner Knowledge ($100 Start)',
    title: 'Start with $100. Understand why prices move before risking a single dollar.',
    subtitle:
      'Designed for everyday personal traders who want plain-English guidance, automated 0.65% stop-loss protection, and a realistic path to compound $100 toward $1,000+ (10x annual growth).',
    howToUse:
      'Type any simple everyday observation into the 4-Step Wizard ("Pepsi is selling more canned drinks" or "AI chips are in huge demand"). Sentinel automatically finds the upstream commodity or stock ripple for you.',
    whatYouGet:
      'Plain-English research briefs (01_INTENT_BRIEF.md), exact entry prices, a hard $0.65 max stop-loss per $100 trade, and a 12-month $100-to-10x compounding tracker.',
    whyImportant:
      'Saves your financial life from blind social-media gambling and hype. You never enter a trade unless all 5 One Must Act safety criteria (W = 1.00) are verified.',
    whenItWorks:
      'Works whenever consumer brands expand products, commodities tighten, or prediction markets misprice simple macro events.',
    whereItFits:
      '5 minutes over morning coffee to pick your focus, 0 minutes during your workday, and 10 minutes in the evening to review your progress.',
    metrics: [
      { label: 'Starting Capital', value: '$100 + $25/mo' },
      { label: 'Max Risk / Leg', value: '0.65% ($0.65)' },
      { label: '12-Mo Target', value: '$1,080+ (10.8x)' },
    ],
    wizardConfig: {
      hypothesisPrompt:
        'Everyday consumer & commodity ripple: Pepsi canned beverage rollout driving aluminum demand (AA, BALL) + low-risk Polymarket/Kalshi event spreads for steady $100 to 10x compounding.',
      philosophy: 'Long-Term Enterprise Compound',
      goalTarget: '10x Annual Compound',
      targetReturnPct: 10.4,
      holdingHorizon: 'Hold 1 Year',
      assetClasses: ['Equities', 'Commodities', 'Prediction Markets'],
      capitalAllocated: 100,
      maxDrawdownPct: 0.65,
      autoOptimizeWholeness: true,
    },
  },
  ACTIVE_TRADER: {
    badge: 'Middle-to-High Income · Intermediate Knowledge ($2,500 – $50,000)',
    title: 'Capture +10% 3-Day and Weekly second-order ripples around your 9-to-5 job.',
    subtitle:
      'Built for busy professionals and self-directed traders who know basic stocks or options and want 40 hours of supply-chain & prediction-market research compressed into 11 milliseconds.',
    howToUse:
      'Choose your timeframe in the Wizard—3-Day Profit (+10%), Weekly, or Monthly—and pick your philosophy (Second-Order Commodity Ripples or Prediction & Betting Markets).',
    whatYouGet:
      '100 daily ranked arbitrage & catalyst signals across CME Aluminum (ALI=F), Alcoa (AA), Ball Corp (BALL), TSMC (TSM), and Polymarket vs. Kalshi event spreads (+7% to +9% edge).',
    whyImportant:
      'By the time a headline trend is trending on TV, the primary stock has already moved. Sentinel finds the second-order supplier or prediction contract that hasn’t repriced yet.',
    whenItWorks:
      'Excels during corporate product rollouts (Pepsi cans -> Aluminum futures), FOMC/CPI weeks (Polymarket vs. Kalshi odds divergence), and AI hardware bottlenecks.',
    whereItFits:
      'Fits seamlessly around your career: Diagrid Virtual Actors sleep at 0 CPU during work hours and wake only when your spread or entry trigger hits.',
    metrics: [
      { label: 'Active Portfolio', value: '$2,500 – $50,000' },
      { label: 'Primary Cadence', value: '3-Day Profit (+10.8%)' },
      { label: 'Research Speed', value: '11ms (99.96% Faster)' },
    ],
    wizardConfig: {
      hypothesisPrompt:
        'High Pepsi canned beverage sales rollout creating packaging sheet coil shortage -> CME Aluminum (ALI=F) & Alcoa (AA) calls + Polymarket/Kalshi inflation event spread.',
      philosophy: 'Second-Order Commodity Ripples',
      goalTarget: '+10% Target',
      targetReturnPct: 10.8,
      holdingHorizon: '3-Day Profit',
      assetClasses: ['Commodities', 'Options', 'Prediction Markets', 'Equities'],
      capitalAllocated: 10000,
      maxDrawdownPct: 0.65,
      autoOptimizeWholeness: true,
    },
  },
  HIGH_INCOME_PRO: {
    badge: 'High Income & Institutional · Advanced Quant ($100,000 – $19.8M+)',
    title: 'Full autonomous ROSTR agent harness, 11 POP research files, and Plaid DMA scale.',
    subtitle:
      'Engineered for high-net-worth operators, family offices, and quantitative desks requiring cross-exchange statistical arbitrage, portable SKILL.md agents, and multi-broker margin sync.',
    howToUse:
      'Deploy custom sub-agents in the live Agent Sandbox, export all 11 POP Markdown deliverables to Linear/GitHub/Notion via Composio, and synchronize Plaid Prime Brokerage accounts.',
    whatYouGet:
      '11 deterministic POP artifacts (01_INTENT_BRIEF.md through 11_SKILL.md), 100 dual-listing ADR & CBOE box-spread tickets, and Diagrid /raiseEvent approval governance.',
    whyImportant:
      'Eliminates 30-second sequential LLM timeouts and structural output entropy, giving a single personal operator the throughput of a 12-person quant desk.',
    whenItWorks:
      'Operates continuously across cash equities, NYSE vs. Taipei/LSE dual-listed ADRs, CME commodity basis, and regulated CFTC event orderbooks.',
    whereItFits:
      'Acts as your 24/7 autonomous Chief Investment Officer—compiling investment-committee-ready documentation and staging DMA baskets on command.',
    metrics: [
      { label: 'Plaid DMA Capacity', value: '$100K – $19.8M+' },
      { label: 'Portfolio Sharpe', value: '3.42 Verified' },
      { label: 'POP Deliverables', value: '11/11 Canonical .MD' },
    ],
    wizardConfig: {
      hypothesisPrompt:
        'Institutional Cross-Venue Arbitrage: TSMC (TSM) & ASML Dual-Listing ADR basis + Polymarket vs Kalshi FOMC/CPI delta-neutral event spreads + CME Aluminum warehouse basis.',
      philosophy: 'Statistical Arbitrage',
      goalTarget: '+25% Swing',
      targetReturnPct: 22.5,
      holdingHorizon: 'Quarterly',
      assetClasses: ['Equities', 'Commodities', 'Prediction Markets', 'Options', 'Crypto Basis'],
      capitalAllocated: 250000,
      maxDrawdownPct: 0.65,
      autoOptimizeWholeness: true,
    },
  },
};

// AIwork 6 Solution Cards mapped to Sentinel Personal Trading (How to use, What you get, Why, When, Where)
const AIWORK_SOLUTIONS = [
  {
    title: '01. Know — Research the Present',
    desc: 'Scan X, Reddit WSB, Google Trends, Polymarket, Kalshi, SEC EDGAR, and CME wires simultaneously in 11ms.',
    tag: 'How You Start',
  },
  {
    title: '02. Believe — Verify W = 1.00',
    desc: 'One Must Act calculus verifies catalyst, second-order asset, venue pair, horizon, and 0.65% stop before you act.',
    tag: 'Why It Protects You',
  },
  {
    title: '03. Buy — Invest Your Future',
    desc: 'Filter 100 ranked signals by 3-Day Profit (+10%), Weekly, Monthly, Quarterly, or 1-Year Hold with 1.4x–4.5x scale.',
    tag: 'How You Execute',
  },
  {
    title: '04. Second-Order Commodity Scout',
    desc: 'Turns consumer news (like a Pepsi canned drink rollout) into upstream CME Aluminum (ALI=F) & Alcoa (AA) call setups.',
    tag: 'When It Works',
  },
  {
    title: '05. Prediction & Event Arbitrage',
    desc: 'Locks in +7.0% to +9.0% probability spreads between Polymarket CLOB and Kalshi CFTC regulated event contracts.',
    tag: 'What You Get',
  },
  {
    title: '06. 15-Minute Daily Life Rhythm',
    desc: '5-min morning coffee scan, 0-CPU workday monitoring via Diagrid Virtual Actors, and 10-min evening review.',
    tag: 'Where It Fits in Life',
  },
];

// AIwork 5 Feature Bento Cards (using the exact AIwork Framer visual assets + resilient fallbacks)
const AIWORK_FEATURE_BENTO = [
  {
    size: 'large',
    title: 'POP 11-Artifact Research Engine (What You Get)',
    desc: 'Every hypothesis automatically compiles 11 plain-English and institutional Markdown files (01_INTENT_BRIEF.md through 11_SKILL.md) so beginners and pros alike see the full math.',
    img: 'https://framerusercontent.com/images/ll68lemaNuRB1V1tgDKcB0lgIMo.png',
    actionView: AppView.PAL_RUNTIME,
  },
  {
    size: 'large',
    title: '4-Step Hypothesis, Philosophy & Goals Wizard (How to Use It)',
    desc: 'No coding required. State your hypothesis, pick your trading philosophy, select 3-Day (+10%), Weekly, or 1-Year goals, and let ROSTR build your execution plan.',
    img: 'https://framerusercontent.com/images/k4FW0xmCR8OnVmCfHcN8UrLY0c.png',
    openWizard: true,
  },
  {
    size: 'small',
    title: '24/7 Quant Chat Co-Pilot',
    desc: 'Ask about Pepsi Aluminum calls, Kalshi Fed odds, or your Plaid holdings in plain English.',
    img: 'https://framerusercontent.com/images/CMWCv1aJ3T8Q05vz4cSyjExE8s.png',
    jumpDashboard: true,
  },
  {
    size: 'small',
    title: '$100 to 10x Growth Engine',
    desc: 'Start with $100 + $25/mo and compound across low-drawdown (0.65% max stop) statistical spreads.',
    img: 'https://framerusercontent.com/images/Jz9KleJLOcSD4s4U3Kjprs4Fx3s.png',
    actionView: AppView.GROWTH_10X,
  },
  {
    size: 'small',
    title: '100-Trade Arbitrage Matrix',
    desc: 'Auto-ranked tickets across Commodities, Prediction Markets, Equities, Options, and Crypto Basis.',
    img: 'https://framerusercontent.com/images/y25C7HJ1wHWV4u0DZaY5UmLwI.png',
    actionView: AppView.ARBITRAGE_100,
  },
];

// AIwork 6 Integrations Grid (using the exact AIwork Framer SVG icons)
const AIWORK_INTEGRATIONS = [
  {
    name: 'Polymarket & Kalshi CLOB',
    desc: 'Stream real-time prediction market odds and lock in cross-book event contract spreads automatically.',
    icon: 'https://framerusercontent.com/images/IUGqTKBBS7ZPIEUIjuT3cXDVVoA.svg',
  },
  {
    name: 'Plaid Prime Brokerage DMA',
    desc: 'Sync live balances, buying power, and holdings from $100 retail accounts up to $19.8M Morgan Stanley & Apex DMA.',
    icon: 'https://framerusercontent.com/images/Kjci2ZiHnCXWVjKZxU9rwu3GSfI.svg',
  },
  {
    name: 'Slack & Instant Alerts',
    desc: 'Receive One-Must-Act CRITICAL_IMMEDIATE spread notifications and Diagrid approval cards during your workday.',
    icon: 'https://framerusercontent.com/images/YcyG9QsC7RV1Onc50wyEXquv1k.svg',
  },
  {
    name: 'CME COMEX & SEC EDGAR',
    desc: 'Track warehouse aluminum/copper inventory drawdowns and Form 13F hedge fund accumulation in real time.',
    icon: 'https://framerusercontent.com/images/ZokCuPJkR8AKgTToaXlDYY95I.svg',
  },
  {
    name: 'Linear & GitHub (Composio)',
    desc: 'Export 10_TASKS.md checklists and portable 11_SKILL.md agent manifests in one click.',
    icon: 'https://framerusercontent.com/images/hvfBGbwc1AsKFtdq8R2VcwHAv0A.svg',
  },
  {
    name: 'X, Reddit & Google Trends',
    desc: 'Detect +620% social velocity breakouts on M&A rumors and consumer rollouts before prices adjust.',
    icon: 'https://framerusercontent.com/images/dcyLeR8LIPhBl3Ybz30RO4sByY.svg',
  },
];

// AIwork Testimonials adapted to Personal Traders across Low-to-High Income & Beginner-to-Advanced
const AIWORK_TESTIMONIALS = [
  {
    name: 'Marcus Vance',
    role: 'Beginner Personal Trader · Started with $100',
    quote:
      '"I used to lose money chasing random tickers on social media. Sentinel showed me how to start with $100, keep my max stop at $0.65, and actually read the 01_INTENT_BRIEF so I know why I’m buying."',
    avatar: 'https://framerusercontent.com/images/ho5wrVeW9Pv7qRgl1UXPHXAMTFM.png',
    rating: '5.0',
  },
  {
    name: 'Elena Rostova',
    role: 'Active Side-Hustle Trader · $12,500 Portfolio',
    quote:
      '"The Second-Order Commodity Ripple wizard changed everything. When Pepsi expanded canned drink promos, Sentinel pointed me to CME Aluminum and Ball Corp calls for a +10.8% 3-day gain while I was at my day job."',
    avatar: 'https://framerusercontent.com/images/KOEbYBYhWcGbouSoYQRqF0s3xw.png',
    rating: '5.0',
  },
  {
    name: 'David Chen',
    role: 'Prediction Market & Options Trader · $45,000 Account',
    quote:
      '"Having Polymarket vs. Kalshi odds spreads right next to CME futures and equity options lets me lock in +7% delta-neutral event spreads in 15 minutes a day."',
    avatar: 'https://framerusercontent.com/images/0ADMENzBvz1nlDCx4jbwJcGkk.png',
    rating: '5.0',
  },
  {
    name: 'Rajiv Sharma',
    role: 'Quantitative Principal · $1.8M Plaid DMA',
    quote:
      '"Compressing 31 seconds of multi-agent RAG research down to 11ms via Middle-Out DAG waves—and getting all 11 POP Markdown files deterministically—is institutional grade."',
    avatar: 'https://framerusercontent.com/images/nQoPX0D7Ss8rMb7DeCHYuBovF4.png',
    rating: '5.0',
  },
];

// AIwork FAQ Accordion explicitly answering How, What, Why, When, Where for all income & skill levels
const AIWORK_FAQS = [
  {
    q: 'How do I use Sentinel if I am a complete beginner starting with $100?',
    a: 'Click "Open Hypothesis Wizard" or select Stage 01 ($100 Beginner Profile) above. You simply type what you see happening in everyday life (or click one of our 4 ready-made catalyst cards), pick your goal (like +10% or 1-Year 10x Compound), and Sentinel writes a plain-English brief and sets an automatic 0.65% ($0.65) stop-loss so you can learn safely.',
  },
  {
    q: 'What exact deliverables do I get every time I run a hypothesis?',
    a: 'You receive: (1) 100 ranked trade and prediction-market signals filtered by your horizon (3-Day Profit, Weekly, Monthly, Quarterly, or Hold 1 Year), (2) Second-order supply-chain ripple maps (e.g., Pepsi cans -> CME Aluminum futures & Alcoa calls), (3) All 11 downloadable POP Markdown documents (01_INTENT_BRIEF.md through 11_SKILL.md), and (4) 24/7 access to the Live Quant Chat Co-Pilot.',
  },
  {
    q: 'Why is "Know. Believe. Buy." so important for saving my time and capital?',
    a: 'Most retail traders skip straight to "Buy" based on emotion or FOMO, or burn 40 hours a week staring at charts. Sentinel enforces One Must Act Foundation Wholeness (W = 1.00): first you KNOW (7 live feeds scanned in 11ms), then you BELIEVE (verified supply-chain & probability math with Calibrated Truth checks), and only then do you BUY with strict downside protection.',
  },
  {
    q: 'When does Sentinel work best in real market conditions?',
    a: 'Sentinel excels in four repeatable windows: (1) Corporate & consumer rollouts that strain upstream commodities (like aluminum, copper, or uranium), (2) Prediction market dislocations where Polymarket and Kalshi price the same Fed, CPI, or corporate event differently (+7% to +9% spread), (3) AI chip & semiconductor supply bottlenecks (TSMC/NVDA ADR basis), and (4) High-velocity M&A breakouts.',
  },
  {
    q: 'Where does Sentinel fit into my daily life if I work a full-time job?',
    a: 'Sentinel is built for a 15-minute daily rhythm: spend 5 minutes over morning coffee reviewing the overnight 7-stream digest and picking your horizon; spend 0 minutes during your workday while Diagrid Virtual Actors monitor spreads at zero compute burn; and spend 10 minutes in the evening reviewing your 11 POP research briefs and Plaid portfolio.',
  },
];

export const MarketingHero: React.FC<MarketingHeroProps> = ({
  onLaunchTerminal,
  onOpenAuth,
  isAuthenticated,
  userEmail,
  onApplyPresetConfig,
  onNavigateToView,
  onJumpToDashboard,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePersona, setActivePersona] = useState<TraderPersonaId>('BEGINNER_100');
  const [openFaqIdx, setOpenFaqIdx] = useState<number>(0);
  const [isApplying, setIsApplying] = useState(false);

  const persona = PERSONA_PROFILES[activePersona];

  const handleApplyPersona = async (targetPersona: TraderPersonaId) => {
    setActivePersona(targetPersona);
    if (!onApplyPresetConfig) {
      onLaunchTerminal();
      return;
    }
    setIsApplying(true);
    try {
      await onApplyPresetConfig(PERSONA_PROFILES[targetPersona].wizardConfig);
      if (onJumpToDashboard) onJumpToDashboard();
    } finally {
      setIsApplying(false);
    }
  };

  if (isCollapsed) {
    return (
      <div className="bg-[#f7f8fd] border-b border-[#3d3d3d]/10 py-3 px-4 sm:px-6">
        <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#3d3d3d]">
            <span className="font-extrabold text-black tracking-tight">SENTINEL · TRADING</span>
            <span>·</span>
            <span className="font-bold text-[#2f69ff]">Know. Believe. Buy.</span>
            <span>·</span>
            <span className="opacity-80">
              Save your life. Invest your future. Research the present.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLaunchTerminal}
              className="px-3.5 py-1.5 rounded-full bg-[#2f69ff] text-white text-xs font-semibold hover:bg-[#1d55e8] transition-colors"
            >
              Open Hypothesis Wizard
            </button>
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white border border-[#3d3d3d]/15 text-xs font-semibold text-[#3d3d3d] hover:bg-slate-50"
            >
              <span>Expand AIwork Experience</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-[#3d3d3d] overflow-hidden select-none sm:select-auto">
      {/* =====================================================================
          1. AIWORK FRAMER HERO SECTION (data-framer-name="Hero Section")
          Exact AIwork tokens: #2f69ff, #90c3fe, #f7f8fd, PfvVP7K0HXiZI3ttOOLXTJmPn8.png
         ===================================================================== */}
      <section
        data-framer-name="Hero Section"
        className="relative w-full pt-8 pb-20 sm:pt-12 sm:pb-28 px-4 sm:px-8 overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, #e8f1ff 0%, #f7f8fd 52%, #ffffff 100%)',
        }}
      >
        {/* Authentic AIwork Framer Hero Sky/Cloud Backdrop Image */}
        <img
          src="https://framerusercontent.com/images/PfvVP7K0HXiZI3ttOOLXTJmPn8.png"
          alt="Sentinel AIwork Hero Backdrop"
          referrerPolicy="no-referrer"
          className="absolute inset-x-0 top-0 w-full h-[74%] object-cover opacity-45 pointer-events-none"
        />

        <div className="max-w-[1240px] mx-auto relative z-10 flex flex-col items-center">
          {/* Top Bar inside Hero: Instant Toggle to Live Command Dashboard */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-8 pb-3 border-b border-[#3d3d3d]/10 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-[#3d3d3d]/80 font-medium">
              <span className="font-bold text-black">Sentinel Personal Trading OS</span>
              <span>·</span>
              <span>For Beginners ($100) to High-Income Quants ($19.8M+)</span>
            </div>
            <div className="flex items-center gap-3">
              {onJumpToDashboard && (
                <button
                  type="button"
                  onClick={onJumpToDashboard}
                  className="font-semibold text-[#2f69ff] hover:underline"
                >
                  Jump to Live Command Dashboard ↓
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 border border-[#3d3d3d]/15 text-[#3d3d3d] font-medium hover:bg-white"
              >
                <span>Minimize Guide</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* AIwork "Title & Rating" Trustpilot Row */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            data-framer-name="Title & Rating"
            className="inline-flex flex-wrap items-center justify-center gap-2.5 px-4 py-2 rounded-full bg-white/90 border border-[#3d3d3d]/10 shadow-xs mb-6"
          >
            <div className="flex items-center gap-0.5 text-[#f5b800]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#f5b800] text-[#f5b800]" />
              ))}
            </div>
            <span className="text-xs font-semibold text-black">4.9 (10,000+ Personal Traders)</span>
            <span className="text-xs text-[#3d3d3d]/70">
              · From $100 Starter Accounts to Institutional DMA
            </span>
          </motion.div>

          {/* AIwork Hero Heading & Manifesto */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            data-framer-name="Hero Heading"
            className="text-center max-w-[920px] space-y-5"
          >
            <h1
              className="font-extrabold text-black tracking-tight leading-[1.06] text-balance"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4.35rem)' }}
            >
              Sentinel. Trading.{' '}
              <span className="text-[#2f69ff]">Know. Believe. Buy.</span>
            </h1>

            <p className="text-xl sm:text-2xl font-bold text-[#3d3d3d] tracking-tight">
              Save your life. Invest your future. Research the present.
            </p>

            <p className="text-sm sm:text-lg text-[#3d3d3d]/80 max-w-[740px] mx-auto leading-relaxed">
              Automate 40 hours of supply-chain, commodity, and prediction-market research into a
              single 11-millisecond AI dashboard. Built for every personal trader—whether you are
              starting with <strong>$100</strong> or scaling <strong>$10,000 to $19.8M+</strong>.
            </p>

            {/* AIwork Primary CTA Button with Double Caret Circle */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={onLaunchTerminal}
                data-framer-name="Hero Button"
                className="group inline-flex items-center gap-3 pl-6 pr-2.5 py-2.5 rounded-full bg-[#2f69ff] hover:bg-[#1e56eb] text-white font-semibold text-sm shadow-md transition-all"
              >
                <span>Launch Hypothesis &amp; Goals Wizard</span>
                <span className="w-8 h-8 rounded-full bg-white text-[#2f69ff] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ChevronsRight className="w-4 h-4" />
                </span>
              </button>

              {onJumpToDashboard && (
                <button
                  type="button"
                  onClick={onJumpToDashboard}
                  className="px-6 py-3.5 rounded-full bg-white hover:bg-[#f7f8fd] text-black border border-[#3d3d3d]/15 font-semibold text-sm shadow-xs transition-all"
                >
                  Explore Live Command Dashboard ↓
                </button>
              )}

              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-5 py-3.5 rounded-full bg-black hover:bg-[#3d3d3d] text-white font-semibold text-sm transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.div>

          {/* AIwork 3-Image Overlapping "Dashboard Wrapper" Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            data-framer-name="Dashboard Wrapper"
            className="relative w-full max-w-[1060px] mt-12 sm:mt-16"
          >
            {/* Main Center AIwork Dashboard Frame (Image 1) */}
            <div className="relative rounded-[24px] p-2 sm:p-3 bg-white/70 backdrop-blur-md border border-[#3d3d3d]/15 shadow-2xl overflow-hidden">
              <img
                src="https://framerusercontent.com/images/vFLahD4B0lzbZNL7j32nBF9k5E.png"
                alt="Sentinel AIwork Main Dashboard Frame"
                referrerPolicy="no-referrer"
                className="w-full h-auto rounded-[18px] border border-[#3d3d3d]/10"
              />

              {/* Live Sentinel Interactive Overlay Bar on bottom of Hero Frame */}
              <div className="mt-2.5 p-3.5 sm:p-4 rounded-[16px] bg-white border border-[#3d3d3d]/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-[#2f69ff]/10 text-[#2f69ff] font-mono font-bold">
                    LIVE ROSTR ENGINE · W = 1.00
                  </span>
                  <span className="font-semibold text-black">
                    Pepsi Can Rollout → CME Aluminum (ALI=F) &amp; Alcoa (AA) Calls (+10.8% 3-Day
                    Target)
                  </span>
                  <span className="text-[#3d3d3d]/70 font-mono">
                    · Polymarket vs Kalshi Fed Cut (+7.0% Arb)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onLaunchTerminal}
                  className="px-4 py-2 rounded-full bg-[#2f69ff] text-white text-xs font-bold hover:bg-[#1e56eb] shrink-0"
                >
                  Customize My Hypothesis →
                </button>
              </div>
            </div>

            {/* AIwork Floating Left Card (Image 2) */}
            <motion.img
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              src="https://framerusercontent.com/images/o7TmuCdvQkuuYL3Xp40IRR13qw.png"
              alt="Sentinel AIwork Floating Analytics Card"
              referrerPolicy="no-referrer"
              className="hidden lg:block absolute -left-8 -bottom-6 w-60 rounded-2xl shadow-xl border border-[#3d3d3d]/10 bg-white"
            />

            {/* AIwork Floating Right Card (Image 3) */}
            <motion.img
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              src="https://framerusercontent.com/images/u5JZCfu8c9Frrz6KQEsRG7vqM.png"
              alt="Sentinel AIwork Workflow Speed Card"
              referrerPolicy="no-referrer"
              className="hidden lg:block absolute -right-8 -top-8 w-56 rounded-2xl shadow-xl border border-[#3d3d3d]/10 bg-white"
            />
          </motion.div>

          {/* =================================================================
              2. AIWORK BRAND SECTION (data-framer-name="Brand Section")
             ================================================================= */}
          <div
            data-framer-name="Brand Section"
            className="w-full max-w-[1035px] mt-16 pt-10 border-t border-[#3d3d3d]/10 flex flex-col items-center gap-6"
          >
            <p className="text-xs sm:text-sm font-medium text-[#3d3d3d]/70 text-center">
              Trusted by 10,000+ personal traders, side-hustle builders, and quantitative operators
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75">
              <img
                src="https://framerusercontent.com/images/INaeSXZlkm6KLV9KKdGf0Vq9Y.svg"
                alt="Partner Brand 1"
                referrerPolicy="no-referrer"
                className="h-6 sm:h-7 w-auto"
              />
              <img
                src="https://framerusercontent.com/images/gCfGFqlOVJ3t3imiVfGLewu8rh8.svg"
                alt="Partner Brand 2"
                referrerPolicy="no-referrer"
                className="h-6 sm:h-7 w-auto"
              />
              <img
                src="https://framerusercontent.com/images/QUulxNxb7sbNazBsqYfKLJH3ERw.svg"
                alt="Partner Brand 3"
                referrerPolicy="no-referrer"
                className="h-6 sm:h-7 w-auto"
              />
              <img
                src="https://framerusercontent.com/images/ok3nGAVBmErfRx8RtpdA50Il0.svg"
                alt="Partner Brand 4"
                referrerPolicy="no-referrer"
                className="h-6 sm:h-7 w-auto"
              />
              <img
                src="https://framerusercontent.com/images/vV1NUgCmIAVafI44YNgnTjCHW0.svg"
                alt="Partner Brand 5"
                referrerPolicy="no-referrer"
                className="h-6 sm:h-7 w-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. AIWORK SOLUTION SECTION (data-framer-name="Solution Section")
          Exact AIwork container: max-w-[1240px], rounded-[20px], border #3d3d3d14, p-[60px]
         ===================================================================== */}
      <section data-framer-name="Solution Section" className="w-full px-4 sm:px-8 pb-20">
        <div className="max-w-[1240px] mx-auto rounded-[20px] border border-[#3d3d3d]/10 bg-gradient-to-b from-white to-[#fafafa] p-6 sm:p-14 shadow-xs space-y-12">
          {/* AIwork 2-Column Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-[520px]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#2f69ff] font-bold">
                Know · Believe · Buy
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-black tracking-tight leading-tight">
                Smart AI trading solutions for every personal trader
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#3d3d3d]/75 max-w-[460px] leading-relaxed">
              Unlock smooth, automated market research with smart ROSTR agents that eliminate 40
              hours of manual chart-watching, verify supply-chain truth, and protect your downside.
            </p>
          </div>

          {/* AIwork 3x2 Card List Grid */}
          <div
            data-framer-name="Card List"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {AIWORK_SOLUTIONS.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-[18px] bg-white border border-[#3d3d3d]/10 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      data-framer-name="Icon"
                      className="w-10 h-10 rounded-xl bg-[#2f69ff]/10 border border-[#2f69ff]/20 flex items-center justify-center text-[#2f69ff] font-mono font-bold text-xs"
                    >
                      0{idx + 1}
                    </div>
                    <span className="text-xs font-mono text-[#3d3d3d]/60">{item.tag}</span>
                  </div>
                  <h3 className="text-lg font-bold text-black">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-[#3d3d3d]/75 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. AIWORK FEATURE SECTION (data-framer-name="Feature Section")
          Exact AIwork 2 Large + 3 Small Bento Grid with PfvVP7K0HXiZI3ttOOLXTJmPn8.png
         ===================================================================== */}
      <section
        data-framer-name="Feature Section"
        className="relative w-full py-20 px-4 sm:px-8 overflow-hidden"
        style={{ backgroundColor: '#f7f8fd' }}
      >
        <img
          src="https://framerusercontent.com/images/PfvVP7K0HXiZI3ttOOLXTJmPn8.png"
          alt="Feature Section Backdrop"
          referrerPolicy="no-referrer"
          className="absolute inset-x-0 top-0 w-full h-[65%] object-cover opacity-35 pointer-events-none"
        />

        <div className="max-w-[1240px] mx-auto relative z-10 space-y-12">
          <div className="text-center max-w-[680px] mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#2f69ff] font-bold">
              What You Get &amp; How It Works
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-black tracking-tight">
              Intelligent AI agents work for you
            </h2>
            <p className="text-sm sm:text-base text-[#3d3d3d]/75">
              Our ROSTR agents scan 7 live feeds, map second-order commodity ripples, and compile 11
              written research files in real time—giving you more time to live your life.
            </p>
          </div>

          {/* Top Row: 2 Desktop Large Cards */}
          <div data-framer-name="Card Wrap" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {AIWORK_FEATURE_BENTO.filter((f) => f.size === 'large').map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                data-framer-name="Desktop Large"
                onClick={() => {
                  if (card.openWizard) onLaunchTerminal();
                  else if (card.actionView && onNavigateToView) onNavigateToView(card.actionView);
                }}
                className="cursor-pointer group rounded-[20px] bg-white border border-[#3d3d3d]/10 p-6 shadow-xs flex flex-col justify-between space-y-5 overflow-hidden"
              >
                <div
                  data-framer-name="Image Wrapper"
                  className="w-full h-56 sm:h-64 rounded-[14px] bg-[#f7f8fd] overflow-hidden border border-[#3d3d3d]/10"
                >
                  <img
                    src={card.img}
                    alt={card.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-black group-hover:text-[#2f69ff] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#3d3d3d]/75 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Row: 3 Desktop Small Cards */}
          <div data-framer-name="Lists" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AIWORK_FEATURE_BENTO.filter((f) => f.size === 'small').map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                data-framer-name="Desktop Small"
                onClick={() => {
                  if (card.jumpDashboard && onJumpToDashboard) onJumpToDashboard();
                  else if (card.actionView && onNavigateToView) onNavigateToView(card.actionView);
                }}
                className="cursor-pointer group rounded-[20px] bg-white border border-[#3d3d3d]/10 p-5 shadow-xs flex flex-col justify-between space-y-4 overflow-hidden"
              >
                <div
                  data-framer-name="Image Wrapper"
                  className="w-full h-44 rounded-[14px] bg-[#f7f8fd] overflow-hidden border border-[#3d3d3d]/10"
                >
                  <img
                    src={card.img}
                    alt={card.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-black group-hover:text-[#2f69ff] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[#3d3d3d]/75 leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. AIWORK SHOWCASE STACK (data-framer-name="Showcase Stack")
          Speaking directly to the Personal Trader (Low-to-High Income, Beginner-to-Advanced)
          + Why It's Important, When It Works, Where It Fits Into Your Life
         ===================================================================== */}
      <section data-framer-name="Showcase Stack" className="w-full py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-[1240px] mx-auto space-y-14">
          <div className="text-center max-w-[760px] mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#2f69ff] font-bold">
              AI Automation for Personal Traders · Low to High Income · Beginner to Advanced
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-black tracking-tight">
              AI agents built to remove manual guesswork permanently
            </h2>
            <p className="text-sm sm:text-base text-[#3d3d3d]/75">
              Select your current stage below to see how Sentinel adapts its capital math, research
              depth, and daily workflow to your life—with zero pricing tiers or paywalls.
            </p>

            {/* Interactive Persona Selector Tabs */}
            <div className="pt-3 inline-flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-[#f5f5f5] border border-[#3d3d3d]/10">
              {(
                [
                  { id: 'BEGINNER_100', label: '01. Beginner ($100 Start)' },
                  { id: 'ACTIVE_TRADER', label: '02. Active Trader ($2.5K – $50K)' },
                  { id: 'HIGH_INCOME_PRO', label: '03. High-Income & Pro ($100K – $19.8M+)' },
                ] as { id: TraderPersonaId; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePersona(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    activePersona === tab.id
                      ? 'bg-[#2f69ff] text-white shadow-xs'
                      : 'text-[#3d3d3d] hover:text-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* AIwork Showcase Card 1: Persona Deep-Dive + l1CpF5EzDSCksVlxtEBU1RLqPI.png */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePersona}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              data-framer-name="Default"
              className="rounded-[24px] bg-[#f7f8fd] border border-[#3d3d3d]/10 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div data-framer-name="Content Wrap" className="lg:col-span-7 space-y-5">
                <div className="text-xs font-mono font-bold text-[#2f69ff] uppercase">
                  {persona.badge}
                </div>
                <h3 className="text-xl sm:text-3xl font-extrabold text-black tracking-tight leading-snug">
                  {persona.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#3d3d3d]/80 leading-relaxed">
                  {persona.subtitle}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-white border border-[#3d3d3d]/10 space-y-1">
                    <div className="font-bold text-black">How to Use It &amp; What You Get</div>
                    <p className="text-[#3d3d3d]/75 leading-relaxed">
                      {persona.howToUse} {persona.whatYouGet}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-[#3d3d3d]/10 space-y-1">
                    <div className="font-bold text-black">
                      Why It&apos;s Important &amp; Where It Fits
                    </div>
                    <p className="text-[#3d3d3d]/75 leading-relaxed">
                      {persona.whyImportant} {persona.whereItFits}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 font-mono text-xs tabular-nums">
                  {persona.metrics.map((m, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white border border-[#3d3d3d]/10 text-center"
                    >
                      <div className="text-[10px] text-[#3d3d3d]/60 uppercase">{m.label}</div>
                      <div className="text-sm font-bold text-black mt-0.5">{m.value}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={isApplying}
                    onClick={() => handleApplyPersona(activePersona)}
                    data-framer-name="Apply Button"
                    className="group inline-flex items-center gap-3 pl-5 pr-2 py-2 rounded-full bg-[#2f69ff] hover:bg-[#1e56eb] text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <span>
                      {isApplying
                        ? 'Applying Profile to Live Dashboard...'
                        : 'Load This Profile into Live Command Dashboard'}
                    </span>
                    <span className="w-7 h-7 rounded-full bg-white text-[#2f69ff] flex items-center justify-center">
                      <ChevronsRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-[20px] bg-white p-3 border border-[#3d3d3d]/10 shadow-md">
                  <img
                    src="https://framerusercontent.com/images/l1CpF5EzDSCksVlxtEBU1RLqPI.png"
                    alt="Smarter Timing for Faster Workflows"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto rounded-[14px]"
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* AIwork Showcase Card 2: Smarter Timing & When It Works + veTFqarPod5nyzjlnsyKI6W1o.png */}
          <div
            data-framer-name="Default 2"
            className="rounded-[24px] bg-[#fdfaf7] border border-[#3d3d3d]/10 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="rounded-[20px] bg-white p-3 border border-[#3d3d3d]/10 shadow-md">
                <img
                  src="https://framerusercontent.com/images/veTFqarPod5nyzjlnsyKI6W1o.png"
                  alt="AI-Driven Hypothesis Parsing and Second-Order Automation"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto rounded-[14px]"
                />
              </div>
            </div>

            <div
              data-framer-name="Content Wrap"
              className="lg:col-span-7 order-1 lg:order-2 space-y-5"
            >
              <div className="text-xs font-mono font-bold text-[#2f69ff] uppercase">
                When It Works · Smarter Timing for Faster Workflows
              </div>
              <h3 className="text-xl sm:text-3xl font-extrabold text-black tracking-tight leading-snug">
                Catch second-order commodity ripples and prediction spreads before the crowd
              </h3>
              <p className="text-xs sm:text-sm text-[#3d3d3d]/80 leading-relaxed">
                Our ROSTR Middle-Out Action Compressor monitors corporate rollouts, SEC filings, and
                prediction market orderbooks simultaneously—compressing 31,450ms of sequential
                research into 11ms. Click any real-world catalyst below to load it directly into your
                dashboard:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    label: 'Pepsi Can Rollout → CME Aluminum (ALI=F) & AA Calls',
                    sub: '3-Day Profit · +10.8% Target',
                    cfg: PERSONA_PROFILES.ACTIVE_TRADER.wizardConfig,
                  },
                  {
                    label: 'Polymarket 64¢ vs Kalshi 71¢ Fed Rate Cut Spread',
                    sub: '3-Day Profit · +7.0% Locked Arb',
                    cfg: {
                      ...PERSONA_PROFILES.ACTIVE_TRADER.wizardConfig,
                      hypothesisPrompt:
                        'Polymarket vs Kalshi FOMC Rate Cut & Aluminum Event Contract Dislocation (+7.0% to +9.0% cross-book spread).',
                      philosophy: 'Prediction & Betting Markets' as const,
                    },
                  },
                  {
                    label: 'AI Chip CoWoS Bottleneck → TSMC & NVDA ADR Basis',
                    sub: 'Weekly Cycle · +12.4% Target',
                    cfg: PERSONA_PROFILES.HIGH_INCOME_PRO.wizardConfig,
                  },
                  {
                    label: '$100 Starter → 10x Annual Compounding Schedule',
                    sub: 'Hold 1 Year · 0.65% Max Stop',
                    cfg: PERSONA_PROFILES.BEGINNER_100.wizardConfig,
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={async () => {
                      if (onApplyPresetConfig) {
                        await onApplyPresetConfig(item.cfg);
                        if (onJumpToDashboard) onJumpToDashboard();
                      } else {
                        onLaunchTerminal();
                      }
                    }}
                    className="text-left p-3.5 rounded-2xl bg-white border border-[#3d3d3d]/10 hover:border-[#2f69ff] transition-all group"
                  >
                    <div className="text-xs font-bold text-black group-hover:text-[#2f69ff]">
                      {item.label}
                    </div>
                    <div className="text-[11px] font-mono text-[#3d3d3d]/70 mt-1">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. AIWORK HOW IT WORK SECTION (data-framer-name="How It Work Section")
          3 Connected Steps: Setup your AI workflows -> Connect tools -> Deploy agents -> Track
         ===================================================================== */}
      <section
        data-framer-name="How It Work Section"
        className="w-full py-20 px-4 sm:px-8 bg-[#f7f8fd]"
      >
        <div className="max-w-[1240px] mx-auto space-y-12">
          <div className="text-center max-w-[680px] mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#2f69ff] font-bold">
              How It Works · Setup Your AI Workflows
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-black tracking-tight">
              Deploy your personal trading agent without technical effort
            </h2>
            <p className="text-sm sm:text-base text-[#3d3d3d]/75">
              Just state what you see in the present, verify the foundation math, and execute within
              a 15-minute daily rhythm.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Connect & State Your Hypothesis (Know)',
                time: 'Morning · 5 Minutes',
                desc: 'Open the 4-Step Wizard over morning coffee. Pick your hypothesis (Pepsi aluminum cans, AI chips, Fed odds) and your horizon (3-Day +10%, Weekly, or 1-Year).',
              },
              {
                step: '02',
                title: 'Compile 11 POP Docs & Verify W=1.00 (Believe)',
                time: 'Workday · 0 Minutes Screen Time',
                desc: 'Sentinel’s Middle-Out DAG compiles 11 Markdown research files in 11ms while Diagrid Virtual Actors monitor spreads at 0 CPU during your workday.',
              },
              {
                step: '03',
                title: 'Execute & Track Compounding (Buy)',
                time: 'Evening · 10 Minutes',
                desc: 'Route top-ranked signals with an automated 0.65% max stop-loss, chat with the Quant Co-Pilot, and track your $100-to-10x or Plaid DMA portfolio.',
              },
            ].map((st, i) => (
              <div
                key={i}
                className="relative p-7 rounded-[20px] bg-white border border-[#3d3d3d]/10 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-full bg-[#2f69ff] text-white font-mono font-bold text-sm flex items-center justify-center">
                    {st.step}
                  </span>
                  <span className="text-xs font-mono text-[#2f69ff] font-semibold">
                    {st.time}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-black pt-1">{st.title}</h3>
                <p className="text-xs sm:text-sm text-[#3d3d3d]/75 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          7. AIWORK INTEGRATION SECTION (data-framer-name="Integration Section")
          Exact AIwork 6-Card Integration Grid with original Framer SVG icons
         ===================================================================== */}
      <section data-framer-name="Integration Section" className="w-full py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-[1240px] mx-auto space-y-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-[540px]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#2f69ff] font-bold">
                Instant Integrations · Composio &amp; Plaid
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-black tracking-tight">
                Connected to every market wire and brokerage tool
              </h2>
            </div>
            {onNavigateToView && (
              <button
                type="button"
                onClick={() => onNavigateToView(AppView.AGENT_SANDBOX)}
                className="self-start lg:self-auto px-5 py-2.5 rounded-full bg-[#f7f8fd] hover:bg-[#e8f1ff] text-[#2f69ff] font-bold text-xs border border-[#2f69ff]/20 transition-colors"
              >
                Open Live Sandbox &amp; Composio Hub →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AIWORK_INTEGRATIONS.map((intg, i) => (
              <div
                key={i}
                data-framer-name="Integration Card Wrapper"
                className="p-6 rounded-[20px] bg-[#fafafa] border border-[#3d3d3d]/10 flex flex-col justify-between space-y-4 hover:bg-white hover:shadow-sm transition-all"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#3d3d3d]/10 flex items-center justify-center p-2.5 shadow-2xs">
                    <img
                      src={intg.icon}
                      alt={intg.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-black">{intg.name}</h3>
                  <p className="text-xs sm:text-sm text-[#3d3d3d]/75 leading-relaxed">
                    {intg.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. AIWORK TESTIMONIAL SECTION (data-framer-name="Testimonial Section")
          Exact AIwork author portraits & 5.0 Star Cards
         ===================================================================== */}
      <section
        data-framer-name="Testimonial Section"
        className="relative w-full py-20 px-4 sm:px-8 overflow-hidden bg-[#f7f8fd]"
      >
        <div className="max-w-[1240px] mx-auto space-y-12">
          <div className="text-center max-w-[640px] mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#2f69ff] font-bold">
              Testimonials · Trusted by Personal Traders
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-black tracking-tight">
              From $100 starters to eight-figure portfolios
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {AIWORK_TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="p-6 rounded-[20px] bg-white border border-[#3d3d3d]/10 shadow-xs flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-[#f5b800]">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-[#f5b800] text-[#f5b800]" />
                    ))}
                    <span className="text-xs font-bold text-black ml-1">{t.rating}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#3d3d3d] leading-relaxed">{t.quote}</p>
                </div>

                <div
                  data-framer-name="Author Details"
                  className="flex items-center gap-3 pt-3 border-t border-[#3d3d3d]/10"
                >
                  <img
                    src={t.avatar}
                    alt={t.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-[#3d3d3d]/10"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-black truncate">{t.name}</div>
                    <div className="text-[11px] text-[#3d3d3d]/70 truncate">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          9. AIWORK FAQS SECTION (data-framer-name="FAQs")
          Interactive Accordion answering How, What, Why, When, Where
         ===================================================================== */}
      <section data-framer-name="FAQs" className="w-full py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-[920px] mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#2f69ff] font-bold">
              Help &amp; Support · Personal Trader Guide
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-black tracking-tight">
              Everything you need to Know, Believe, and Buy
            </h2>
          </div>

          <div className="space-y-3">
            {AIWORK_FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  className="rounded-[18px] border border-[#3d3d3d]/10 bg-[#fafafa] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
                  >
                    <span className="text-sm sm:text-base font-bold text-black">{faq.q}</span>
                    <span className="w-7 h-7 rounded-full bg-white border border-[#3d3d3d]/10 flex items-center justify-center shrink-0 text-[#2f69ff]">
                      {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-[#3d3d3d]/80 leading-relaxed border-t border-[#3d3d3d]/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          10. AIWORK CLOSING CTA BANNER (with Shape 44hCWtn3BKzjAtKugGAid295p8.png)
         ===================================================================== */}
      <section className="w-full px-4 sm:px-8 pb-14 bg-white">
        <div className="max-w-[1240px] mx-auto relative rounded-[24px] bg-[#0f172a] text-white p-8 sm:p-14 overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <img
            src="https://framerusercontent.com/images/44hCWtn3BKzjAtKugGAid295p8.png"
            alt="AIwork Wave Shape"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
          />

          <div className="relative z-10 max-w-[640px] space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-[#90c3fe] font-bold">
              Sentinel · Trading · Know. Believe. Buy.
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Save your life. Invest your future. Research the present.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your live ROSTR Command Dashboard is active directly below—complete with 100 ranked
              signals, the Live Quant Co-Pilot Chat, Second-Order Commodity Ripple chains, and Plaid
              DMA holdings.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onLaunchTerminal}
              className="group inline-flex items-center gap-3 pl-6 pr-2.5 py-2.5 rounded-full bg-[#2f69ff] hover:bg-[#1e56eb] text-white font-bold text-xs sm:text-sm shadow-lg transition-all"
            >
              <span>Launch Hypothesis Wizard</span>
              <span className="w-8 h-8 rounded-full bg-white text-[#2f69ff] flex items-center justify-center">
                <ChevronsRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

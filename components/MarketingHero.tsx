import React, { useState } from 'react';
import { HypothesisWizardConfig, AppView } from '../types';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Compass,
  ShieldCheck,
  TrendingUp,
  Clock,
  FileText,
  Layers,
  Terminal,
  CheckCircle2,
  Sun,
  Briefcase,
  Moon,
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

interface CatalystShowcaseItem {
  id: string;
  number: string;
  title: string;
  category: string;
  horizon: HypothesisWizardConfig['holdingHorizon'];
  targetPct: number;
  knowText: string;
  believeText: string;
  buyText: string;
  primaryTicker: string;
  venuePair: string;
  wizardConfig: HypothesisWizardConfig;
}

const CATALYST_SHOWCASES: CatalystShowcaseItem[] = [
  {
    id: 'pepsi-aluminum',
    number: '01',
    title: 'Pepsi Canned Beverage Expansion → Aluminum Commodity Call Skew',
    category: 'Second-Order Commodity Ripple',
    horizon: '3-Day Profit',
    targetPct: 10.8,
    knowText:
      'You notice or read that PepsiCo is expanding promotional canned beverage rollouts across North America while phasing out plastic bottles.',
    believeText:
      'In 11ms, Sentinel maps the second-order supply chain: beverage can sheet coil demand tightens CME Aluminum warehouse inventories and lifts smelter margins (W = 1.00 verified across 248 sources).',
    buyText:
      'Execute CME Aluminum Dec $2,650 Calls (ALI=F), Alcoa (AA) $42.60 Calls, and Ball Corp (BALL) with a strict 0.65% single-leg stop-loss.',
    primaryTicker: 'ALI=F · AA · BALL',
    venuePair: 'CME COMEX Futures ⇄ Producer Equity Options',
    wizardConfig: {
      hypothesisPrompt:
        'High Pepsi canned beverage sales initiative creates supply strain in packaging sheet coil -> Buy CME Aluminum Dec $2,650 Calls (ALI=F), Alcoa (AA) Calls, and Ball Corp (BALL) before upstream spot reprices.',
      philosophy: 'Second-Order Commodity Ripples',
      goalTarget: '+10% Target',
      targetReturnPct: 10.8,
      holdingHorizon: '3-Day Profit',
      assetClasses: ['Commodities', 'Options', 'Equities', 'Prediction Markets'],
      capitalAllocated: 10000,
      maxDrawdownPct: 0.65,
      autoOptimizeWholeness: true,
    },
  },
  {
    id: 'polymarket-kalshi',
    number: '02',
    title: 'Polymarket vs. Kalshi FOMC & Inflation Contract Dislocation',
    category: 'Prediction & Betting Markets',
    horizon: '3-Day Profit',
    targetPct: 10.2,
    knowText:
      'Retail sentiment on Polymarket prices an upcoming Fed rate cut & Aluminum threshold contract at 62¢–64¢, while institutional CFTC orderbooks on Kalshi price the exact same outcome at 71¢.',
    believeText:
      'Sentinel’s prediction-market-arb skill verifies contract resolution rules across both venues via Calibrated Truth regex, confirming a +7.0% to +9.0% cross-book probability spread.',
    buyText:
      'Lock in the delta-neutral event spread (Buy Polymarket YES at 62¢–64¢ / Hedge Kalshi counter-leg at 71¢) targeting +10.2% over a 3-Day convergence window.',
    primaryTicker: 'POLY-ALU · KALSHI-FED',
    venuePair: 'Polymarket CLOB ⇄ Kalshi CFTC Regulated Book',
    wizardConfig: {
      hypothesisPrompt:
        'Retail flow on Polymarket lags institutional CFTC orderbook repricing on Kalshi and CME -> Lock delta-neutral +7.0% to +9.0% spreads on FOMC Rate Cut (64¢ vs 71¢) and Aluminum >$2,700/t Event Contracts.',
      philosophy: 'Prediction & Betting Markets',
      goalTarget: '+10% Target',
      targetReturnPct: 10.2,
      holdingHorizon: '3-Day Profit',
      assetClasses: ['Prediction Markets', 'Commodities', 'Options'],
      capitalAllocated: 5000,
      maxDrawdownPct: 0.65,
      autoOptimizeWholeness: true,
    },
  },
  {
    id: 'ai-chips-cowos',
    number: '03',
    title: 'AI Chip CoWoS Packaging Bottleneck → TSMC & NVIDIA Dual-Listing Basis',
    category: 'Semiconductor Statistical Arbitrage',
    horizon: 'Weekly',
    targetPct: 12.4,
    knowText:
      'Hyperscaler AI datacenter orders surge, creating a physical bottleneck in TSMC CoWoS wafer packaging and HBM3e high-bandwidth memory.',
    believeText:
      'Sentinel cross-checks SEC EDGAR Form 13F filings and Taipei vs. NYSE orderbooks, identifying a +3.9% ADR basis dislocation before US retail markets open.',
    buyText:
      'Long Taiwan Semiconductor (TSM) ADR & NVIDIA (NVDA) $128.50 call conversions against synthetic sector hedge for a +12.4% weekly target.',
    primaryTicker: 'TSM · NVDA · AVGO',
    venuePair: 'NYSE ADR Book ⇄ Taipei Spot & CBOE Deep Book',
    wizardConfig: {
      hypothesisPrompt:
        'Chips going up on hyperscaler AI capex and CoWoS wafer packaging tightness -> Arbitrage TSMC (TSM) NYSE ADR vs Taipei spot basis (+3.9%) and scale NVIDIA (NVDA) & Broadcom (AVGO) call conversions.',
      philosophy: 'Statistical Arbitrage',
      goalTarget: '+10% Target',
      targetReturnPct: 12.4,
      holdingHorizon: 'Weekly',
      assetClasses: ['Equities', 'Options', 'Prediction Markets'],
      capitalAllocated: 25000,
      maxDrawdownPct: 0.65,
      autoOptimizeWholeness: true,
    },
  },
  {
    id: 'ev-consolidation',
    number: '04',
    title: 'Strategic EV Automaker Consolidation → Asymmetric Options Skew',
    category: 'M&A Velocity & Options Skew',
    horizon: 'Monthly',
    targetPct: 24.5,
    knowText:
      'Verified automotive engineering channels on X and Google Trends show a +620% breakout in strategic EV platform consolidation and battery licensing discussions.',
    believeText:
      'Sentinel separates creative rumor from operational options flow, confirming institutional call accumulation in discounted EV manufacturers with turn-key factory scale.',
    buyText:
      'Position in Rivian (RIVN) Oct $12.50 Calls, Lucid (LCID) Call Skew, and POLY-EV-MA prediction contract with capped 0.65% downside.',
    primaryTicker: 'RIVN · LCID · POLY-EV-MA',
    venuePair: 'CBOE Options Skew ⇄ S&P Auto Index Hedge',
    wizardConfig: {
      hypothesisPrompt:
        'Elon Musk strategic automotive M&A and EV platform consolidation rumors surging +620% on X and Google Trends -> Buy Rivian (RIVN) Oct $12.50 Calls, Lucid (LCID) Call Skew, and POLY-EV-MA prediction contract.',
      philosophy: 'Asymmetric Options Skew',
      goalTarget: '+25% Swing',
      targetReturnPct: 24.5,
      holdingHorizon: 'Monthly',
      assetClasses: ['Options', 'Equities', 'Prediction Markets'],
      capitalAllocated: 10000,
      maxDrawdownPct: 0.65,
      autoOptimizeWholeness: true,
    },
  },
];

type PersonaKey = 'BEGINNER_100' | 'ACTIVE_BUILDER' | 'ADVANCED_PRO';

interface PersonaBlueprint {
  id: PersonaKey;
  number: string;
  tabLabel: string;
  headline: string;
  whoItIsFor: string;
  startingCapitalRange: string;
  timeCommitment: string;
  coreBenefit: string;
  howYouUseIt: string[];
  whatChangesInYourLife: string;
  sampleSetup: string;
  presetConfig: HypothesisWizardConfig;
}

const PERSONA_BLUEPRINTS: Record<PersonaKey, PersonaBlueprint> = {
  BEGINNER_100: {
    id: 'BEGINNER_100',
    number: '01',
    tabLabel: '01. Starting with $100 (Beginner)',
    headline: 'Start with $100. Learn why markets move without risking your rent.',
    whoItIsFor:
      'First-time and everyday personal traders with low to moderate disposable income who want a safe, plain-English path to grow $100 toward $1,000+ (10x annual compounding) without confusing Wall Street jargon.',
    startingCapitalRange: '$100 to $1,000 Starting Capital (+ $25/mo optional)',
    timeCommitment: '5 to 10 minutes per day',
    coreBenefit:
      'Never gamble on random social media tips again. You type a simple everyday observation ("Pepsi is selling more canned drinks" or "AI chips are in demand"), and Sentinel explains the exact supply-chain ripple and caps your maximum loss at 0.65% ($0.65 on a $100 trade).',
    howYouUseIt: [
      'Pick a simple real-world idea in the 4-Step Wizard or choose a pre-built 3-Day / 1-Year goal.',
      'Read Artifact 01_INTENT_BRIEF.md and 09_EXECUTIVE_OVERVIEW.md written in clear, human language so you genuinely understand the trade.',
      'Follow the $100-to-10x Growth Schedule with automatic 0.65% downside guardrails.',
    ],
    whatChangesInYourLife:
      'Replaces financial anxiety and FOMO with a disciplined, step-by-step compounding plan that protects your downside first.',
    sampleSetup:
      '$100 Initial Capital · +10.4% Cycle Target · $0.65 Max Stop-Loss · Compounding toward $1,080+ in 12 Months',
    presetConfig: {
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
  ACTIVE_BUILDER: {
    id: 'ACTIVE_BUILDER',
    number: '02',
    tabLabel: '02. Active Personal Trader ($2.5K – $50K)',
    headline: 'Turn real-world news into +10% 3-Day and Weekly second-order setups.',
    whoItIsFor:
      'Working professionals, side-hustle traders, and self-directed investors who understand basic stocks or options and want institutional-grade research compressed into 11 milliseconds before or after work.',
    startingCapitalRange: '$2,500 to $50,000 Active Portfolio',
    timeCommitment: '15 minutes (Morning check + Evening review)',
    coreBenefit:
      'Instead of buying the obvious headline stock after it has already jumped 15%, Sentinel maps the second-order commodity and prediction market ripples (like CME Aluminum futures or Kalshi event contracts) that haven’t repriced yet.',
    howYouUseIt: [
      'Filter the 100 daily signals by your exact cadence: 3-Day Profit (+10%), Weekly, Monthly, or Prediction Markets.',
      'Ask the embedded Quant Co-Pilot Chat to stress-test your thesis against SEC filings, Reddit options skew, and Google Trends velocity.',
      'Scale winning positions from 1.0x up to 2.4x only when One Must Act Foundation Wholeness (W = 1.00) is verified.',
    ],
    whatChangesInYourLife:
      'You stop staring at 1-minute candlesticks during your workday. Diagrid Virtual Actors watch the spreads at zero compute and alert you only when your entry criteria align.',
    sampleSetup:
      '$10,000 Capital · 3-Day Profit (+10.8% Target = +$1,080/cycle) · CME Aluminum (ALI=F) & Alcoa (AA) Call Pair',
    presetConfig: {
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
  ADVANCED_PRO: {
    id: 'ADVANCED_PRO',
    number: '03',
    tabLabel: '03. High-Income & Advanced ($100K – $19.8M+)',
    headline: 'Autonomous multi-venue arbitrage, 11 POP research artifacts, and Plaid DMA scale.',
    whoItIsFor:
      'High-income earners, family offices, quantitative operators, and fund principals managing six- to eight-figure capital across multiple prime brokerage and prediction market accounts.',
    startingCapitalRange: '$100,000 to $19,800,000+ Multi-Account DMA',
    timeCommitment: 'Continuous Autonomous Harness + On-Demand Committee Export',
    coreBenefit:
      'Eliminates 30-second sequential LLM bottlenecks and ad-hoc research notes. Sentinel’s Middle-Out DAG executes 7 omnichannel streams in 11ms, compiles 11 deterministic Markdown deliverables (01_INTENT_BRIEF.md to 11_SKILL.md), and syncs live Plaid DMA buying power.',
    howYouUseIt: [
      'Execute custom skills (commodity-ripple-scout, prediction-market-arb, plaid-dma-sizer) inside the live Agent Sandbox.',
      'Export the full 11-artifact POP Markdown bundle to Linear, GitHub, Slack, and Notion via Composio Managed Integrations.',
      'Enforce Diagrid Catalyst zero-compute approval gates (/raiseEvent) before routing >2.5x leveraged baskets across NYSE, CME, and Kalshi.',
    ],
    whatChangesInYourLife:
      'Gives a single personal trader the research throughput, risk governance, and execution velocity of a 12-person quantitative trading desk.',
    sampleSetup:
      '$250,000 – $19.8M Plaid DMA · Dual-Listing ADR & Prediction CLOB Arbitrage · Sharpe 3.42 · 11/11 POP Artifacts',
    presetConfig: {
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

export const MarketingHero: React.FC<MarketingHeroProps> = ({
  onLaunchTerminal,
  onOpenAuth,
  isAuthenticated,
  userEmail,
  onApplyPresetConfig,
  onNavigateToView,
  onJumpToDashboard,
}) => {
  const [isStoryExpanded, setIsStoryExpanded] = useState<boolean>(true);
  const [activeCatalystIdx, setActiveCatalystIdx] = useState<number>(0);
  const [activePersona, setActivePersona] = useState<PersonaKey>('BEGINNER_100');
  const [isApplyingPreset, setIsApplyingPreset] = useState<boolean>(false);

  const currentCatalyst = CATALYST_SHOWCASES[activeCatalystIdx];
  const currentPersona = PERSONA_BLUEPRINTS[activePersona];

  const handleLoadConfigToDashboard = async (config: HypothesisWizardConfig) => {
    if (!onApplyPresetConfig) {
      onLaunchTerminal();
      return;
    }
    setIsApplyingPreset(true);
    try {
      await onApplyPresetConfig(config);
      if (onJumpToDashboard) {
        onJumpToDashboard();
      }
    } finally {
      setIsApplyingPreset(false);
    }
  };

  // Compact 1-Line Manifesto Ribbon when collapsed
  if (!isStoryExpanded) {
    return (
      <div className="bg-slate-50 border-b border-slate-200 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-700">
            <span className="font-extrabold text-slate-900 tracking-tight">
              SENTINEL · TRADING
            </span>
            <span aria-hidden="true" className="text-slate-300">
              /
            </span>
            <span className="font-semibold text-blue-700">Know. Believe. Buy.</span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span className="text-slate-600">
              Save your life. Invest your future. Research the present.
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onLaunchTerminal}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              Open Hypothesis Wizard
            </button>
            <button
              type="button"
              onClick={() => setIsStoryExpanded(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors whitespace-nowrap"
            >
              <span>Show Full Sentinel Guide</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white border-b border-slate-200 relative overflow-hidden">
      {/* Subtle architectural grid canvas inspired by AIwork Framer template */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_75%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 relative z-10 space-y-16 sm:space-y-24">
        {/* Top Control Bar: Manifesto Breadcrumb + Instant Collapse Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono text-slate-600">
            <span className="font-bold text-slate-900">SENTINEL PERSONAL TRADING OS</span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span>From $100 Starter to $19.8M Institutional DMA</span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span className="text-blue-700 font-semibold">
              11ms ROSTR Middle-Out Research Engine
            </span>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {onJumpToDashboard && (
              <button
                type="button"
                onClick={onJumpToDashboard}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap"
              >
                Skip to Live Command Dashboard ↓
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsStoryExpanded(false)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <span>Compact Mode</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ===================================================================
            BLOCK 1: AIWORK HERO & MANIFESTO + INTERACTIVE CATALYST SIMULATOR
           =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left 7 Columns: Core Essence & Manifesto */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="text-xs font-mono uppercase tracking-widest text-blue-600 font-bold">
                Sentinel · Personal Quantitative Intelligence
              </div>

              <h1
                className="font-extrabold tracking-tight text-slate-900 leading-[1.06] text-balance"
                style={{ fontSize: 'clamp(2.35rem, 4.3vw, 3.85rem)' }}
              >
                Sentinel. Trading.{' '}
                <span className="text-blue-600">Know. Believe. Buy.</span>
              </h1>

              <p className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight text-balance">
                Save your life. Invest your future. Research the present.
              </p>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Whether you are starting with <strong className="text-slate-900">$100</strong> and
                learning your first trade, or managing{' '}
                <strong className="text-slate-900">$10,000 to $19.8M+</strong> across brokerage and
                prediction markets—Sentinel turns what you see happening in the world right now into
                verified supply-chain research, mathematical conviction, and downside-protected
                execution.
              </p>

              {/* The 3-Word Essence Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-mono font-bold text-blue-600">01. KNOW</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    Research the Present
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Scan 7 live wires (X, Reddit, Google Trends, Polymarket, Kalshi, SEC, CME) in
                    11ms.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-mono font-bold text-emerald-600">02. BELIEVE</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    Verify the Foundation
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Enforce Wholeness (W = 1.00) and read 11 written POP research briefs before you
                    risk a dollar.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-mono font-bold text-slate-900">03. BUY</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    Invest Your Future
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Execute 3-Day (+10%), Weekly, or 1-Year signals with an automated 0.65% max
                    stop-loss.
                  </p>
                </div>
              </div>
            </div>

            {/* Primary CTA Row */}
            <div className="pt-2 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={onLaunchTerminal}
                className="py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Build My Hypothesis &amp; Goals</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              {onJumpToDashboard && (
                <button
                  type="button"
                  onClick={onJumpToDashboard}
                  className="py-3.5 px-5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold text-sm transition-all whitespace-nowrap text-center"
                >
                  View Live Command Dashboard ↓
                </button>
              )}

              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="py-3.5 px-5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl font-semibold text-sm transition-all whitespace-nowrap text-center"
                >
                  Sign In / Save Portfolio
                </button>
              ) : (
                <div className="text-xs font-mono text-slate-600 flex items-center justify-center sm:justify-start px-3.5 py-2.5 bg-slate-100 rounded-xl truncate">
                  <span className="truncate">Signed In: {userEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right 5 Columns: Live Interactive "Know -> Believe -> Buy" Catalyst Previewer */}
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 flex flex-col justify-between space-y-5 shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-blue-400">
                    Interactive Live Catalyst Preview
                  </div>
                  <h2 className="text-base font-bold text-white mt-0.5">
                    See How Sentinel Turns News Into Action
                  </h2>
                </div>
                <span className="text-xs font-mono text-emerald-400 tabular-nums">
                  {currentCatalyst.horizon} · +{currentCatalyst.targetPct}%
                </span>
              </div>

              {/* 4 Catalyst Selector Tabs */}
              <div className="grid grid-cols-2 gap-1.5">
                {CATALYST_SHOWCASES.map((item, idx) => {
                  const active = idx === activeCatalystIdx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveCatalystIdx(idx)}
                      className={`px-3 py-2 rounded-lg text-left text-xs font-semibold transition-all border ${
                        active
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-mono text-[10px] opacity-75 mr-1">{item.number}.</span>
                      <span className="truncate">{item.category}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Catalyst Know -> Believe -> Buy Breakdown */}
              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1">
                  <div className="text-[11px] font-mono font-bold text-blue-400 uppercase">
                    01. KNOW (Research the Present)
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {currentCatalyst.knowText}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1">
                  <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase">
                    02. BELIEVE (Verify Foundation W = 1.00)
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {currentCatalyst.believeText}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-amber-300 uppercase">
                      03. BUY (Invest Your Future)
                    </span>
                    <span className="text-[11px] font-mono text-white font-bold">
                      {currentCatalyst.primaryTicker}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {currentCatalyst.buyText}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isApplyingPreset}
              onClick={() => handleLoadConfigToDashboard(currentCatalyst.wizardConfig)}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>
                {isApplyingPreset
                  ? 'Compiling Catalyst into Dashboard...'
                  : `Load "${currentCatalyst.category}" into Live Dashboard`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ===================================================================
            BLOCK 2: MULTI-CUSTOMER PERSONAL TRADER SWITCHER (NO PRICING)
            Beginner ($100) to High-Income Advanced ($19.8M+)
           =================================================================== */}
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-bold">
                Built for Every Personal Trader · Low to High Income · Beginner to Advanced
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-balance">
                One intelligent operating system that meets you at your exact stage of life.
              </h2>
            </div>

            {/* Segmented Persona Control */}
            <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
              {(Object.keys(PERSONA_BLUEPRINTS) as PersonaKey[]).map((key) => {
                const item = PERSONA_BLUEPRINTS[key];
                const active = activePersona === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActivePersona(key)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.tabLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Persona Detail Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-600">
                  <span className="font-bold text-blue-600">
                    STAGE {currentPersona.number}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{currentPersona.startingCapitalRange}</span>
                  <span aria-hidden="true">·</span>
                  <span>{currentPersona.timeCommitment}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {currentPersona.headline}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {currentPersona.whoItIsFor}
                </p>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5">
                  <div className="text-xs font-bold text-slate-900">
                    Why Sentinel Matters at This Stage:
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {currentPersona.coreBenefit}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isApplyingPreset}
                  onClick={() => handleLoadConfigToDashboard(currentPersona.presetConfig)}
                  className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors inline-flex items-center gap-2"
                >
                  <span>Apply Stage {currentPersona.number} Profile to My Live Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {activePersona === 'BEGINNER_100' && onNavigateToView && (
                  <button
                    type="button"
                    onClick={() => onNavigateToView(AppView.GROWTH_10X)}
                    className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold transition-colors"
                  >
                    Open $100 to 10x Compounding Calculator →
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                  How You Use Sentinel ({currentPersona.tabLabel})
                </div>
                <ul className="space-y-2.5">
                  {currentPersona.howYouUseIt.map((stepText, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{stepText}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-900">
                  Where It Fits Into Your Life:
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentPersona.whatChangesInYourLife}
                </p>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 tabular-nums">
                  {currentPersona.sampleSetup}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            BLOCK 3: HOW TO USE IT (01. KNOW -> 02. BELIEVE -> 03. BUY)
            & WHAT YOU GET (AIWORK ASYMMETRIC BENTO GRID)
           =================================================================== */}
        <div className="space-y-8 pt-6 border-t border-slate-200">
          <div className="max-w-3xl space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-bold">
              How to Use It &amp; What You Get
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-balance">
              From a real-world observation to 11 institutional research files and 100 ranked
              signals in 11 milliseconds.
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              You don’t need to write code or read 200-page earnings transcripts. Follow three
              simple steps and receive four concrete deliverables every single session.
            </p>
          </div>

          {/* 3-Step How To Use It Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span className="font-bold text-blue-600">01. KNOW</span>
                <span>Step 1 · 60 Seconds</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                State What You See in the Present
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Open the 4-Step Hypothesis Wizard. Type any trend you notice (&ldquo;Pepsi is
                expanding aluminum cans&rdquo;, &ldquo;AI chips are backordered&rdquo;,
                &ldquo;Fed odds look mispriced&rdquo;) and choose your timeline: 3-Day Profit
                (+10%), Weekly, Monthly, Quarterly, or Hold 1 Year.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span className="font-bold text-emerald-600">02. BELIEVE</span>
                <span>Step 2 · 11ms ROSTR DAG</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Verify the Supply-Chain &amp; Odds Math
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Sentinel’s Middle-Out DAG queries 7 live streams in parallel, checks all 5 One Must
                Act Foundation criteria (W = 1.00), and generates 11 readable Markdown documents
                explaining the upstream commodity, equity, and prediction market ripple.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span className="font-bold text-slate-900">03. BUY</span>
                <span>Step 3 · Guarded Execution</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Act with a Hard 0.65% Stop-Loss
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Review your top ranked trade tickets in the Command Dashboard. Every ticket gives
                you the exact ticker, primary venue, hedge venue, target return (+10%+), and maximum
                drawdown guardrail so you never trade blind.
              </p>
            </div>
          </div>

          {/* What You Get: Asymmetric 12-Col Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Span 7: 100 Daily Signals + Second-Order Ripples */}
            <div className="lg:col-span-7 p-6 sm:p-7 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-5">
              <div className="space-y-2.5">
                <div className="text-xs font-mono text-blue-600 font-bold">
                  01. DELIVERABLE · 100 DAILY ARBITRAGE &amp; PREDICTION SIGNALS
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Second-Order Commodity Ripples &amp; Polymarket/Kalshi Odds Spreads
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  You get 100 continuously updated opportunities across CME Commodities (Aluminum{' '}
                  <code className="font-mono text-slate-800">ALI=F</code>, Copper, Uranium),
                  Producer Equities (<code className="font-mono text-slate-800">AA, BALL, TSM</code>
                  ), Options Conversions, and Prediction Market spreads (Polymarket vs. Kalshi).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs tabular-nums">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-400 text-[10px]">HORIZON FILTERS</div>
                  <div className="text-slate-900 font-bold mt-1">3-Day · Wk · Mo · 1-Yr</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-400 text-[10px]">PREDICTION ARBS</div>
                  <div className="text-emerald-700 font-bold mt-1">+7.0% to +9.0% Edge</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-400 text-[10px]">DOWNSIDE STOP</div>
                  <div className="text-slate-900 font-bold mt-1">0.65% Max Leg Risk</div>
                </div>
              </div>
            </div>

            {/* Span 5: 11 POP Research Artifacts */}
            <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-5">
              <div className="space-y-2.5">
                <div className="text-xs font-mono text-emerald-700 font-bold">
                  02. DELIVERABLE · 11 WRITTEN POP RESEARCH FILES (.MD)
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Your Personal Research Desk in Plain Markdown
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Every hypothesis compiles 11 canonical documents—from{' '}
                  <code className="font-mono text-slate-800">01_INTENT_BRIEF.md</code> and{' '}
                  <code className="font-mono text-slate-800">03_KPI_TRACKING.md</code> to{' '}
                  <code className="font-mono text-slate-800">09_EXECUTIVE_OVERVIEW.md</code> and{' '}
                  <code className="font-mono text-slate-800">10_TASKS.md</code>—ready to read or
                  download.
                </p>
              </div>

              {onNavigateToView && (
                <button
                  type="button"
                  onClick={() => onNavigateToView(AppView.PAL_RUNTIME)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  Open POP 11-Artifact Explorer &amp; Export →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================================
            BLOCK 4: WHY IT IS IMPORTANT + WHEN IT WORKS + WHERE IT FITS IN LIFE
           =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-slate-200">
          {/* Left 5 Cols: Why It Is Important ("Save Your Life. Invest Your Future.") */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-bold">
              Why It Is Important
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight text-balance">
              Why most personal traders lose—and how Sentinel protects your time and capital.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Most personal traders face an unfair choice: either spend 40 hours a week glued to
              charts, or buy hyped tickers on social media after institutions have already exited.
              Sentinel gives you your life back while enforcing institutional discipline:
            </p>

            <div className="space-y-3 pt-1">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-xs font-bold text-slate-900">
                  1. Never Scale an Incomplete Idea (One Must Act W = 1.00)
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  If a trade idea is missing a catalyst, a second-order asset, a venue pair, a
                  timeframe, or a stop-loss, Sentinel automatically enriches and verifies all 5
                  criteria before calculating position size.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-xs font-bold text-slate-900">
                  2. 31,450ms of Research Compressed into 11ms
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Our Middle-Out DAG runs commodity, options, and prediction market scanners in
                  parallel waves so you see the spread before the crowd reacts.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-xs font-bold text-slate-900">
                  3. Creative Warmth + Calibrated Operational Truth
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Brainstorm any wild hypothesis freely, while Sentinel’s regex truth gate verifies
                  real tickers, contract dates, and margin splits so you never act on hallucinated
                  data.
                </p>
              </div>
            </div>
          </div>

          {/* Right 7 Cols: When It Works + Where It Fits Into Your Daily Life */}
          <div className="lg:col-span-7 space-y-6">
            {/* Where It Fits Into Your Life (3-Part Daily Rhythm) */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold">
                  Where It Fits Into Your Life
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  Designed for a 15-minute daily routine—not 8 hours of screen addiction.
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-amber-300">
                    <span>MORNING · 5 MIN</span>
                    <Sun className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-white">Know the Present</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Over morning coffee, check Sentinel’s overnight 7-stream digest and select your
                    3-Day (+10%), Weekly, or 1-Year focus.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-blue-300">
                    <span>WORKDAY · 0 MIN</span>
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-white">Live Your Life</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Focus on your job, family, or business. Diagrid Virtual Actors monitor spreads at
                    0 CPU and hold leveraged orders until you approve.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-300">
                    <span>EVENING · 10 MIN</span>
                    <Moon className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-white">Believe &amp; Buy</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Review your 11 POP research files, chat with the Co-Pilot, and track your
                    Plaid holdings or $100-to-10x milestones.
                  </p>
                </div>
              </div>
            </div>

            {/* When It Works: 4 Repeatable Market Moments */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-bold">
                    When It Works Best
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Four Repeatable Market Windows Where Sentinel Excels
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-500">Click any window to load</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATALYST_SHOWCASES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleLoadConfigToDashboard(cat.wizardConfig)}
                    className="text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/30 transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                      <span className="font-bold text-slate-900 group-hover:text-blue-700">
                        {cat.number}. {cat.category}
                      </span>
                      <span className="text-emerald-700 font-bold">+{cat.targetPct}%</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">
                      {cat.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      {cat.primaryTicker} · {cat.horizon}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

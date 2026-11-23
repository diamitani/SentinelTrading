import React, { useState } from 'react';
import {
  HypothesisWizardConfig,
  TradingPhilosophyType,
  GoalHorizonTag,
  MarketCategoryType,
} from '../types';
import {
  Sparkles,
  X,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Target,
  Clock,
  Layers,
  TrendingUp,
  Cpu,
} from 'lucide-react';

interface HypothesisWizardModalProps {
  isOpen: boolean;
  initialConfig?: HypothesisWizardConfig;
  onClose: () => void;
  onSubmit: (config: HypothesisWizardConfig) => Promise<void>;
}

const PRESET_SCENARIOS: Array<{
  title: string;
  tag: string;
  prompt: string;
  philosophy: TradingPhilosophyType;
  horizon: GoalHorizonTag;
  goalTarget: HypothesisWizardConfig['goalTarget'];
  targetReturnPct: number;
  assets: MarketCategoryType[];
}> = [
  {
    title: 'Pepsi Beverage Can Rollout → CME Aluminum Spike',
    tag: 'Second-Order Commodity',
    prompt:
      'High Pepsi canned beverage sales initiative creates supply strain in packaging sheet coil -> Buy CME Aluminum Dec $2,650 Calls (ALI=F), Alcoa (AA) Calls, and Ball Corp (BALL) before upstream spot reprices.',
    philosophy: 'Second-Order Commodity Ripples',
    horizon: '3-Day Profit',
    goalTarget: '+10% Target',
    targetReturnPct: 10.8,
    assets: ['Commodities', 'Options', 'Equities', 'Prediction Markets'],
  },
  {
    title: 'Polymarket vs. Kalshi FOMC & Commodity Odds Spread',
    tag: 'Prediction Markets Arb',
    prompt:
      'Retail flow on Polymarket lags institutional CFTC orderbook repricing on Kalshi and CME -> Lock delta-neutral +7.0% to +9.0% spreads on FOMC Rate Cut (64¢ vs 71¢) and Aluminum >$2,700/t Event Contracts.',
    philosophy: 'Prediction & Betting Markets',
    horizon: '3-Day Profit',
    goalTarget: '+10% Target',
    targetReturnPct: 10.2,
    assets: ['Prediction Markets', 'Commodities', 'Options'],
  },
  {
    title: 'AI Chips CoWoS Bottleneck → TSMC & NVDA Basis',
    tag: 'Semiconductor Arbitrage',
    prompt:
      'Chips going up on hyperscaler AI capex and CoWoS wafer packaging tightness -> Arbitrage TSMC (TSM) NYSE ADR vs Taipei spot basis (+3.9%) and scale NVIDIA (NVDA) & Broadcom (AVGO) call conversions.',
    philosophy: 'Statistical Arbitrage',
    horizon: 'Weekly',
    goalTarget: '+10% Target',
    targetReturnPct: 12.4,
    assets: ['Equities', 'Options', 'Prediction Markets'],
  },
  {
    title: 'Elon Automotive M&A Speculation → EV Call Skew',
    tag: 'Asymmetric Event Skew',
    prompt:
      'Elon Musk strategic automotive M&A and EV platform consolidation rumors surging +620% on X and Google Trends -> Buy Rivian (RIVN) Oct $12.50 Calls, Lucid (LCID) Call Skew, and POLY-EV-MA prediction contract.',
    philosophy: 'Asymmetric Options Skew',
    horizon: 'Monthly',
    goalTarget: '+25% Swing',
    targetReturnPct: 24.5,
    assets: ['Options', 'Equities', 'Prediction Markets'],
  },
];

const PHILOSOPHIES: Array<{
  id: TradingPhilosophyType;
  title: string;
  desc: string;
}> = [
  {
    id: 'Second-Order Commodity Ripples',
    title: 'Second-Order Commodity Ripples',
    desc: 'Trace corporate/consumer initiatives (Pepsi cans, AI datacenters) to upstream futures (CME Aluminum, Copper, Uranium) & smelters.',
  },
  {
    id: 'Prediction & Betting Markets',
    title: 'Prediction & Betting Markets',
    desc: 'Arbitrage probability dislocations across Polymarket CLOB, Kalshi CFTC Event Contracts, and CME Event Futures.',
  },
  {
    id: 'Statistical Arbitrage',
    title: 'Cross-Venue Statistical Arbitrage',
    desc: 'Capture dual-listed ADR basis (NYSE vs LSE/Taipei), cash vs futures carry, and dark pool depth divergences.',
  },
  {
    id: 'Asymmetric Options Skew',
    title: 'Asymmetric Options Skew & Box Spreads',
    desc: 'Exploit underpriced implied volatility and CBOE conversion boxes around M&A and earnings catalysts.',
  },
  {
    id: 'Long-Term Enterprise Compound',
    title: 'Long-Term Enterprise Compound ($100 → 10x)',
    desc: 'Systematic low-drawdown (0.65% max stop) compounding from $100 entry capital up to institutional Plaid DMA scale.',
  },
];

const HORIZONS: Array<{
  id: GoalHorizonTag;
  label: string;
  sub: string;
  defaultPct: number;
}> = [
  { id: '3-Day Profit', label: '3-Day Profit', sub: 'Fast catalyst & event spread', defaultPct: 10.4 },
  { id: 'Weekly', label: 'Weekly Cycle', sub: '5-7 day basis convergence', defaultPct: 12.5 },
  { id: 'Monthly', label: 'Monthly Swing', sub: '30-day commodity & options cycle', defaultPct: 22.0 },
  { id: 'Quarterly', label: 'Quarterly Macro', sub: '90-day earnings & supply ripple', defaultPct: 45.0 },
  { id: 'Hold 1 Year', label: 'Hold 1 Year', sub: '12-month 10x enterprise compound', defaultPct: 120.0 },
];

const GOAL_TARGETS: Array<{
  id: HypothesisWizardConfig['goalTarget'];
  label: string;
  pct: number;
}> = [
  { id: '+10% Target', label: '+10% High-Probability Target', pct: 10.4 },
  { id: '+25% Swing', label: '+25% Catalyst Swing', pct: 25.0 },
  { id: '2x-5x Macro', label: '2x–5x Asymmetric Macro', pct: 150.0 },
  { id: '10x Annual Compound', label: '10x Annual Compound ($100 → $1,000+)', pct: 900.0 },
];

const ALL_ASSET_CLASSES: MarketCategoryType[] = [
  'Commodities',
  'Prediction Markets',
  'Equities',
  'Options',
  'Crypto Basis',
];

export const HypothesisWizardModal: React.FC<HypothesisWizardModalProps> = ({
  isOpen,
  initialConfig,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [config, setConfig] = useState<HypothesisWizardConfig>(
    initialConfig || {
      hypothesisPrompt:
        'High Pepsi canned beverage sales rollout creating packaging sheet coil shortage -> CME Aluminum (ALI=F) & Alcoa (AA) calls + Polymarket/Kalshi inflation event spread; AI chip CoWoS capacity surge -> NVDA/TSM dual-listing arbitrage.',
      philosophy: 'Second-Order Commodity Ripples',
      goalTarget: '+10% Target',
      targetReturnPct: 10.4,
      holdingHorizon: '3-Day Profit',
      assetClasses: ['Commodities', 'Prediction Markets', 'Equities', 'Options', 'Crypto Basis'],
      capitalAllocated: 10000,
      maxDrawdownPct: 0.65,
      autoOptimizeWholeness: true,
    }
  );

  if (!isOpen) return null;

  const applyPreset = (preset: (typeof PRESET_SCENARIOS)[number]) => {
    setConfig((prev) => ({
      ...prev,
      hypothesisPrompt: preset.prompt,
      philosophy: preset.philosophy,
      holdingHorizon: preset.horizon,
      goalTarget: preset.goalTarget,
      targetReturnPct: preset.targetReturnPct,
      assetClasses: preset.assets,
    }));
  };

  const toggleAssetClass = (asset: MarketCategoryType) => {
    setConfig((prev) => {
      const exists = prev.assetClasses.includes(asset);
      if (exists && prev.assetClasses.length === 1) return prev;
      return {
        ...prev,
        assetClasses: exists
          ? prev.assetClasses.filter((a) => a !== asset)
          : [...prev.assetClasses, asset],
      };
    });
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(config);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden my-auto">
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-400/30">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  ROSTR Hypothesis, Trading Philosophy &amp; Goals Wizard
                </h2>
                <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  One Must Act W = 1.00 Guide
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Tell the ROSTR Agent OS your hypothesis, philosophy, and horizon (3-Day +10%, Weekly, 1-Year, Prediction Markets) to compile your research &amp; 11 POP artifacts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close Wizard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Step Progress Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 grid grid-cols-4 gap-2">
          {[
            { num: 1, label: '1. Hypothesis & Catalyst' },
            { num: 2, label: '2. Trading Philosophy' },
            { num: 3, label: '3. Horizon & +10% Goals' },
            { num: 4, label: '4. Wholeness (W=1.00)' },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num as any)}
              className={`text-left px-3 py-2 rounded-lg border text-xs font-bold transition-all ${
                step === s.num
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : step > s.num
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="truncate block">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Step Body */}
        <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  What is your market hypothesis or catalyst? (Creative Warmth + Operational Truth Enabled)
                </label>
                <textarea
                  rows={3}
                  value={config.hypothesisPrompt}
                  onChange={(e) => setConfig({ ...config, hypothesisPrompt: e.target.value })}
                  placeholder="e.g., High Pepsi rollout meaning aluminum commodities (CME ALI=F, Alcoa AA, Ball Corp) might spike +10% in 3 days; or AI chips CoWoS bottleneck..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Or click a pre-calibrated institutional hypothesis scenario:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRESET_SCENARIOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                          {preset.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                          {preset.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{preset.prompt}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950">
                  <span className="font-bold">Calibrated Truth Protocol Active:</span> Creative macro ideation flows with zero friction while operational tickers (<code className="font-mono">ALI=F, AA, BALL, POLY-ALU, KALSHI-FED, NVDA</code>), exchange venues, and expiry dates are regex-verified against canonical registries.
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center">
                  <Layers className="w-4 h-4 mr-1.5 text-blue-600" />
                  Select Your Core Trading Philosophy
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {PHILOSOPHIES.map((phil) => {
                    const selected = config.philosophy === phil.id;
                    return (
                      <button
                        key={phil.id}
                        type="button"
                        onClick={() => setConfig({ ...config, philosophy: phil.id })}
                        className={`text-left p-3.5 rounded-xl border transition-all flex items-start justify-between ${
                          selected
                            ? 'bg-blue-50/80 border-blue-600 ring-1 ring-blue-600'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-slate-900">{phil.title}</div>
                          <div className="text-xs text-slate-600 mt-0.5">{phil.desc}</div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            selected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Active Execution Markets &amp; Venues (Select Multiple)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_ASSET_CLASSES.map((asset) => {
                    const active = config.assetClasses.includes(asset);
                    return (
                      <button
                        key={asset}
                        type="button"
                        onClick={() => toggleAssetClass(asset)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition-all ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {asset}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-1.5 text-blue-600" />
                  Holding Horizon &amp; Execution Cadence
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {HORIZONS.map((h) => {
                    const active = config.holdingHorizon === h.id;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() =>
                          setConfig({
                            ...config,
                            holdingHorizon: h.id,
                            targetReturnPct: h.defaultPct,
                          })
                        }
                        className={`p-3 rounded-xl border text-left transition-all ${
                          active
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold">{h.label}</div>
                        <div className={`text-[10px] mt-1 ${active ? 'text-blue-100' : 'text-slate-500'}`}>
                          {h.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-1.5 text-emerald-600" />
                    Return Goal Preset
                  </label>
                  <div className="space-y-2">
                    {GOAL_TARGETS.map((g) => {
                      const active = config.goalTarget === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() =>
                            setConfig({
                              ...config,
                              goalTarget: g.id,
                              targetReturnPct: g.pct,
                            })
                          }
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between ${
                            active
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{g.label}</span>
                          <span className="font-mono text-emerald-700">+{g.pct}%</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Custom Target Return (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={config.targetReturnPct}
                      onChange={(e) =>
                        setConfig({ ...config, targetReturnPct: Number(e.target.value) || 10 })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Starting / Allocated Capital (From $100 to Institutional DMA)
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {[100, 1000, 10000, 250000, 19800000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setConfig({ ...config, capitalAllocated: amt })}
                          className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                            config.capitalAllocated === amt
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          ${amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Max Single-Leg Drawdown Stop (%)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={config.maxDrawdownPct}
                      onChange={(e) =>
                        setConfig({ ...config, maxDrawdownPct: Number(e.target.value) || 0.65 })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono uppercase text-blue-400">
                    One Must Act Foundation Calculus (0 → 1 → 2..99 → 100)
                  </div>
                  <div className="text-lg font-bold mt-0.5">
                    Foundation Wholeness W = 1.00 Verified · Effective Output V(W, M) = 5.98x
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    All 5 mandatory foundation criteria are bound. Middle-Out DAG will execute Wave 1, Wave 2 (Promise.all parallel skills), and Wave 3 (11 POP Artifacts + 100 Trades) in ~11ms.
                  </p>
                </div>
                <div className="text-right font-mono shrink-0">
                  <div className="text-2xl font-extrabold text-emerald-400">W = 1.00</div>
                  <div className="text-[11px] text-slate-400">Zero Multiplier Decay</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="text-[11px] font-bold uppercase text-slate-400">c₁: Primary Catalyst</div>
                  <div className="text-xs font-semibold text-slate-900 mt-1 line-clamp-2">
                    {config.hypothesisPrompt}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="text-[11px] font-bold uppercase text-slate-400">
                    c₂ &amp; c₃: Philosophy &amp; Markets
                  </div>
                  <div className="text-xs font-semibold text-slate-900 mt-1">
                    {config.philosophy} · {config.assetClasses.join(', ')}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="text-[11px] font-bold uppercase text-slate-400">
                    c₄: Horizon &amp; Profit Target
                  </div>
                  <div className="text-xs font-semibold text-emerald-700 font-mono mt-1">
                    {config.holdingHorizon} · {config.goalTarget} (+{config.targetReturnPct}% Target)
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="text-[11px] font-bold uppercase text-slate-400">
                    c₅: Capital &amp; Risk Guardrail
                  </div>
                  <div className="text-xs font-semibold text-slate-900 font-mono mt-1">
                    ${config.capitalAllocated.toLocaleString()} Capital · {config.maxDrawdownPct}% Max Leg Stop
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-4 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="inline-flex items-center px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back
              </button>
            ) : (
              <span className="text-xs text-slate-500">
                Step {step} of 4 · Guided ROSTR Intake
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            {step < 4 && (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </button>
            )}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm disabled:opacity-50"
            >
              <Cpu className="w-4 h-4 mr-1.5" />
              {isSubmitting
                ? 'Compiling ROSTR DAG Waves...'
                : 'Launch ROSTR Harness & Compile 11 POP Artifacts'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

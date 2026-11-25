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
  Target,
  Clock,
  Layers,
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
    title: 'Fed Rate Path & US Treasury Bonds',
    tag: 'Macro & Gov Bonds',
    prompt:
      'Monitor Federal Reserve policy signals and official US Treasury yields to compare long-duration bond ETFs (TLT), short-term Treasury bills (SHY), and rate-sensitive REITs (VNQ, O).',
    philosophy: 'Long-Term Enterprise Compound',
    horizon: 'Quarterly',
    goalTarget: '+10% Target',
    targetReturnPct: 10.0,
    assets: ['Equities', 'Prediction Markets'],
  },
  {
    title: 'AI Infrastructure & Cybersecurity Spending',
    tag: 'AI & Cyber Security',
    prompt:
      'Enterprise AI rollouts are increasing cloud security budgets and chip capacity demand -> Track NVIDIA (NVDA), TSMC (TSM), CrowdStrike (CRWD), Palo Alto Networks (PANW), and CIBR ETF.',
    philosophy: 'Statistical Arbitrage',
    horizon: 'Monthly',
    goalTarget: '+25% Swing',
    targetReturnPct: 18.0,
    assets: ['Equities', 'Options', 'Prediction Markets'],
  },
  {
    title: 'Real Estate & REIT Income Recovery',
    tag: 'Real Estate & REITs',
    prompt:
      'Stabilizing mortgage rates and commercial real estate refinancing cycles -> Compare Vanguard Real Estate ETF (VNQ), Realty Income (O), and HousingWire / Commercial Observer live deal flow.',
    philosophy: 'Long-Term Enterprise Compound',
    horizon: 'Hold 1 Year',
    goalTarget: '+10% Target',
    targetReturnPct: 12.0,
    assets: ['Equities', 'Prediction Markets'],
  },
  {
    title: 'Supply-Chain & Commodity Ripples',
    tag: 'Second-Order Supply',
    prompt:
      'Major consumer packaging and energy demand shifts ripple into upstream metals -> Watch Aluminum futures (ALI=F), Alcoa (AA), Ball Corp (BALL), and Gold (GLD) alongside live Polymarket odds.',
    philosophy: 'Second-Order Commodity Ripples',
    horizon: '3-Day Profit',
    goalTarget: '+10% Target',
    targetReturnPct: 10.4,
    assets: ['Commodities', 'Equities', 'Prediction Markets'],
  },
];

const PHILOSOPHIES: Array<{
  id: TradingPhilosophyType;
  title: string;
  desc: string;
}> = [
  {
    id: 'Long-Term Enterprise Compound',
    title: 'Steady Personal Compounding ($100 to $50,000+)',
    desc: 'Build wealth steadily with ETFs, quality stocks, US Treasury bonds, REITs, and disciplined position sizing.',
  },
  {
    id: 'Second-Order Commodity Ripples',
    title: 'Supply-Chain & Commodity Ripples',
    desc: 'Spot how real-world consumer or AI demand affects upstream metals, energy, and suppliers before the crowd notices.',
  },
  {
    id: 'Prediction & Betting Markets',
    title: 'Prediction & Macro Event Markets',
    desc: 'Compare live Polymarket crowd odds against Federal Reserve, inflation, and economic data releases.',
  },
  {
    id: 'Statistical Arbitrage',
    title: 'Sector Rotation & Relative Value',
    desc: 'Compare leading stocks and ETFs against peers across technology, cybersecurity, healthcare, and financials.',
  },
  {
    id: 'Asymmetric Options Skew',
    title: 'Defined-Risk Catalyst Trades',
    desc: 'Study earnings, M&A, and macro catalysts with strict stop-loss rules and capped downside exposure.',
  },
];

const HORIZONS: Array<{
  id: GoalHorizonTag;
  label: string;
  sub: string;
  defaultPct: number;
}> = [
  { id: '3-Day Profit', label: 'Short-Term (3 Days)', sub: 'Fast news & catalyst focus', defaultPct: 8.0 },
  { id: 'Weekly', label: 'Weekly', sub: '5–7 day swing ideas', defaultPct: 10.0 },
  { id: 'Monthly', label: 'Monthly', sub: '30-day sector trends', defaultPct: 15.0 },
  { id: 'Quarterly', label: 'Quarterly', sub: '90-day earnings & Fed cycle', defaultPct: 22.0 },
  { id: 'Hold 1 Year', label: '1-Year+', sub: 'Long-term wealth building', defaultPct: 30.0 },
];

const GOAL_TARGETS: Array<{
  id: HypothesisWizardConfig['goalTarget'];
  label: string;
  pct: number;
}> = [
  { id: '+10% Target', label: 'Steady Growth (+10% goal)', pct: 10.0 },
  { id: '+25% Swing', label: 'Active Growth (+25% goal)', pct: 25.0 },
  { id: '2x-5x Macro', label: 'High-Conviction Macro', pct: 50.0 },
  { id: '10x Annual Compound', label: 'Long-Term Builder ($100+ start)', pct: 100.0 },
];

const ALL_ASSET_CLASSES: MarketCategoryType[] = [
  'Equities',
  'Commodities',
  'Prediction Markets',
  'Options',
  'Crypto Basis',
];

const EVERYDAY_BUDGETS = [100, 500, 1000, 5000, 10000, 25000, 50000];

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
        'Monitor Federal Reserve policy, US Treasury bond rates (TLT, SHY), AI & cybersecurity leaders (NVDA, CRWD, PANW), and real estate REITs (VNQ) using live financial news feeds.',
      philosophy: 'Long-Term Enterprise Compound',
      goalTarget: '+10% Target',
      targetReturnPct: 10.0,
      holdingHorizon: 'Monthly',
      assetClasses: ['Equities', 'Commodities', 'Prediction Markets'],
      capitalAllocated: 1000,
      maxDrawdownPct: 2.0,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden my-auto">
        {/* Top Header */}
        <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-400/30">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Personal Strategy &amp; Research Wizard
              </h2>
              <p className="text-xs text-stone-300">
                Tell Sentinel your market idea, budget ($100 to $50,000+), and timeframe to build a plain-English research plan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            aria-label="Close Wizard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Step Progress Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { num: 1, label: '1. Market Idea' },
            { num: 2, label: '2. Strategy Style' },
            { num: 3, label: '3. Budget & Horizon' },
            { num: 4, label: '4. Ready Check' },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num as any)}
              className={`text-left px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                step === s.num
                  ? 'bg-blue-600 text-white border-blue-600'
                  : step > s.num
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
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
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  What market idea, sector, or news trend do you want to research?
                </label>
                <textarea
                  rows={3}
                  value={config.hypothesisPrompt}
                  onChange={(e) => setConfig({ ...config, hypothesisPrompt: e.target.value })}
                  placeholder="e.g., How will Federal Reserve rate decisions affect US Treasury bonds (TLT), REITs (VNQ), and cybersecurity stocks (CRWD)?"
                  className="w-full rounded-xl border border-stone-300 bg-stone-50/50 p-3.5 text-sm text-stone-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Or start with a ready-made research theme:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRESET_SCENARIOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="text-left p-3.5 rounded-xl border border-stone-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-stone-900 group-hover:text-blue-700">
                          {preset.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-semibold shrink-0">
                          {preset.tag}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-2">{preset.prompt}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950">
                  <span className="font-bold">Live Source Verification:</span> Every research plan cross-checks tickers, bond yields, and headlines against live public APIs (Yahoo Finance, US Treasury Fiscal Data, Polymarket, and SEC EDGAR).
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center">
                  <Layers className="w-4 h-4 mr-1.5 text-blue-600" />
                  Pick Your Investing Style
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
                            : 'bg-white border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-stone-900">{phil.title}</div>
                          <div className="text-xs text-stone-600 mt-0.5">{phil.desc}</div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            selected ? 'bg-blue-600 border-blue-600 text-white' : 'border-stone-300'
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
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Markets to Include (Select one or more)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_ASSET_CLASSES.map((asset) => {
                    const active = config.assetClasses.includes(asset);
                    return (
                      <button
                        key={asset}
                        type="button"
                        onClick={() => toggleAssetClass(asset)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                          active
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
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
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-1.5 text-blue-600" />
                  How long do you plan to hold positions?
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
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <div className="text-xs font-bold">{h.label}</div>
                        <div className={`text-[10px] mt-1 ${active ? 'text-blue-100' : 'text-stone-500'}`}>
                          {h.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-1.5 text-emerald-600" />
                    Illustrative Return Goal
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
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between ${
                            active
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Personal Budget ($100 to $50,000+)
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {EVERYDAY_BUDGETS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setConfig({ ...config, capitalAllocated: amt })}
                          className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                            config.capitalAllocated === amt
                              ? 'bg-stone-900 text-white border-stone-900'
                              : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          ${amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min={25}
                      step={50}
                      value={config.capitalAllocated}
                      onChange={(e) =>
                        setConfig({ ...config, capitalAllocated: Math.max(25, Number(e.target.value) || 100) })
                      }
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm font-mono font-bold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Max Risk per Trade (%)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0.25"
                      max="10"
                      value={config.maxDrawdownPct}
                      onChange={(e) =>
                        setConfig({ ...config, maxDrawdownPct: Number(e.target.value) || 2 })
                      }
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm font-mono font-bold text-stone-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono uppercase text-blue-400">
                    Research Plan Ready
                  </div>
                  <div className="text-lg font-bold mt-0.5">
                    All 5 Planning Checks Complete
                  </div>
                  <p className="text-xs text-stone-300 mt-1">
                    Sentinel will refresh your live-priced market ideas and generate 11 downloadable Markdown research guides tailored to your ${config.capitalAllocated.toLocaleString()} budget.
                  </p>
                </div>
                <div className="text-right font-mono shrink-0">
                  <div className="text-2xl font-extrabold text-emerald-400">5/5</div>
                  <div className="text-[11px] text-stone-400">Ready to run</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50">
                  <div className="text-[11px] font-bold uppercase text-stone-400">1. Market Idea</div>
                  <div className="text-xs font-semibold text-stone-900 mt-1 line-clamp-2">
                    {config.hypothesisPrompt}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50">
                  <div className="text-[11px] font-bold uppercase text-stone-400">
                    2. Style &amp; Markets
                  </div>
                  <div className="text-xs font-semibold text-stone-900 mt-1">
                    {config.philosophy} · {config.assetClasses.join(', ')}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50">
                  <div className="text-[11px] font-bold uppercase text-stone-400">
                    3. Timeframe &amp; Goal
                  </div>
                  <div className="text-xs font-semibold text-emerald-700 font-mono mt-1">
                    {config.holdingHorizon} · +{config.targetReturnPct}% illustrative target
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50">
                  <div className="text-[11px] font-bold uppercase text-stone-400">
                    4. Personal Budget &amp; Stop-Loss
                  </div>
                  <div className="text-xs font-semibold text-stone-900 font-mono mt-1">
                    ${config.capitalAllocated.toLocaleString()} budget · {config.maxDrawdownPct}% max stop
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-stone-50 border-t border-stone-200 px-5 py-4 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="inline-flex items-center px-3.5 py-2 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-100"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back
              </button>
            ) : (
              <span className="text-xs text-stone-500">
                Step {step} of 4 · Personal Research Setup
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            {step < 4 && (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </button>
            )}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              <Cpu className="w-4 h-4 mr-1.5" />
              {isSubmitting ? 'Building research plan…' : 'Build Research Plan & 11 Guides'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

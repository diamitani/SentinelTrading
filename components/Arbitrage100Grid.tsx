import React, { useState, useMemo } from 'react';
import { TradeRecommendation } from '../types';

interface Arbitrage100GridProps {
  recommendations: TradeRecommendation[];
  onExecuteTrade?: (trade: TradeRecommendation, scaleMultiple: number) => void;
}

export const Arbitrage100Grid: React.FC<Arbitrage100GridProps> = ({ recommendations, onExecuteTrade }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<'spread' | 'confidence' | 'alpha' | 'scale'>('spread');
  const [scaledMultipliers, setScaledMultipliers] = useState<Record<string, number>>({});
  const [executedTrades, setExecutedTrades] = useState<Record<string, boolean>>({});

  const filteredTrades = useMemo(() => {
    return recommendations
      .filter((t) => {
        if (filterType !== 'ALL' && t.arbitrageType !== filterType) return false;
        if (filterUrgency !== 'ALL' && t.oneMustActUrgency !== filterUrgency) return false;
        if (searchTerm) {
          const matchTicker = t.ticker.toLowerCase().includes(searchTerm.toLowerCase());
          const matchName = t.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchReason = t.reasoning.toLowerCase().includes(searchTerm.toLowerCase());
          if (!matchTicker && !matchName && !matchReason) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortField === 'spread') return (b.arbitrageSpreadPct || 0) - (a.arbitrageSpreadPct || 0);
        if (sortField === 'confidence') return b.confidence - a.confidence;
        if (sortField === 'alpha') return (b.expectedAlphaBps || 0) - (a.expectedAlphaBps || 0);
        if (sortField === 'scale') return (b.positionScaleMultiple || 1) - (a.positionScaleMultiple || 1);
        return 0;
      });
  }, [recommendations, filterType, filterUrgency, searchTerm, sortField]);

  const handleScaleIncrease = (ticker: string, defaultScale: number = 1.0) => {
    setScaledMultipliers((prev) => {
      const current = prev[ticker] || defaultScale;
      const next = Number(Math.min(5.0, current + 0.5).toFixed(1));
      return { ...prev, [ticker]: next };
    });
  };

  const handleExecute = (trade: TradeRecommendation) => {
    const scale = scaledMultipliers[trade.ticker] || trade.positionScaleMultiple || 1.0;
    setExecutedTrades((prev) => ({ ...prev, [trade.ticker]: true }));
    if (onExecuteTrade) {
      onExecuteTrade(trade, scale);
    }
  };

  const criticalCount = recommendations.filter((t) => t.oneMustActUrgency === 'CRITICAL_IMMEDIATE').length;
  const maxSpread = Math.max(...recommendations.map((t) => t.arbitrageSpreadPct || 0), 0).toFixed(2);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Statistical Banner */}
      <div className="bg-slate-50 border border-slate-200 p-4 sm:p-6 rounded-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-xs">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>Quant Arbitrage Matrix</span>
              <span className="text-blue-600 font-mono text-xs sm:text-sm">100 Daily Opportunities</span>
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-normal">
            Cross-venue pricing discrepancies across lit exchanges and ATS dark pools. Verified with <span className="font-semibold text-slate-900">One-Must-Act</span> instant position increase scale multipliers up to 4.5x.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full lg:w-auto shrink-0">
          <div className="bg-white border border-slate-200 px-2.5 sm:px-4 py-2.5 rounded-lg text-center shadow-xs">
            <div className="text-[10px] text-slate-500 uppercase font-mono truncate">Signals Active</div>
            <div className="text-lg sm:text-xl font-mono font-bold text-slate-900 tabular-nums">{recommendations.length}</div>
          </div>
          <div className="bg-white border border-red-200 px-2.5 sm:px-4 py-2.5 rounded-lg text-center shadow-xs">
            <div className="text-[10px] text-red-600 uppercase font-mono truncate">Critical</div>
            <div className="text-lg sm:text-xl font-mono font-bold text-red-600 tabular-nums">{criticalCount}</div>
          </div>
          <div className="bg-white border border-emerald-200 px-2.5 sm:px-4 py-2.5 rounded-lg text-center shadow-xs">
            <div className="text-[10px] text-emerald-700 uppercase font-mono truncate">Max Spread</div>
            <div className="text-lg sm:text-xl font-mono font-bold text-emerald-600 tabular-nums">+{maxSpread}%</div>
          </div>
        </div>
      </div>

      {/* Filters & Control Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch lg:items-center justify-between shadow-xs">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search 100 tickers or pairs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2 pl-8 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <svg
              className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-mono shrink-0">CATEGORY:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border border-slate-200 text-xs text-slate-800 rounded-lg px-2.5 py-2 flex-1 sm:flex-initial focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Categories ({recommendations.length})</option>
              <option value="Cross-Exchange">Cross-Exchange</option>
              <option value="Statistical">Statistical</option>
              <option value="Dual-Listing">Dual-Listing</option>
              <option value="Options Box/Conversion">Options Box</option>
              <option value="Cash-and-Carry">Cash-and-Carry</option>
              <option value="Triangular">Triangular</option>
              <option value="Index Basis">Index Basis</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-mono shrink-0">URGENCY:</span>
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="bg-white border border-slate-200 text-xs text-slate-800 rounded-lg px-2.5 py-2 flex-1 sm:flex-initial focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Urgencies</option>
              <option value="CRITICAL_IMMEDIATE">Critical (One Must Act)</option>
              <option value="HIGH_MOMENTUM">High Momentum</option>
              <option value="MODERATE_OPPORTUNITY">Moderate Opportunity</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs text-slate-500 font-mono mr-1">SORT:</span>
          {(['spread', 'confidence', 'alpha', 'scale'] as const).map((field) => (
            <button
              key={field}
              onClick={() => setSortField(field)}
              className={`px-3 py-1.5 rounded-lg text-xs uppercase font-mono font-medium transition-all whitespace-nowrap ${
                sortField === field
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {field}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 100 Trades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTrades.map((trade, idx) => {
          const isCritical = trade.oneMustActUrgency === 'CRITICAL_IMMEDIATE';
          const isHigh = trade.oneMustActUrgency === 'HIGH_MOMENTUM';
          const currentScale = scaledMultipliers[trade.ticker] || trade.positionScaleMultiple || 1.0;
          const isExecuted = executedTrades[trade.ticker];

          return (
            <div
              key={`${trade.ticker}-${idx}`}
              className={`p-5 rounded-xl border bg-white flex flex-col justify-between transition-all hover:border-slate-400 shadow-xs relative group min-w-0 ${
                isCritical
                  ? 'border-red-300 ring-1 ring-red-200 bg-red-50/10'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold font-mono text-slate-900 tracking-tight">{trade.ticker}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase shrink-0 ${
                          trade.action === 'BUY' || trade.action === 'CALL'
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                            : 'text-red-700 bg-red-50 border border-red-200'
                        }`}
                      >
                        {trade.action}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {trade.name}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-slate-900">
                      ${trade.entryPrice?.toFixed(2) ?? 'MKT'}
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                        isCritical
                          ? 'bg-red-100 text-red-700'
                          : isHigh
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {trade.oneMustActUrgency === 'CRITICAL_IMMEDIATE'
                        ? 'MUST ACT NOW'
                        : trade.oneMustActUrgency === 'HIGH_MOMENTUM'
                        ? 'HIGH MOMENTUM'
                        : 'OPPORTUNITY'}
                    </span>
                  </div>
                </div>

                {/* Arbitrage Venues & Spread Card */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 my-2.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-600">{trade.arbitrageType}</span>
                    <span className="text-emerald-700 font-bold">Spread: +{trade.arbitrageSpreadPct}%</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between font-mono">
                    <span className="truncate max-w-[95px]">{trade.primaryVenue}</span>
                    <span className="text-slate-400">⇄</span>
                    <span className="truncate max-w-[95px] text-right">{trade.hedgeVenue}</span>
                  </div>
                </div>

                {/* Quantitative metrics */}
                <div className="grid grid-cols-3 gap-2 text-center my-2 text-xs font-mono">
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                    <div className="text-slate-400 text-[9px]">CONFIDENCE</div>
                    <div className="text-blue-600 font-bold">{trade.confidence}%</div>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                    <div className="text-slate-400 text-[9px]">ALPHA BPS</div>
                    <div className="text-emerald-700 font-bold">+{trade.expectedAlphaBps || 120}</div>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                    <div className="text-slate-400 text-[9px]">R/R RATIO</div>
                    <div className="text-slate-800 font-bold">{trade.riskRewardRatio || 3.2}:1</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed my-2 line-clamp-2">
                  {trade.reasoning}
                </p>
              </div>

              {/* Execution and Position Increase Control */}
              <div className="border-t border-slate-100 pt-3 mt-2 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-mono">
                    Scale Size: <span className="text-emerald-700 font-bold">{currentScale}x</span>
                  </span>
                  <button
                    onClick={() => handleScaleIncrease(trade.ticker, trade.positionScaleMultiple)}
                    className="text-xs text-blue-600 hover:text-blue-800 px-2 py-0.5 rounded border border-blue-200 bg-blue-50 font-mono font-semibold transition-colors"
                    title="Scale position allocation upon breakout confirmation"
                  >
                    + Scale Up
                  </button>
                </div>

                <button
                  onClick={() => handleExecute(trade)}
                  disabled={isExecuted}
                  className={`w-full py-2 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    isExecuted
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : isCritical
                      ? 'bg-red-600 text-white hover:bg-red-700 shadow-xs'
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                  }`}
                >
                  {isExecuted ? (
                    'EXECUTED IN DMA'
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
                      ACT NOW ({currentScale}x)
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

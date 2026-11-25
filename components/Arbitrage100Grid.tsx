import React, { useState, useMemo } from 'react';
import { TradeRecommendation } from '../types';
import { ExternalLink, Search, SlidersHorizontal, CheckCircle2 } from 'lucide-react';

interface Arbitrage100GridProps {
  recommendations: TradeRecommendation[];
  onExecuteTrade?: (trade: TradeRecommendation, scaleMultiple: number) => void;
  onOpenWizard?: () => void;
}

export const Arbitrage100Grid: React.FC<Arbitrage100GridProps> = ({
  recommendations,
  onExecuteTrade,
  onOpenWizard,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterHorizon, setFilterHorizon] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<'spread' | 'confidence' | 'alpha'>('confidence');
  const [paperTradeCounts, setPaperTradeCounts] = useState<Record<string, number>>({});

  const filteredTrades = useMemo(() => {
    return recommendations
      .filter((t) => {
        if (filterType !== 'ALL' && t.arbitrageType !== filterType && t.marketCategory !== filterType) {
          return false;
        }
        if (filterHorizon !== 'ALL' && t.goalHorizonTag !== filterHorizon) {
          return false;
        }
        if (filterPriority !== 'ALL' && t.oneMustActUrgency !== filterPriority) return false;
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const matchTicker = t.ticker.toLowerCase().includes(q);
          const matchName = t.name.toLowerCase().includes(q);
          const matchReason = t.reasoning.toLowerCase().includes(q);
          const matchCat = (t.marketCategory || '').toLowerCase().includes(q);
          if (!matchTicker && !matchName && !matchReason && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortField === 'spread') return (b.arbitrageSpreadPct || 0) - (a.arbitrageSpreadPct || 0);
        if (sortField === 'confidence') return b.confidence - a.confidence;
        if (sortField === 'alpha') return (b.expectedAlphaBps || 0) - (a.expectedAlphaBps || 0);
        return 0;
      });
  }, [recommendations, filterType, filterHorizon, filterPriority, searchTerm, sortField]);

  const handlePaperTrade = (trade: TradeRecommendation) => {
    setPaperTradeCounts((prev) => ({ ...prev, [trade.ticker]: (prev[trade.ticker] || 0) + 1 }));
    if (onExecuteTrade) {
      onExecuteTrade(trade, 1);
    }
  };

  const topPicksCount = recommendations.filter(
    (t) => t.oneMustActUrgency === 'CRITICAL_IMMEDIATE'
  ).length;
  const polymarketCount = recommendations.filter(
    (t) => t.marketCategory === 'Prediction Markets'
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-stone-200 p-5 sm:p-6 rounded-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              Live-Priced Watchlist
            </span>
            <span className="text-[11px] font-mono text-stone-500">
              Yahoo Finance · Polymarket · Bonds · Cyber · Real Estate
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            Researched Market Ideas
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Live-priced stocks, ETFs, US Treasury bonds, REITs, cybersecurity leaders, commodities, and active Polymarket contracts. Test any idea risk-free inside your virtual paper portfolio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
          {onOpenWizard && (
            <button
              type="button"
              onClick={onOpenWizard}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Customize strategy &amp; goals
            </button>
          )}
          <div className="grid grid-cols-3 gap-2 flex-1 lg:flex-initial">
            <div className="bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg text-center">
              <div className="text-[10px] text-stone-500 uppercase font-mono">Showing</div>
              <div className="text-base font-mono font-bold text-stone-900 tabular-nums">
                {filteredTrades.length}
              </div>
            </div>
            <div className="bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg text-center">
              <div className="text-[10px] text-blue-700 uppercase font-mono">High Fit</div>
              <div className="text-base font-mono font-bold text-blue-700 tabular-nums">
                {topPicksCount}
              </div>
            </div>
            <div className="bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg text-center">
              <div className="text-[10px] text-emerald-700 uppercase font-mono">Prediction</div>
              <div className="text-base font-mono font-bold text-emerald-700 tabular-nums">
                {polymarketCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeframe Filters */}
      <div className="flex flex-wrap items-center gap-1.5">
        {[
          { id: 'ALL', label: 'All Timeframes' },
          { id: '3-Day Profit', label: 'Short-Term (3-Day)' },
          { id: 'Weekly', label: 'Weekly' },
          { id: 'Monthly', label: 'Monthly' },
          { id: 'Quarterly', label: 'Quarterly' },
          { id: 'Hold 1 Year', label: '1-Year Long-Term' },
        ].map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => setFilterHorizon(h.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              filterHorizon === h.id
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {h.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-stone-200 p-4 rounded-xl flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search TLT, CRWD, VNQ, NVDA, POLY..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-stone-50 border border-stone-200 text-xs text-stone-900 rounded-lg px-3 py-2 pl-8 w-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-500 font-medium shrink-0">Category:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border border-stone-200 text-xs text-stone-800 rounded-lg px-2.5 py-2 flex-1 sm:flex-initial focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Categories</option>
              <option value="Equities">Stocks, Bonds &amp; ETFs</option>
              <option value="Prediction Markets">Live Polymarket Contracts</option>
              <option value="Commodities">Commodities &amp; Materials</option>
              <option value="Options">Options Strategies</option>
              <option value="Crypto Basis">Digital Assets</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-500 font-medium shrink-0">Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-white border border-stone-200 text-xs text-stone-800 rounded-lg px-2.5 py-2 flex-1 sm:flex-initial focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL_IMMEDIATE">High Conviction</option>
              <option value="HIGH_MOMENTUM">Strong Momentum</option>
              <option value="MODERATE_OPPORTUNITY">Watchlist</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-stone-500 font-medium mr-1">Sort by:</span>
          {[
            { id: 'confidence', label: 'Fit Score' },
            { id: 'spread', label: 'Spread' },
            { id: 'alpha', label: 'Upside' },
          ].map((field) => (
            <button
              key={field.id}
              type="button"
              onClick={() => setSortField(field.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                sortField === field.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {field.label}
            </button>
          ))}
        </div>
      </div>

      {/* Idea Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTrades.map((trade, idx) => {
          const isHighConviction = trade.oneMustActUrgency === 'CRITICAL_IMMEDIATE';
          const tradeCount = paperTradeCounts[trade.ticker] || 0;
          const isBuySide = trade.action === 'BUY' || trade.action === 'CALL';

          return (
            <div
              key={`${trade.ticker}-${idx}`}
              className={`p-5 rounded-xl border bg-white flex flex-col justify-between transition-colors hover:border-stone-400 min-w-0 ${
                isHighConviction ? 'border-blue-300' : 'border-stone-200'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-base font-bold font-mono text-stone-900 tracking-tight">
                        {trade.ticker}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase shrink-0 ${
                          isBuySide
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                            : 'text-red-700 bg-red-50 border border-red-200'
                        }`}
                      >
                        {trade.action}
                      </span>
                    </div>
                    <div className="text-xs text-stone-600 truncate mt-0.5">{trade.name}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono font-bold text-stone-900 tabular-nums">
                      ${trade.entryPrice?.toFixed(2) ?? 'MKT'}
                    </div>
                    {trade.goalHorizonTag && (
                      <div className="text-[10px] font-mono text-stone-500 mt-0.5">
                        {trade.goalHorizonTag}
                      </div>
                    )}
                  </div>
                </div>

                {trade.predictionOddsSpread && (
                  <div className="my-2 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-mono text-amber-900 font-medium">
                    {trade.predictionOddsSpread}
                  </div>
                )}

                {/* Market Context Box */}
                <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100 my-2.5">
                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <span className="text-stone-600 truncate pr-2">
                      {trade.marketCategory || trade.arbitrageType}
                    </span>
                    <span className="text-emerald-700 font-semibold shrink-0">
                      {trade.primaryVenue}
                    </span>
                  </div>
                  {trade.url && (
                    <a
                      href={trade.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 mt-1"
                    >
                      View live market source
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center my-2.5 text-xs font-mono">
                  <div className="bg-stone-50 p-1.5 rounded border border-stone-100">
                    <div className="text-stone-400 text-[9px] uppercase">Fit</div>
                    <div className="text-blue-700 font-bold tabular-nums">{trade.confidence}%</div>
                  </div>
                  <div className="bg-stone-50 p-1.5 rounded border border-stone-100">
                    <div className="text-stone-400 text-[9px] uppercase">Target</div>
                    <div className="text-emerald-700 font-bold tabular-nums">
                      +{trade.targetReturnPct || trade.arbitrageSpreadPct || 5}%
                    </div>
                  </div>
                  <div className="bg-stone-50 p-1.5 rounded border border-stone-100">
                    <div className="text-stone-400 text-[9px] uppercase">R/R</div>
                    <div className="text-stone-800 font-bold tabular-nums">
                      {trade.riskRewardRatio || 2.5}:1
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed my-2 line-clamp-3">
                  {trade.reasoning}
                </p>
              </div>

              {/* Paper Trade Action */}
              <div className="border-t border-stone-100 pt-3 mt-2 space-y-2">
                {tradeCount > 0 && (
                  <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Added to paper portfolio ({tradeCount})
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handlePaperTrade(trade)}
                  className="w-full py-2 rounded-lg text-xs font-semibold transition-colors bg-stone-900 text-white hover:bg-stone-800"
                >
                  Paper trade {trade.ticker}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

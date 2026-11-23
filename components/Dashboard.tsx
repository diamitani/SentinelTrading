import React from 'react';
import { MarketReport, TradeRecommendation, MacroMetric, SectorPerformance, PoliticalRisk } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  report: MarketReport;
  onNavigateTo100Trades?: () => void;
  onNavigateToPal?: () => void;
  onNavigateToPlaid?: () => void;
}

const MacroCard: React.FC<{ metric: MacroMetric }> = ({ metric }) => {
  const isUp = metric.trend === 'UP';
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors">
      <div className="text-[11px] text-slate-500 uppercase font-mono font-medium tracking-wider">{metric.name}</div>
      <div className="text-xl font-mono text-slate-900 font-bold my-1 tracking-tight">{metric.value}</div>
      <div className={`text-xs flex items-center gap-1 font-mono font-medium ${isUp ? 'text-emerald-600' : metric.trend === 'DOWN' ? 'text-red-600' : 'text-slate-500'}`}>
        <span>{isUp ? '▲' : metric.trend === 'DOWN' ? '▼' : '—'}</span>
        <span>{metric.trend}</span>
      </div>
    </div>
  );
};

const SentimentGauge: React.FC<{ score: number }> = ({ score }) => {
  const rotation = (score + 100) * 0.9; 
  return (
    <div className="relative w-full h-32 overflow-hidden mb-2">
      <div className="absolute top-0 left-0 w-full h-full bg-slate-100 rounded-t-full"></div>
      <div 
        className="absolute bottom-0 left-1/2 w-full h-full origin-bottom transition-transform duration-1000 ease-out bg-gradient-to-t from-transparent to-current opacity-70"
        style={{ 
          transform: `translateX(-50%) rotate(${rotation - 90}deg)`,
          color: score > 20 ? '#059669' : score < -20 ? '#dc2626' : '#d97706'
        }}
      >
        <div className="w-1 h-full bg-slate-900 mx-auto mt-2 rounded-full"></div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-slate-900 rounded-full z-10 shadow-md"></div>
    </div>
  );
};

const TradeCard: React.FC<{ trade: TradeRecommendation }> = ({ trade }) => {
  const isBuy = trade.action === 'BUY' || trade.action === 'CALL';
  const isCritical = trade.oneMustActUrgency === 'CRITICAL_IMMEDIATE';
  
  return (
    <div className={`p-5 rounded-xl border bg-white flex flex-col justify-between transition-all hover:border-slate-400 shadow-xs group ${
      isCritical ? 'border-red-300 ring-1 ring-red-200 bg-red-50/20' : 'border-slate-200'
    }`}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xl font-bold text-slate-900 tracking-tight font-mono">{trade.ticker}</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                isBuy ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-red-700 bg-red-50 border border-red-200'
              }`}>
                {trade.action}
              </span>
              {trade.arbitrageSpreadPct && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  +{trade.arbitrageSpreadPct}% Spread
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 truncate max-w-[200px] mt-0.5">{trade.name}</div>
          </div>
          <div className="text-right">
             <div className="text-blue-600 font-mono font-bold text-sm">${trade.entryPrice?.toFixed(2) ?? 'MKT'}</div>
             <div className="text-[10px] text-slate-400 font-mono uppercase">{trade.horizon}</div>
          </div>
        </div>

        {trade.arbitrageType && (
          <div className="flex justify-between items-center text-[11px] font-mono bg-slate-50 px-2.5 py-1.5 rounded-lg my-2 border border-slate-100">
            <span className="text-slate-600">{trade.arbitrageType}</span>
            <span className="text-emerald-700 font-semibold">Scale: {trade.positionScaleMultiple || 1.0}x</span>
          </div>
        )}
        
        <div className="w-full bg-slate-100 h-1.5 my-3 rounded-full overflow-hidden">
          <div className={`h-full ${isBuy ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${trade.confidence}%` }}></div>
        </div>
        
        <p className="text-xs text-slate-600 leading-relaxed pt-1 line-clamp-2">
          {trade.reasoning}
        </p>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({
  report,
  onNavigateTo100Trades,
  onNavigateToPal,
  onNavigateToPlaid,
}) => {
  const chartData = report.recommendations.slice(0, 12).map(r => ({
    name: r.ticker,
    confidence: r.confidence,
    action: r.action,
    spread: r.arbitrageSpreadPct || 1.5,
  }));

  const totalArbitrageCount = report.totalArbitrageTradesCount || report.recommendations.length;
  const criticalCount = report.criticalUrgencyTradesCount || report.recommendations.filter(t => t.oneMustActUrgency === 'CRITICAL_IMMEDIATE').length;

  return (
    <div className="animate-fade-in pb-12 space-y-8">
      {/* Top Banner Alert for Arbitrage & 10-Step PAL */}
      <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono text-base sm:text-lg font-bold shadow-sm shrink-0 tabular-nums">
            100
          </div>
          <div className="min-w-0">
            <div className="text-base font-bold text-slate-900 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>Daily Quantitative Arbitrage Matrix</span>
              <span className="text-xs text-blue-600 font-mono font-medium">PAL/ROSTR Intake Active</span>
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              {totalArbitrageCount} verified daily trade tickets. <span className="text-red-600 font-semibold">{criticalCount} flagged One-Must-Act</span> with DMA position scale triggers.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
          {onNavigateTo100Trades && (
            <button
              onClick={onNavigateTo100Trades}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs whitespace-nowrap"
            >
              Explore 100 Trades
            </button>
          )}
          {onNavigateToPal && (
            <button
              onClick={onNavigateToPal}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors whitespace-nowrap"
            >
              Thesis Intake
            </button>
          )}
          {onNavigateToPlaid && (
            <button
              onClick={onNavigateToPlaid}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors whitespace-nowrap"
            >
              Plaid Ledger
            </button>
          )}
        </div>
      </div>
      
      {/* Macro Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {report.macroMetrics.map((m, i) => <MacroCard key={i} metric={m} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Sentiment, Geopolitics & Sectors (4 cols) */}
        <div className="lg:col-span-4 min-w-0 space-y-6">
          {/* Sentiment Gauge */}
          <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-xl shadow-xs">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Market Sentiment</h2>
               <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                 report.overallSentimentScore > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
               }`}>
                 {report.overallSentimentScore > 0 ? 'NET BULLISH' : 'NET BEARISH'}
               </span>
            </div>
            <SentimentGauge score={report.overallSentimentScore} />
            <div className="text-center font-mono text-4xl font-bold text-slate-900 tracking-tight tabular-nums">
              {report.overallSentimentScore}
            </div>
            <p className="text-center text-xs text-slate-500 mt-1 uppercase font-mono tracking-wider">
              Composite Fear &amp; Greed Index
            </p>
          </div>

          {/* Sector Heatmap */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4">Sector Relative Strength</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {report.sectorPerformance.map((s, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between min-w-0">
                  <span className="text-xs font-semibold text-slate-700 truncate">{s.sector}</span>
                  <span className={`text-lg font-mono font-bold mt-1 tabular-nums ${s.performance > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {s.performance > 0 ? '+' : ''}{s.performance}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Institutional Flow & Top Signals (8 cols) */}
        <div className="lg:col-span-8 min-w-0 space-y-6">
          {/* Institutional Flow Text */}
          <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-xl shadow-xs">
             <div className="text-xs font-mono font-bold text-blue-600 uppercase mb-2">
               Institutional Liquidity &amp; Order Flow
             </div>
             <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
               {report.institutionalFlow}
             </p>
          </div>

          {/* Top 4 Signals */}
          <div>
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Top High-Conviction Arbitrage Signals
              </h3>
              {onNavigateTo100Trades && (
                <button
                  onClick={onNavigateTo100Trades}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline flex items-center gap-1 whitespace-nowrap"
                >
                  View All 100 Trades &rarr;
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.recommendations.slice(0, 4).map((trade, idx) => (
                <TradeCard key={idx} trade={trade} />
              ))}
            </div>
          </div>

          {/* Chart Area */}
          <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl shadow-xs h-64 sm:h-72 min-w-0">
             <div className="flex justify-between items-center mb-3 gap-2">
               <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono truncate">Signal Conviction Matrix</h2>
               <span className="text-[11px] text-slate-500 font-mono shrink-0">TOP 12 PAIRS</span>
             </div>
             <ResponsiveContainer width="100%" height="80%">
              <BarChart data={chartData} margin={{top: 5, right: 10, left: -20, bottom: 0}}>
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#64748b', fontSize: 10}} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{fill: '#64748b', fontSize: 11}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}}
                  contentStyle={{backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', fontSize: '12px', borderRadius: '8px'}}
                />
                <Bar dataKey="confidence" barSize={28} radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={(entry.action === 'BUY' || entry.action === 'CALL') ? '#059669' : '#dc2626'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
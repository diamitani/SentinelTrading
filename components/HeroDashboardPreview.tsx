import React from 'react';
import { Activity, Gauge, Layers, ShieldCheck, TrendingUp } from 'lucide-react';

/**
 * Hero preview of the Sentinel Command Dashboard.
 * Built from real components of the app's look (no external images) and filled
 * with SAMPLE data, so it is clearly labelled as a sample run, not live prices.
 */

const NAV = ['Command Dashboard', 'ROSTR & POP 11', '100 Trades', 'Sandbox & Composio', '10x Growth'];

const METRICS = [
  { name: 'S&P 500', value: '5,864.20', trend: 'UP' },
  { name: 'VIX', value: '15.42', trend: 'DOWN' },
  { name: 'CME Aluminum', value: '$2,648.50', trend: 'UP' },
  { name: 'Bitcoin', value: '$88,450', trend: 'UP' },
  { name: 'Kalshi Fed Cut', value: '71¢', trend: 'UP' },
  { name: '10Y Yield', value: '4.28%', trend: 'FLAT' },
] as const;

const SECTORS = [
  { name: 'Materials & Metals', pct: 4.1 },
  { name: 'Technology', pct: 3.4 },
  { name: 'Financials', pct: 2.1 },
  { name: 'Energy', pct: -0.9 },
];

const TRADES = [
  { ticker: 'AA', name: 'Alcoa — Pepsi can ripple', action: 'CALL', spread: '+3.4%', urgency: 'CRITICAL' },
  { ticker: 'ALI=F', name: 'CME Aluminum Dec calls', action: 'CALL', spread: '+3.4%', urgency: 'CRITICAL' },
  { ticker: 'POLY-ALU', name: 'Polymarket vs Kalshi spread', action: 'BUY', spread: '+9.0%', urgency: 'HIGH' },
];

const trendColor = (t: string) =>
  t === 'UP' ? 'text-emerald-600' : t === 'DOWN' ? 'text-red-500' : 'text-slate-500';
const trendArrow = (t: string) => (t === 'UP' ? '▲' : t === 'DOWN' ? '▼' : '■');

export const HeroDashboardPreview: React.FC = () => (
  <div
    className="rounded-[18px] border border-[#3d3d3d]/10 bg-slate-50 overflow-hidden text-left"
    aria-label="Sentinel Command Dashboard sample preview"
  >
    {/* Window chrome + brand */}
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white border-b border-slate-200">
      <div className="flex items-center gap-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
        </div>
        <div className="w-6 h-6 rounded-md bg-[#2f69ff] text-white font-mono font-bold text-xs flex items-center justify-center">
          S
        </div>
        <span className="text-sm font-bold text-slate-900 tracking-tight">Sentinel</span>
      </div>
      <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        W = 1.00 · DAG 11ms
      </span>
    </div>

    {/* Nav tabs (same sections as the real app) */}
    <div className="flex gap-1 overflow-x-auto px-3 py-2 bg-white border-b border-slate-200">
      {NAV.map((label, i) => (
        <span
          key={label}
          className={`whitespace-nowrap px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold ${
            i === 0 ? 'bg-[#2f69ff] text-white' : 'text-slate-600'
          }`}
        >
          {label}
        </span>
      ))}
    </div>

    <div className="p-3 sm:p-4 space-y-3">
      {/* Macro tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {METRICS.map((m) => (
          <div key={m.name} className="bg-white border border-slate-200 rounded-lg p-2.5">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 truncate">
              {m.name}
            </div>
            <div className="text-base font-mono font-bold text-slate-900 my-0.5">{m.value}</div>
            <div className={`text-[11px] font-mono font-medium ${trendColor(m.trend)}`}>
              {trendArrow(m.trend)} {m.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* Sentiment + sectors */}
        <div className="md:col-span-2 space-y-3">
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 mb-2">
              <Gauge className="w-3.5 h-3.5 text-[#2f69ff]" /> Market sentiment
            </div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-mono font-bold text-slate-900">58</span>
              <span className="text-[11px] text-slate-500 pb-1">/ 100 · Moderately bullish</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-[58%] rounded-full bg-[#2f69ff]" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 mb-2">
              <Layers className="w-3.5 h-3.5 text-[#2f69ff]" /> Sector performance
            </div>
            <div className="space-y-1.5">
              {SECTORS.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-[11px]">
                  <span className="w-28 shrink-0 text-slate-600 truncate">{s.name}</span>
                  <div className="flex-1 h-2 rounded bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded ${s.pct >= 0 ? 'bg-emerald-500' : 'bg-red-400'}`}
                      style={{ width: `${Math.min(100, Math.abs(s.pct) * 20)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-slate-700">
                    {s.pct > 0 ? '+' : ''}
                    {s.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top trades */}
        <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
              <TrendingUp className="w-3.5 h-3.5 text-[#2f69ff]" /> Top trade ideas
            </div>
            <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
              <Activity className="w-3 h-3" /> 100 ranked
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {TRADES.map((t) => (
              <div key={t.ticker} className="flex items-center gap-3 py-2">
                <span className="w-16 shrink-0 font-mono font-bold text-xs text-slate-900">
                  {t.ticker}
                </span>
                <span className="flex-1 min-w-0 text-[11px] text-slate-600 truncate">{t.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono font-semibold text-slate-700">
                  {t.action}
                </span>
                <span className="w-12 text-right font-mono text-xs font-bold text-emerald-600">
                  {t.spread}
                </span>
                <span
                  className={`hidden sm:inline px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                    t.urgency === 'CRITICAL'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {t.urgency}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 font-mono text-center">
        Sample data shown for illustration — launch the wizard to run your own hypothesis.
      </p>
    </div>
  </div>
);

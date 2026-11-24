import React, { useMemo, useState } from 'react';
import { MarketReport, TradeRecommendation, MacroMetric, PlaidStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  SlidersHorizontal,
  Search,
  Newspaper,
  ShieldAlert,
  Wallet,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';
import { ResearchFocus } from '../services/answerEngine';
import { Composer } from './research/ResearchParts';
import { DataModeBadge, InlineDisclaimer, SimulatedBadge } from './compliance/Compliance';

interface DashboardProps {
  report: MarketReport;
  plaidStatus?: PlaidStatus | null;
  onSyncPlaid?: () => Promise<void>;
  onOpenWizard?: () => void;
  onNavigateTo100Trades?: () => void;
  onNavigateToPlaid?: () => void;
  onAsk: (query: string, focus: ResearchFocus) => void;
  onPaperTrade?: (trade: TradeRecommendation) => void;
  onOpenDisclosures?: () => void;
}

/* --------------------------------- Helpers -------------------------------- */

const usd = (n: number, digits = 0) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: digits, minimumFractionDigits: digits });

function marketSession(now = new Date()) {
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = et.getDay();
  const mins = et.getHours() * 60 + et.getMinutes();
  if (day === 0 || day === 6) return { label: 'US markets closed', tone: 'slate' as const };
  if (mins >= 570 && mins < 960) return { label: 'US markets open', tone: 'emerald' as const };
  if (mins >= 240 && mins < 570) return { label: 'Pre-market', tone: 'amber' as const };
  if (mins >= 960 && mins < 1200) return { label: 'After hours', tone: 'amber' as const };
  return { label: 'US markets closed', tone: 'slate' as const };
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

const instrumentOf = (t: TradeRecommendation) => {
  if (t.marketCategory === 'Prediction Markets') return 'Event contract';
  if (t.marketCategory === 'Commodities') return t.action === 'CALL' || t.action === 'PUT' ? 'Futures option' : 'Commodity';
  if (t.marketCategory === 'Crypto Basis') return 'Digital asset';
  if (t.action === 'CALL' || t.action === 'PUT') return 'Option';
  return 'Stock';
};

const riskOf = (t: TradeRecommendation): 'High' | 'Elevated' | 'Moderate' => {
  const inst = instrumentOf(t);
  if (inst === 'Option' || inst === 'Futures option' || inst === 'Event contract') return 'High';
  if (inst === 'Digital asset' || inst === 'Commodity') return 'Elevated';
  return 'Moderate';
};

const RISK_STYLE = {
  High: 'bg-rose-50 text-rose-700 border-rose-200',
  Elevated: 'bg-amber-50 text-amber-800 border-amber-200',
  Moderate: 'bg-slate-50 text-slate-600 border-slate-200',
};

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <section className={`rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}>
    {children}
  </section>
);

const CardHeader: React.FC<{
  icon?: React.ElementType;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
    <div className="min-w-0">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        {title}
      </h3>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
    </div>
    {action}
  </div>
);

/* ------------------------------- Sub-blocks ------------------------------- */

const MetricTile: React.FC<{ metric: MacroMetric }> = ({ metric }) => {
  const Trend = metric.trend === 'UP' ? ArrowUpRight : metric.trend === 'DOWN' ? ArrowDownRight : Minus;
  const tone =
    metric.trend === 'UP' ? 'text-emerald-600 bg-emerald-50' : metric.trend === 'DOWN' ? 'text-rose-600 bg-rose-50' : 'text-slate-500 bg-slate-100';
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-slate-300">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-slate-500">{metric.name}</span>
        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${tone}`} aria-label={`Trend ${metric.trend.toLowerCase()}`}>
          <Trend className="w-3.5 h-3.5" />
        </span>
      </div>
      <div className="mt-2 text-xl font-semibold tracking-tight text-slate-900 tabular-nums">{metric.value}</div>
    </div>
  );
};

const SentimentGauge: React.FC<{ score: number }> = ({ score }) => {
  const s = Math.max(0, Math.min(100, score || 50));
  const angle = Math.PI * (1 - s / 100);
  const x = 60 + 46 * Math.cos(angle);
  const y = 60 - 46 * Math.sin(angle);
  const label = s >= 65 ? 'Optimistic' : s >= 55 ? 'Leaning positive' : s > 45 ? 'Neutral' : s > 35 ? 'Leaning cautious' : 'Fearful';
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 70" className="w-44" role="img" aria-label={`Sentiment score ${s} out of 100, ${label}`}>
        <defs>
          <linearGradient id="gauge" x1="0" x2="1">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <path d="M14 60 A46 46 0 0 1 106 60" fill="none" stroke="url(#gauge)" strokeWidth="9" strokeLinecap="round" />
        <circle cx={x} cy={y} r="6.5" fill="#fff" stroke="#0f172a" strokeWidth="3" />
      </svg>
      <div className="-mt-3 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">{s}</div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
};

const BreakdownBar: React.FC<{ label: string; value: number; signed?: boolean }> = ({ label, value, signed }) => {
  const pct = signed ? Math.min(100, Math.abs(value)) : Math.max(0, Math.min(100, value));
  const negative = signed && value < 0;
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <span className={`font-medium tabular-nums ${negative ? 'text-rose-600' : 'text-slate-900'}`}>
          {signed && value > 0 ? '+' : ''}
          {value}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-slate-100">
        <div className={`h-1.5 rounded-full ${negative ? 'bg-rose-400' : 'bg-slate-800'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

/* --------------------------------- Main ---------------------------------- */

const IDEA_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'Equities', label: 'Stocks' },
  { id: 'Options', label: 'Options' },
  { id: 'Commodities', label: 'Commodities' },
  { id: 'Prediction Markets', label: 'Event contracts' },
  { id: 'Crypto Basis', label: 'Digital assets' },
];

export const Dashboard: React.FC<DashboardProps> = ({
  report,
  plaidStatus,
  onSyncPlaid,
  onOpenWizard,
  onNavigateTo100Trades,
  onNavigateToPlaid,
  onAsk,
  onPaperTrade,
  onOpenDisclosures,
}) => {
  const [filter, setFilter] = useState('all');
  const [focus, setFocus] = useState<ResearchFocus>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const session = marketSession();

  const ideas = useMemo(() => {
    const list = (report.recommendations || []).filter((t) => filter === 'all' || t.marketCategory === filter);
    return [...list].sort((a, b) => b.confidence - a.confidence).slice(0, 8);
  }, [report.recommendations, filter]);

  const holdings = plaidStatus?.holdings || [];
  const totalValue = plaidStatus?.accounts?.reduce((a, x) => a + (x.currentBalance || 0), 0) || 0;
  const totalCash = plaidStatus?.accounts?.reduce((a, x) => a + (x.availableBalance || 0), 0) || 0;
  const totalPnL = holdings.reduce((a, h) => a + (h.unrealizedPnL || 0), 0);
  const simulated = !plaidStatus || plaidStatus.mockMode;

  const sync = async () => {
    if (!onSyncPlaid) return;
    setIsSyncing(true);
    try {
      await onSyncPlaid();
    } finally {
      setIsSyncing(false);
    }
  };

  const research = (t: TradeRecommendation) =>
    onAsk(
      `Give me a balanced research overview of ${t.name} (${t.ticker}): what drives it, the bull case, the bear case, and the key risks of a ${instrumentOf(t).toLowerCase()} position.`,
      t.marketCategory === 'Commodities' ? 'commodities' : 'equities'
    );

  const sessionTone = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  }[session.tone];

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sentinel-fade-in">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium ${sessionTone}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
              {session.label}
            </span>
            <DataModeBadge mode={report.aiMode} />
            <span className="text-slate-400">Updated {report.lastUpdated}</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">{greeting()}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · Here's your market
            overview.
          </p>
        </div>
        {onOpenWizard && (
          <button
            type="button"
            onClick={onOpenWizard}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 sm:self-auto"
          >
            <SlidersHorizontal className="w-4 h-4" /> Research preferences
          </button>
        )}
      </div>

      {/* 2. Ask bar */}
      <Card className="relative overflow-hidden p-5 sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 right-0 h-56 w-96 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="relative">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Sparkles className="w-4 h-4 text-blue-600" /> Ask Sentinel
          </div>
          <Composer
            focus={focus}
            onFocusChange={setFocus}
            onSubmit={onAsk}
            placeholder="Ask about a stock, sector, commodity or economic trend…"
          />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['What moved markets today?', 'Explain the current yield curve', 'Risks in semiconductor stocks', 'How do aluminum futures work?'].map(
              (q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onAsk(q, 'all')}
                  className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                >
                  {q}
                </button>
              )
            )}
          </div>
        </div>
      </Card>

      {/* 3. Market metrics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {(report.macroMetrics || []).map((m) => (
          <MetricTile key={m.name} metric={m} />
        ))}
      </div>

      {/* 4. Ideas + Sentiment */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 overflow-hidden">
          <CardHeader
            icon={Search}
            title="Research ideas"
            subtitle="AI-generated ideas to investigate further. Not recommendations."
            action={
              onNavigateTo100Trades && (
                <button onClick={onNavigateTo100Trades} className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-blue-700 hover:text-blue-900">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )
            }
          />
          <div className="flex gap-1 overflow-x-auto px-5 pb-3" role="tablist" aria-label="Filter ideas by asset class">
            {IDEA_FILTERS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/60 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  <th className="py-2.5 pl-5 pr-3 font-medium">Asset</th>
                  <th className="px-3 py-2.5 font-medium">View</th>
                  <th className="px-3 py-2.5 font-medium">
                    <span className="inline-flex items-center gap-1" title="How strongly the model's inputs agree. Not a probability of profit.">
                      Model score <Info className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="px-3 py-2.5 font-medium">Risk</th>
                  <th className="py-2.5 pl-3 pr-5 text-right font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ideas.map((t, i) => {
                  const bullish = t.action === 'BUY' || t.action === 'CALL';
                  const risk = riskOf(t);
                  return (
                    <tr key={`${t.ticker}-${i}`} className="group transition-colors hover:bg-slate-50/70">
                      <td className="py-3 pl-5 pr-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-mono text-[10px] font-semibold text-slate-700">
                            {t.ticker.replace(/[^A-Z0-9]/gi, '').slice(0, 4)}
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900">{t.ticker}</div>
                            <div className="max-w-[220px] truncate text-xs text-slate-500" title={t.name}>
                              {t.name} · {instrumentOf(t)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                            bullish ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {bullish ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {bullish ? 'Bullish' : 'Bearish'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-slate-100">
                            <div className="h-1.5 rounded-full bg-slate-800" style={{ width: `${t.confidence}%` }} />
                          </div>
                          <span className="text-xs tabular-nums text-slate-600">{t.confidence}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${RISK_STYLE[risk]}`}>{risk}</span>
                      </td>
                      <td className="py-3 pl-3 pr-5">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => research(t)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          >
                            Research
                          </button>
                          {onPaperTrade && (
                            <button
                              onClick={() => onPaperTrade(t)}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                              title="Track this idea in a simulated portfolio"
                            >
                              Paper trade
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {ideas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                      No ideas in this category yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-5 py-3">
            <InlineDisclaimer text="Ideas and model scores are hypothetical, generated by AI from sample and public data, and may be wrong. They are not a forecast of returns or a recommendation to trade." />
          </div>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader title="Market sentiment" subtitle="Blend of news, social and policy signals" />
          <div className="px-5 pb-5">
            <SentimentGauge score={report.overallSentimentScore} />
            <div className="mt-5 space-y-3">
              <BreakdownBar label="News tone" value={report.sentimentBreakdown?.newsSentiment ?? 50} />
              <BreakdownBar label="Social chatter" value={report.sentimentBreakdown?.socialSentiment ?? 50} />
              <BreakdownBar label="Policy impact" value={report.sentimentBreakdown?.politicalImpact ?? 0} signed />
              <BreakdownBar label="Volatility" value={report.sentimentBreakdown?.volatility ?? 30} />
            </div>
            <button
              onClick={() => onAsk('What is driving overall market sentiment right now, and what could change it?', 'macro')}
              className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-50 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Explain sentiment
            </button>
          </div>
        </Card>
      </div>

      {/* 5. Sectors + News */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader title="Sector performance" subtitle="Change over the session (%)" />
          <div className="h-60 px-3 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.sectorPerformance || []} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="sector" type="category" width={130} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#334155' }} />
                <ReferenceLine x={0} stroke="#e2e8f0" />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(v: any) => [`${v}%`, 'Change']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px -12px rgba(15,23,42,.2)', fontSize: 12 }}
                />
                <Bar dataKey="performance" radius={[0, 6, 6, 0]} barSize={18}>
                  {(report.sectorPerformance || []).map((e, i) => (
                    <Cell key={i} fill={e.performance >= 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader icon={Newspaper} title="Headlines" subtitle={report.aiMode === 'live' ? 'From live web search' : 'Sample headlines (demo)'} />
          <ul className="divide-y divide-slate-100 px-5 pb-3">
            {(report.newsFeed || []).slice(0, 5).map((n, i) => (
              <li key={i} className="py-3">
                <button
                  onClick={() => onAsk(`Explain this headline and why it might matter for markets: "${n.headline}"`, 'all')}
                  className="group block text-left"
                >
                  <span className="text-sm font-medium leading-snug text-slate-800 group-hover:text-blue-700">{n.headline}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span>{n.source}</span>
                    <span aria-hidden="true">·</span>
                    <span>{n.publishedAt}</span>
                    <span className="ml-auto inline-flex items-center gap-0.5 text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                      Ask <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* 6. Portfolio + Risks */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7 overflow-hidden">
          <CardHeader
            icon={Wallet}
            title="Portfolio"
            subtitle={plaidStatus?.institution ? `Linked: ${plaidStatus.institution}` : 'No account linked'}
            action={
              <div className="flex items-center gap-2">
                {simulated && <SimulatedBadge label="Sample account" />}
                {onSyncPlaid && (
                  <button onClick={sync} disabled={isSyncing} aria-label="Refresh holdings" className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50">
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                )}
                {onNavigateToPlaid && (
                  <button onClick={onNavigateToPlaid} className="text-xs font-medium text-blue-700 hover:text-blue-900">
                    Details
                  </button>
                )}
              </div>
            }
          />
          <div className="grid grid-cols-3 gap-px border-y border-slate-100 bg-slate-100">
            {[
              { label: 'Total value', value: usd(totalValue) },
              { label: 'Cash available', value: usd(totalCash) },
              { label: 'Unrealized P&L', value: `${totalPnL >= 0 ? '+' : ''}${usd(totalPnL)}`, tone: totalPnL >= 0 ? 'text-emerald-600' : 'text-rose-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white px-5 py-3.5">
                <div className="text-[11px] text-slate-500">{s.label}</div>
                <div className={`mt-0.5 truncate text-base font-semibold tabular-nums ${s.tone || 'text-slate-900'}`}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="py-2.5 pl-5 pr-3 font-medium">Holding</th>
                  <th className="px-3 py-2.5 text-right font-medium">Price</th>
                  <th className="px-3 py-2.5 text-right font-medium">Value</th>
                  <th className="py-2.5 pl-3 pr-5 text-right font-medium">Return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {holdings.slice(0, 6).map((h) => (
                  <tr key={h.securityId} className="hover:bg-slate-50/70">
                    <td className="py-2.5 pl-5 pr-3">
                      <div className="font-semibold text-slate-900">{h.ticker}</div>
                      <div className="max-w-[200px] truncate text-xs text-slate-500">{h.name}</div>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{usd(h.closePrice, 2)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-medium text-slate-900">{usd(h.currentValue)}</td>
                    <td className={`py-2.5 pl-3 pr-5 text-right tabular-nums font-medium ${h.unrealizedPnLPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {h.unrealizedPnLPct >= 0 ? '+' : ''}
                      {h.unrealizedPnLPct}%
                    </td>
                  </tr>
                ))}
                {holdings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500">
                      Link a brokerage account to see holdings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {simulated && (
            <p className="border-t border-slate-100 px-5 py-3 text-[11px] text-slate-500">
              Sample portfolio for demonstration. Balances and returns are illustrative and not real account data.
            </p>
          )}
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader icon={ShieldAlert} title="Risk watch" subtitle="Events that could move markets" />
          <ul className="space-y-2.5 px-5 pb-5">
            {(report.politicalRisks || []).slice(0, 4).map((r, i) => (
              <li key={i} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-medium leading-snug text-slate-900">{r.event}</span>
                  <span
                    className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                      r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH' ? RISK_STYLE.High : r.riskLevel === 'MEDIUM' ? RISK_STYLE.Elevated : RISK_STYLE.Moderate
                    }`}
                  >
                    {r.riskLevel.toLowerCase()}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{r.impact}</p>
                <div className="mt-1.5 text-[11px] text-slate-400">{r.region}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* 7. Disclosure */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-5 py-4">
        <InlineDisclaimer text="Sentinel Trading is an educational research tool and is not a registered broker-dealer or investment adviser. Market data may be delayed or illustrative. AI-generated content may contain errors; verify all information with original sources." />
        {onOpenDisclosures && (
          <button onClick={onOpenDisclosures} className="ml-5 mt-1 text-[11px] font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900">
            Read full disclosures
          </button>
        )}
      </div>
    </div>
  );
};

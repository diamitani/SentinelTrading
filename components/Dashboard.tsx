import React, { useMemo, useState } from 'react';
import { MarketReport, TradeRecommendation, MacroMetric } from '../types';
import { PaperPortfolioState, computePortfolioSummary } from '../services/paperPortfolioService';
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
  ExternalLink,
  Landmark,
} from 'lucide-react';
import { ResearchFocus } from '../services/answerEngine';
import { Composer } from './research/ResearchParts';
import { DataModeBadge, InlineDisclaimer, SimulatedBadge } from './compliance/Compliance';

interface DashboardProps {
  report: MarketReport;
  paperPortfolio: PaperPortfolioState;
  onRefreshPaperPrices?: () => void;
  onClosePosition?: (positionId: string) => void;
  onOpenWizard?: () => void;
  onNavigateTo100Trades?: () => void;
  onNavigateToPlaid?: () => void;
  onNavigateToFeeds?: () => void;
  onAsk: (query: string, focus: ResearchFocus) => void;
  onPaperTrade?: (trade: TradeRecommendation) => void;
  onOpenDisclosures?: () => void;
}

const usd = (n: number, digits = 2) =>
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
  return 'Stock / ETF';
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
  <section className={`rounded-2xl border border-slate-200/80 bg-white ${className}`}>
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

const MetricTile: React.FC<{ metric: MacroMetric }> = ({ metric }) => {
  const Trend = metric.trend === 'UP' ? ArrowUpRight : metric.trend === 'DOWN' ? ArrowDownRight : Minus;
  const tone =
    metric.trend === 'UP' ? 'text-emerald-600 bg-emerald-50' : metric.trend === 'DOWN' ? 'text-rose-600 bg-rose-50' : 'text-slate-500 bg-slate-100';
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 transition-colors hover:border-slate-300">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-slate-500">{metric.name}</span>
        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${tone}`} aria-label={`Trend ${metric.trend.toLowerCase()}`}>
          <Trend className="w-3.5 h-3.5" />
        </span>
      </div>
      <div className="mt-2 font-mono text-xl font-semibold tracking-tight text-slate-900 tabular-nums">{metric.value}</div>
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
      <div className="-mt-3 font-mono text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">{s}</div>
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
        <span className={`font-mono font-medium tabular-nums ${negative ? 'text-rose-600' : 'text-slate-900'}`}>
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

const IDEA_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'Equities', label: 'Stocks & ETFs' },
  { id: 'Prediction Markets', label: 'Polymarket Live' },
  { id: 'Commodities', label: 'Commodities' },
  { id: 'Options', label: 'Options' },
  { id: 'Crypto Basis', label: 'Digital assets' },
];

export const Dashboard: React.FC<DashboardProps> = ({
  report,
  paperPortfolio,
  onRefreshPaperPrices,
  onClosePosition,
  onOpenWizard,
  onNavigateTo100Trades,
  onNavigateToPlaid,
  onNavigateToFeeds,
  onAsk,
  onPaperTrade,
  onOpenDisclosures,
}) => {
  const [filter, setFilter] = useState('all');
  const [focus, setFocus] = useState<ResearchFocus>('all');
  const session = marketSession();

  const ideas = useMemo(() => {
    const list = (report.recommendations || []).filter((t) => filter === 'all' || t.marketCategory === filter);
    return list.slice(0, 8);
  }, [report.recommendations, filter]);

  const portfolioSummary = computePortfolioSummary(paperPortfolio);

  const research = (t: TradeRecommendation) =>
    onAsk(
      `Give me a balanced research overview of ${t.name} (${t.ticker}): what drives it right now, the bull case, the bear case, and key risks.`,
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
            <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 font-medium ${sessionTone}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
              {session.label}
            </span>
            <DataModeBadge mode={report.aiMode} />
            {report.liveFeedStats && (
              <span className="font-mono text-[11px] text-slate-500">
                {report.liveFeedStats.storiesCount} live stories · {report.liveFeedStats.activeSourcesSucceeded} active feeds
              </span>
            )}
            <span className="text-slate-400">Updated {report.lastUpdated}</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">{greeting()}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · Live quotes,
            official US Treasury rates, and breaking financial news.
          </p>
        </div>
        {onOpenWizard && (
          <button
            type="button"
            onClick={onOpenWizard}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 sm:self-auto"
          >
            <SlidersHorizontal className="w-4 h-4" /> Research preferences
          </button>
        )}
      </div>

      {/* 2. Ask bar */}
      <Card className="p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Sparkles className="w-4 h-4 text-blue-600" /> Ask Sentinel (Live Web + 100 Financial Feeds)
          </div>
          {onNavigateToFeeds && (
            <button
              type="button"
              onClick={onNavigateToFeeds}
              className="text-xs font-medium text-blue-700 hover:text-blue-900"
            >
              Browse all 100 feeds →
            </button>
          )}
        </div>
        <Composer
          focus={focus}
          onFocusChange={setFocus}
          onSubmit={onAsk}
          placeholder="Ask about stocks, US Treasury bonds, Fed rates, REITs, cybersecurity, AI deals, or Polymarket…"
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            'What moved stocks and Treasury bonds today?',
            'Latest PitchBook & Dealroom AI startup deals',
            'Top CISA cybersecurity advisories & affected stocks',
            'Current mortgage & commercial real estate trends',
          ].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onAsk(q, 'all')}
              className="rounded-lg border border-slate-200 bg-[#FAFAF9] px-3 py-1 text-xs text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
            >
              {q}
            </button>
          ))}
        </div>
      </Card>

      {/* 3. Live Market Metrics (Yahoo Finance & Coinbase Live APIs) */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {(report.macroMetrics || []).map((m) => (
          <MetricTile key={m.name} metric={m} />
        ))}
      </div>

      {/* 3b. Official US Treasury Bond Rates & Live Polymarket Strip */}
      {((report.treasuryRates && report.treasuryRates.length > 0) || (report.polymarkets && report.polymarkets.length > 0)) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {report.treasuryRates && report.treasuryRates.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                  <Landmark className="h-3.5 w-3.5 text-blue-600" /> Official US Treasury Bond Rates (Fiscal Data API)
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  As of {report.treasuryRates[0]?.recordDate}
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {report.treasuryRates.slice(0, 6).map((t) => (
                  <div key={t.securityDesc} className="rounded-lg border border-slate-100 bg-[#FAFAF9] px-2.5 py-2">
                    <div className="truncate text-[11px] text-slate-500" title={t.securityDesc}>
                      {t.securityDesc}
                    </div>
                    <div className="mt-0.5 font-mono text-sm font-semibold text-slate-900 tabular-nums">
                      {t.avgInterestRateAmt.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {report.polymarkets && report.polymarkets.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900">
                  Live Polymarket Active Contracts (Gamma API)
                </span>
                {onNavigateToFeeds && (
                  <button
                    type="button"
                    onClick={onNavigateToFeeds}
                    className="text-[11px] font-medium text-blue-700 hover:underline"
                  >
                    See all live feeds
                  </button>
                )}
              </div>
              <ul className="mt-2 divide-y divide-slate-100">
                {report.polymarkets.slice(0, 3).map((pm) => (
                  <li key={pm.id} className="flex items-center justify-between gap-3 py-2 text-xs">
                    <a
                      href={pm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-0 flex-1 truncate font-medium text-slate-800 hover:text-blue-700"
                      title={pm.question}
                    >
                      {pm.question}
                    </a>
                    <span className="shrink-0 font-mono font-semibold text-blue-700 tabular-nums">
                      {Math.round(pm.yesPrice * 100)}¢ YES
                    </span>
                    <span className="hidden sm:inline shrink-0 font-mono text-[11px] text-slate-400 tabular-nums">
                      ${Math.round(pm.volume24hr).toLocaleString()} vol
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* 4. Ideas + Sentiment */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 overflow-hidden">
          <CardHeader
            icon={Search}
            title="Live researched market ideas"
            subtitle="Live quotes from Yahoo Finance & Polymarket. Test any idea with virtual cash."
            action={
              onNavigateTo100Trades && (
                <button
                  onClick={onNavigateTo100Trades}
                  className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-blue-700 hover:text-blue-900"
                >
                  View all 100 <ChevronRight className="w-3.5 h-3.5" />
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
                  <th className="px-3 py-2.5 font-medium">Live Price</th>
                  <th className="px-3 py-2.5 font-medium">
                    <span className="inline-flex items-center gap-1" title="Strength of research inputs. Not a guarantee of return.">
                      Signal <Info className="w-3 h-3" />
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
                            <div className="max-w-[230px] truncate text-xs text-slate-500" title={t.name}>
                              {t.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs font-semibold text-slate-900 tabular-nums">
                        {t.entryPrice ? `$${t.entryPrice.toFixed(2)}` : 'Live'}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-14 rounded-full bg-slate-100">
                            <div className="h-1.5 rounded-full bg-slate-800" style={{ width: `${t.confidence}%` }} />
                          </div>
                          <span className="font-mono text-xs tabular-nums text-slate-600">{t.confidence}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${RISK_STYLE[risk]}`}>
                          {risk}
                        </span>
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
                              className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                              title="Practice buying this idea with virtual cash"
                            >
                              Paper trade
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-5 py-3">
            <InlineDisclaimer text="Educational research ideas based on live public quotes and RSS feeds. Not personalized investment advice." />
          </div>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader title="Market sentiment" subtitle="Derived from live sector breadth & VIX" />
          <div className="px-5 pb-5">
            <SentimentGauge score={report.overallSentimentScore} />
            <div className="mt-5 space-y-3">
              <BreakdownBar label="News tone" value={report.sentimentBreakdown?.newsSentiment ?? 50} />
              <BreakdownBar label="Breadth momentum" value={report.sentimentBreakdown?.socialSentiment ?? 50} />
              <BreakdownBar label="Volatility drag" value={report.sentimentBreakdown?.politicalImpact ?? 0} signed />
              <BreakdownBar label="VIX reading" value={report.sentimentBreakdown?.volatility ?? 20} />
            </div>
            <button
              onClick={() => onAsk('What is driving overall market sentiment and VIX volatility today?', 'macro')}
              className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-50 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Explain today’s sentiment
            </button>
          </div>
        </Card>
      </div>

      {/* 5. Live Sector ETFs + Real Clickable Live Headlines */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader title="Live sector ETF performance" subtitle="Today’s % move via Yahoo Finance" />
          <div className="h-64 px-3 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.sectorPerformance || []} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="sector" type="category" width={145} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#334155' }} />
                <ReferenceLine x={0} stroke="#e2e8f0" />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(v: any) => [`${v}%`, 'Today']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="performance" radius={[0, 6, 6, 0]} barSize={16}>
                  {(report.sectorPerformance || []).map((e, i) => (
                    <Cell key={i} fill={e.performance >= 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader
            icon={Newspaper}
            title="Live breaking stories"
            subtitle="Real-time RSS headlines — click to open or ask Sentinel"
            action={
              onNavigateToFeeds && (
                <button onClick={onNavigateToFeeds} className="text-xs font-medium text-blue-700 hover:text-blue-900">
                  All feeds →
                </button>
              )
            }
          />
          <ul className="divide-y divide-slate-100 px-5 pb-3">
            {(report.newsFeed || []).slice(0, 5).map((n, i) => (
              <li key={i} className="py-3">
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium leading-snug text-slate-800 hover:text-blue-700"
                  >
                    {n.headline}
                  </a>
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open original article"
                    className="mt-0.5 shrink-0 text-slate-400 hover:text-blue-600"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-medium text-slate-600">{n.source}</span>
                  <span aria-hidden="true">·</span>
                  <span>{n.publishedAt}</span>
                  <button
                    type="button"
                    onClick={() => onAsk(`Explain this headline and why it matters for everyday investors: "${n.headline}"`, 'all')}
                    className="ml-auto inline-flex items-center gap-0.5 font-medium text-blue-600 hover:text-blue-800"
                  >
                    Ask Sentinel <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* 6. Real Virtual Paper Portfolio + Live Risk Watch */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7 overflow-hidden">
          <CardHeader
            icon={Wallet}
            title="Your Virtual Paper Portfolio"
            subtitle={`Broker tracker: ${paperPortfolio.linkedBroker} · Starting budget ${usd(paperPortfolio.startingBudget, 0)}`}
            action={
              <div className="flex items-center gap-2">
                <SimulatedBadge label="Paper Mode" />
                {onRefreshPaperPrices && (
                  <button
                    onClick={onRefreshPaperPrices}
                    aria-label="Simulate live price tick"
                    title="Simulate price move"
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
                {onNavigateToPlaid && (
                  <button onClick={onNavigateToPlaid} className="text-xs font-medium text-blue-700 hover:text-blue-900">
                    Manage
                  </button>
                )}
              </div>
            }
          />
          <div className="grid grid-cols-3 gap-px border-y border-slate-100 bg-slate-100">
            {[
              { label: 'Total value', value: usd(portfolioSummary.totalValue) },
              { label: 'Virtual cash', value: usd(paperPortfolio.cashBalance) },
              {
                label: 'Simulated P&L',
                value: `${portfolioSummary.totalPnL >= 0 ? '+' : '-'}${usd(Math.abs(portfolioSummary.totalPnL))}`,
                tone: portfolioSummary.totalPnL >= 0 ? 'text-emerald-600' : 'text-rose-600',
              },
            ].map((s) => (
              <div key={s.label} className="bg-white px-5 py-3.5">
                <div className="text-[11px] text-slate-500">{s.label}</div>
                <div className={`mt-0.5 truncate font-mono text-base font-semibold tabular-nums ${s.tone || 'text-slate-900'}`}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="py-2.5 pl-5 pr-3 font-medium">Position</th>
                  <th className="px-3 py-2.5 text-right font-medium">Price</th>
                  <th className="px-3 py-2.5 text-right font-medium">Value</th>
                  <th className="px-3 py-2.5 text-right font-medium">P&amp;L</th>
                  <th className="py-2.5 pl-2 pr-5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paperPortfolio.positions.slice(0, 6).map((p) => {
                  const mktVal = p.quantity * p.currentPrice;
                  const cost = p.quantity * p.avgEntryPrice;
                  const pnl = mktVal - cost;
                  const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 pl-5 pr-3">
                        <div className="font-semibold text-slate-900">{p.ticker}</div>
                        <div className="max-w-[180px] truncate text-xs text-slate-500">
                          {p.quantity.toFixed(3)} units · {p.action}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-slate-700">
                        {usd(p.currentPrice)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums font-medium text-slate-900">
                        {usd(mktVal)}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-right font-mono text-xs tabular-nums font-medium ${
                          pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {pnl >= 0 ? '+' : ''}
                        {pnlPct.toFixed(2)}%
                      </td>
                      <td className="py-2.5 pl-2 pr-5 text-right">
                        {onClosePosition && (
                          <button
                            type="button"
                            onClick={() => onClosePosition(p.id)}
                            className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Close
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {paperPortfolio.positions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">
                      No open paper positions yet. Click <strong>Paper trade</strong> on any idea above to allocate part
                      of your {usd(paperPortfolio.cashBalance, 0)} virtual cash.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader icon={ShieldAlert} title="Live risk & policy watch" subtitle="Federal Reserve, Treasury & CISA advisories" />
          <ul className="space-y-2.5 px-5 pb-5">
            {(report.politicalRisks || []).slice(0, 4).map((r, i) => (
              <li key={i} className="rounded-xl border border-slate-100 bg-[#FAFAF9] p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-medium leading-snug text-slate-900">{r.event}</span>
                  <span
                    className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                      r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH'
                        ? RISK_STYLE.High
                        : r.riskLevel === 'MEDIUM'
                        ? RISK_STYLE.Elevated
                        : RISK_STYLE.Moderate
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
      <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4">
        <InlineDisclaimer text="Sentinel Trading is an educational research tool and is not a registered broker-dealer or investment adviser. Live feeds and public APIs may be delayed; AI content may contain errors. Verify all information with the primary source links." />
        {onOpenDisclosures && (
          <button
            onClick={onOpenDisclosures}
            className="ml-5 mt-1 text-[11px] font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
          >
            Read full disclosures
          </button>
        )}
      </div>
    </div>
  );
};

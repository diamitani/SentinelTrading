import React, { useState } from 'react';
import {
  MarketReport,
  TradeRecommendation,
  MacroMetric,
  PlaidStatus,
  ChatMessage,
} from '../types';
import { queryReportAgent } from '../services/geminiService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Sparkles,
  FileText,
  Zap,
  Send,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Layers,
  MessageSquare,
  Globe,
  Wallet,
  Target,
  Clock,
  Cpu,
} from 'lucide-react';

interface DashboardProps {
  report: MarketReport;
  plaidStatus?: PlaidStatus | null;
  onSyncPlaid?: () => Promise<void>;
  onOpenWizard?: () => void;
  onNavigateTo100Trades?: () => void;
  onNavigateToPal?: () => void;
  onNavigateToPlaid?: () => void;
  onNavigateToSandbox?: () => void;
  onExecuteTrade?: (trade: TradeRecommendation) => void;
}

const MacroCard: React.FC<{ metric: MacroMetric }> = ({ metric }) => {
  const isUp = metric.trend === 'UP';
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors">
      <div className="text-[11px] text-slate-500 uppercase font-mono font-medium tracking-wider">
        {metric.name}
      </div>
      <div className="text-xl font-mono text-slate-900 font-bold my-1 tracking-tight">
        {metric.value}
      </div>
      <div
        className={`text-xs flex items-center gap-1 font-mono font-medium ${
          isUp
            ? 'text-emerald-600'
            : metric.trend === 'DOWN'
            ? 'text-red-600'
            : 'text-slate-500'
        }`}
      >
        <span>{isUp ? '▲' : metric.trend === 'DOWN' ? '▼' : '—'}</span>
        <span>{metric.trend}</span>
      </div>
    </div>
  );
};

const TradeCard: React.FC<{
  trade: TradeRecommendation;
  onExecute?: (trade: TradeRecommendation) => void;
}> = ({ trade, onExecute }) => {
  const isBuy = trade.action === 'BUY' || trade.action === 'CALL';
  const isCritical = trade.oneMustActUrgency === 'CRITICAL_IMMEDIATE';

  return (
    <div
      className={`p-4 sm:p-5 rounded-xl border bg-white flex flex-col justify-between transition-all hover:border-slate-400 shadow-xs ${
        isCritical
          ? 'border-blue-300 ring-1 ring-blue-100 bg-blue-50/10'
          : 'border-slate-200'
      }`}
    >
      <div>
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h4 className="text-lg font-bold text-slate-900 tracking-tight font-mono">
                {trade.ticker}
              </h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  isBuy
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    : 'text-red-700 bg-red-50 border border-red-200'
                }`}
              >
                {trade.action}
              </span>
              {trade.goalHorizonTag && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                  {trade.goalHorizonTag}
                </span>
              )}
              {trade.targetReturnPct && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  +{trade.targetReturnPct}% Target
                </span>
              )}
            </div>
            <div className="text-xs font-semibold text-slate-700 truncate mt-1">
              {trade.name}
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-blue-600 font-mono font-bold text-sm">
              ${trade.entryPrice?.toFixed(2) ?? 'MKT'}
            </div>
            {trade.arbitrageSpreadPct && (
              <div className="text-[10px] font-mono font-bold text-emerald-700">
                +{trade.arbitrageSpreadPct}% Spread
              </div>
            )}
          </div>
        </div>

        {trade.predictionOddsSpread && (
          <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-mono text-amber-950 font-semibold">
            🎲 {trade.predictionOddsSpread}
          </div>
        )}

        {trade.commoditySecondOrderImpact && !trade.predictionOddsSpread && (
          <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] font-mono text-blue-950 font-semibold">
            ⛓️ {trade.commoditySecondOrderImpact}
          </div>
        )}

        <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">
          {trade.reasoning}
        </p>

        {trade.primaryVenue && trade.hedgeVenue && (
          <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 mb-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Primary:</span>
              <span className="text-slate-800 font-medium">{trade.primaryVenue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Hedge:</span>
              <span className="text-slate-800 font-medium">{trade.hedgeVenue}</span>
            </div>
          </div>
        )}
      </div>

      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="text-slate-500">
            Conf: <strong className="text-slate-900">{trade.confidence}%</strong>
          </span>
          {trade.positionScaleMultiple && (
            <span className="text-emerald-700 font-bold">
              Scale {trade.positionScaleMultiple}x
            </span>
          )}
        </div>
        {onExecute && (
          <button
            type="button"
            onClick={() => onExecute(trade)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-mono font-bold transition-colors shadow-xs"
          >
            ACT NOW →
          </button>
        )}
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({
  report,
  plaidStatus,
  onSyncPlaid,
  onOpenWizard,
  onNavigateTo100Trades,
  onNavigateToPal,
  onNavigateToPlaid,
  onNavigateToSandbox,
  onExecuteTrade,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [isSyncingPlaid, setIsSyncingPlaid] = useState(false);

  // Embedded Co-Pilot Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'dash-welcome',
      role: 'model',
      text: `[ROSTR Co-Pilot · W=1.00 · 11ms DAG] Ready. Active Hypothesis: "${
        report.wizardConfig?.hypothesisPrompt?.slice(0, 95) ||
        'Pepsi beverage rollout -> CME Aluminum (ALI=F) & Alcoa (AA) calls + Polymarket/Kalshi odds spread'
      }...". Ask me to analyze any commodity ripple, prediction market spread, or Plaid DMA sizing.`,
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const wizard = report.wizardConfig;
  const rostr = report.rostrRun;

  const filteredRecommendations = (report.recommendations || []).filter((t) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'Prediction Markets' || selectedFilter === 'Commodities') {
      return t.marketCategory === selectedFilter;
    }
    return t.goalHorizonTag === selectedFilter;
  });

  const handleQuickChat = async (promptText: string) => {
    if (!promptText.trim() || isChatLoading) return;
    const userMsg: ChatMessage = {
      id: 'u-' + Date.now(),
      role: 'user',
      text: promptText,
      timestamp: new Date(),
    };
    const nextHist = [...chatMessages, userMsg];
    setChatMessages(nextHist);
    setChatInput('');
    setIsChatLoading(true);
    try {
      const reply = await queryReportAgent(report, nextHist, promptText);
      setChatMessages((prev) => [
        ...prev,
        {
          id: 'm-' + Date.now(),
          role: 'model',
          text: reply,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handlePlaidSyncClick = async () => {
    if (!onSyncPlaid) return;
    setIsSyncingPlaid(true);
    try {
      await onSyncPlaid();
    } finally {
      setIsSyncingPlaid(false);
    }
  };

  const totalPlaidBalance =
    plaidStatus?.accounts?.reduce((acc, a) => acc + (a.currentBalance || 0), 0) ||
    19800000;
  const totalBuyingPower =
    plaidStatus?.accounts?.reduce((acc, a) => acc + (a.availableBalance || 0), 0) ||
    15550000;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. ROSTR ACTIVE HYPOTHESIS, PHILOSOPHY & GOALS COMMAND BAR */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-mono font-bold">
                ROSTR AGENT HARNESS · W = {rostr?.wholeness?.guidedScoreW?.toFixed(2) || '1.00'}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-mono font-bold">
                HORIZON: {wizard?.holdingHorizon || '3-Day Profit'} · GOAL: +
                {wizard?.targetReturnPct || 10.4}%
              </span>
              <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-mono font-bold">
                PHILOSOPHY: {wizard?.philosophy || 'Second-Order Commodity Ripples'}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[11px] font-mono font-bold">
                DAG WAVE: {rostr?.dagCompression?.compressedTotalMs || 11}ms (2.94x)
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
              Active Hypothesis: &ldquo;
              {wizard?.hypothesisPrompt ||
                'High Pepsi canned beverage rollout -> CME Aluminum (ALI=F) & Alcoa (AA) calls + Polymarket/Kalshi event spread'}
              &rdquo;
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenWizard && (
              <button
                type="button"
                onClick={onOpenWizard}
                className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-colors"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                Hypothesis &amp; Goals Wizard
              </button>
            )}
            {onNavigateToPal && (
              <button
                type="button"
                onClick={onNavigateToPal}
                className="inline-flex items-center px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold transition-colors"
              >
                <FileText className="w-4 h-4 mr-1.5" />
                11 POP Artifacts (.MD)
              </button>
            )}
            {onNavigateToSandbox && (
              <button
                type="button"
                onClick={onNavigateToSandbox}
                className="inline-flex items-center px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold transition-colors"
              >
                <Cpu className="w-4 h-4 mr-1.5" />
                Sandbox &amp; Composio
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MACRO METRICS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {(report.macroMetrics || []).map((m, i) => (
          <MacroCard key={i} metric={m} />
        ))}
      </div>

      {/* 3. TAILORED ARBITRAGE & PREDICTION MARKET SIGNALS WITH HORIZON FILTER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              One-Must-Act Arbitrage, Commodity Ripple &amp; Prediction Market Signals
            </h3>
            <p className="text-xs text-slate-500">
              Filtered by your trading philosophy, holding horizon (3-Day Profit, Weekly, Monthly, Quarterly, 1-Year Hold), and +10% target.
            </p>
          </div>

          {onNavigateTo100Trades && (
            <button
              type="button"
              onClick={onNavigateTo100Trades}
              className="text-xs font-mono font-bold text-blue-600 hover:text-blue-800 shrink-0"
            >
              OPEN FULL 100-TRADE MATRIX →
            </button>
          )}
        </div>

        {/* Horizon & Market Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Signals (100)' },
            { id: '3-Day Profit', label: '⚡ 3-Day Profit (+10%)' },
            { id: 'Weekly', label: '📅 Weekly Cycle' },
            { id: 'Monthly', label: '🗓️ Monthly Swing' },
            { id: 'Quarterly', label: '📈 Quarterly Macro' },
            { id: 'Hold 1 Year', label: '🏛️ Hold 1 Year (10x)' },
            { id: 'Prediction Markets', label: '🎲 Prediction & Betting Markets' },
            { id: 'Commodities', label: '⛓️ Second-Order Commodities' },
          ].map((tab) => {
            const active = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecommendations.slice(0, 6).map((trade, idx) => (
            <TradeCard key={idx} trade={trade} onExecute={onExecuteTrade} />
          ))}
        </div>
      </div>

      {/* 4. UNIFIED COCKPIT: EMBEDDED CHAT CO-PILOT + DEEP RESEARCH & SECOND-ORDER RIPPLES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Embedded Live ROSTR Chat Co-Pilot */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  Live ROSTR Quant Co-Pilot Chat
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                11ms DAG Grounded
              </span>
            </div>

            {/* Quick Prompt Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {[
                'Pepsi Aluminum 3-Day +10% setup',
                'Polymarket vs Kalshi odds spread',
                'AI Chips CoWoS TSMC/NVDA arb',
                'Explain my Plaid DMA holdings',
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleQuickChat(q)}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[11px] font-medium border border-slate-200 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Message Transcript */}
            <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {chatMessages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white ml-6'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 mr-2 font-mono'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {isChatLoading && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-500">
                  Executing ROSTR Middle-Out DAG Wave query...
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleQuickChat(chatInput);
            }}
            className="flex items-center gap-2 pt-2 border-t border-slate-100"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about hypotheses, commodities, prediction odds..."
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isChatLoading}
              className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right 7 Cols: Deep Research & Second-Order Commodity / Prediction Ripple Chains */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Deep Research: Second-Order Commodity &amp; Prediction Market Ripple Chains
              </h3>
              <p className="text-xs text-slate-500">
                How primary catalysts propagate into CME commodity futures, options skew, and event contracts.
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-bold">
              Wave-2 Parallel Scout
            </span>
          </div>

          <div className="space-y-3">
            {(report.secondOrderChains || []).map((chain, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-colors space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    {chain.primaryEvent}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                    {chain.expectedSpreadExpansion} · {chain.confidence}% Conf
                  </span>
                </div>
                <p className="text-xs text-slate-600">{chain.derivedHypothesis}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono">
                  <span className="text-slate-700">
                    <strong>Impacted:</strong> {chain.impactedCommodity}
                  </span>
                  <span className="text-blue-700 font-bold">
                    Action: {chain.recommendedContract}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. PLAID HOLDINGS & BUYING POWER + LIVE NEWS & OMNICHANNEL DATA WIRE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Plaid Institutional Holdings & Buying Power */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center">
                <Wallet className="w-4 h-4 mr-1.5 text-emerald-600" />
                Plaid Prime Brokerage Holdings &amp; DMA Buying Power
              </h3>
              <p className="text-xs text-slate-500">
                {plaidStatus?.institution || 'Morgan Stanley Institutional & Apex Clearing'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onSyncPlaid && (
                <button
                  type="button"
                  onClick={handlePlaidSyncClick}
                  disabled={isSyncingPlaid}
                  className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 mr-1 ${isSyncingPlaid ? 'animate-spin' : ''}`}
                  />
                  Sync
                </button>
              )}
              {onNavigateToPlaid && (
                <button
                  type="button"
                  onClick={onNavigateToPlaid}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  Full Ledger →
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-mono uppercase text-slate-500">
                Total Portfolio Equity
              </div>
              <div className="text-lg font-extrabold font-mono text-slate-900 mt-0.5">
                ${totalPlaidBalance.toLocaleString()}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="text-[10px] font-mono uppercase text-emerald-700">
                Available DMA Buying Power
              </div>
              <div className="text-lg font-extrabold font-mono text-emerald-800 mt-0.5">
                ${totalBuyingPower.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-mono uppercase text-slate-400">
                  <th className="py-2">Ticker</th>
                  <th className="py-2">Position</th>
                  <th className="py-2 text-right">Mark Price</th>
                  <th className="py-2 text-right">Market Value</th>
                  <th className="py-2 text-right">Unrealized P&amp;L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {(plaidStatus?.holdings || []).map((h) => (
                  <tr key={h.securityId} className="hover:bg-slate-50">
                    <td className="py-2 font-bold text-slate-900">{h.ticker}</td>
                    <td className="py-2 font-sans text-slate-600 truncate max-w-[140px]">
                      {h.name}
                    </td>
                    <td className="py-2 text-right text-slate-800">
                      ${h.closePrice.toFixed(2)}
                    </td>
                    <td className="py-2 text-right font-semibold text-slate-900">
                      ${h.currentValue.toLocaleString()}
                    </td>
                    <td
                      className={`py-2 text-right font-bold ${
                        h.unrealizedPnLPct >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      +{h.unrealizedPnLPct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 6 Cols: Live News & Omnichannel Firehose Nodes */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center">
                <Globe className="w-4 h-4 mr-1.5 text-blue-600" />
                Live News &amp; 7-Stream Omnichannel Data Wire
              </h3>
              <p className="text-xs text-slate-500">
                Polymarket/Kalshi CLOB, X Firehose, Reddit WSB, Google Trends, SEC EDGAR &amp; Reuters
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
              7 FEEDS ONLINE
            </span>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {(report.omnichannelNodes || []).map((node) => (
              <div
                key={node.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {node.channel}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                      Velocity {node.velocityScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{node.sampleSignal}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {node.lastPing}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
              Breaking Financial &amp; Commodity Wire
            </div>
            {(report.newsFeed || []).slice(0, 3).map((n, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0"
              >
                <span className="font-medium text-slate-800 truncate pr-2">
                  {n.headline}
                </span>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {n.source} · {n.publishedAt}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. SECTOR ROTATION & GEOPOLITICAL RISK FOOTER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-4">
            Sector Rotation &amp; Materials Performance (%)
          </h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={report.sectorPerformance || []}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis
                  dataKey="sector"
                  type="category"
                  stroke="#0f172a"
                  width={120}
                  tick={{ fontSize: 11, fontWeight: 600 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    color: '#0f172a',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="performance" radius={[0, 4, 4, 0]} barSize={20}>
                  {(report.sectorPerformance || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.performance >= 0 ? '#059669' : '#dc2626'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
            Macro, Commodity &amp; Prediction Market Structural Risks
          </h3>
          {(report.politicalRisks || []).map((risk, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  {risk.region}: {risk.event}
                </span>
                <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-mono font-bold">
                  {risk.riskLevel}
                </span>
              </div>
              <p className="text-xs text-slate-600">{risk.impact}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
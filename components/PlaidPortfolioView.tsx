import React, { useState } from 'react';
import { RefreshCw, RotateCcw, Wallet, ArrowRight, CheckCircle2, History } from 'lucide-react';
import {
  PaperPortfolioState,
  EVERYDAY_BUDGET_PRESETS,
  CONSUMER_BROKERS,
  computePortfolioSummary,
} from '../services/paperPortfolioService';
import { InlineDisclaimer, SimulatedBadge } from './compliance/Compliance';

interface PlaidPortfolioViewProps {
  portfolio: PaperPortfolioState;
  onSelectBudget: (amount: number) => void;
  onRefreshPrices: () => void;
  onClosePosition: (positionId: string) => void;
  onLinkBroker: (name: string) => void;
  onBrowseIdeas: () => void;
}

const usd = (n: number, digits = 2) =>
  n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export const PlaidPortfolioView: React.FC<PlaidPortfolioViewProps> = ({
  portfolio,
  onSelectBudget,
  onRefreshPrices,
  onClosePosition,
  onLinkBroker,
  onBrowseIdeas,
}) => {
  const [selectedBroker, setSelectedBroker] = useState<string>(portfolio.linkedBroker || CONSUMER_BROKERS[0]);
  const [customBudget, setCustomBudget] = useState<string>('');
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  const summary = computePortfolioSummary(portfolio);

  const applyCustomBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(customBudget);
    if (Number.isFinite(val) && val >= 25) {
      onSelectBudget(val);
      setCustomBudget('');
      setConfirmReset(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 sentinel-fade-in">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Virtual Paper Portfolio
            </h1>
            <SimulatedBadge label="Practice Mode · $0 Real Risk" />
          </div>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Practice sizing, buying, and closing ideas with realistic everyday budgets from $100 to $50,000+. Every
            paper trade updates your virtual cash and P&amp;L automatically.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={onRefreshPrices}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Simulate Price Move
          </button>
          <button
            type="button"
            onClick={onBrowseIdeas}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Find ideas to trade <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Key Portfolio Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Total Paper Value</div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {usd(summary.totalValue)}
          </div>
          <div className="mt-1 font-mono text-xs text-slate-500 tabular-nums">
            Started with {usd(portfolio.startingBudget, 0)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-blue-700">Available Virtual Cash</div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-blue-600 tabular-nums">
            {usd(portfolio.cashBalance)}
          </div>
          <div className="mt-1 text-xs text-slate-500">Ready for new paper trades</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Open Positions Value</div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {usd(summary.holdingsValue)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {portfolio.positions.length} open {portfolio.positions.length === 1 ? 'position' : 'positions'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Total Simulated P&amp;L</div>
          <div
            className={`mt-1.5 font-mono text-2xl font-bold tabular-nums ${
              summary.totalPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {summary.totalPnL >= 0 ? '+' : '-'}
            {usd(Math.abs(summary.totalPnL))}
          </div>
          <div
            className={`mt-1 font-mono text-xs font-semibold tabular-nums ${
              summary.totalPnLPct >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {summary.totalPnLPct >= 0 ? '+' : ''}
            {summary.totalPnLPct.toFixed(2)}% overall return
          </div>
        </div>
      </div>

      {/* Main Content: Left = Budget & Consumer Broker | Right = Open & Closed Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Starting Budget Picker */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Wallet className="h-4 w-4 text-blue-600" /> Choose Starting Budget
              </h2>
              <button
                type="button"
                onClick={() => setConfirmReset((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Switching your starting budget resets open paper positions and gives you fresh virtual cash.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {EVERYDAY_BUDGET_PRESETS.map((amt) => {
                const active = Math.round(portfolio.startingBudget) === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => onSelectBudget(amt)}
                    className={`rounded-xl py-2 font-mono text-xs font-semibold tabular-nums transition-colors ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-[#FAFAF9] text-slate-700 hover:border-blue-300 hover:text-blue-700'
                    }`}
                  >
                    ${amt.toLocaleString()}
                  </button>
                );
              })}
            </div>

            <form onSubmit={applyCustomBudget} className="mt-3 flex gap-2">
              <input
                type="number"
                min={25}
                max={1000000}
                value={customBudget}
                onChange={(e) => setCustomBudget(e.target.value)}
                placeholder="Custom amount ($25+)"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Apply
              </button>
            </form>

            {confirmReset && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                Reset back to {usd(portfolio.startingBudget, 0)} cash and clear open positions?
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectBudget(portfolio.startingBudget);
                      setConfirmReset(false);
                    }}
                    className="rounded-lg bg-amber-700 px-3 py-1 font-semibold text-white hover:bg-amber-800"
                  >
                    Yes, reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="rounded-lg border border-amber-300 bg-white px-3 py-1 font-semibold text-amber-900"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Everyday Consumer Broker Tracker */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold text-slate-900">Personal Brokerage Reference</h2>
            <p className="mt-1 text-xs text-slate-500">
              Select the everyday brokerage you use (or plan to use) so Sentinel frames notes and checklists for your
              real account.
            </p>

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2.5 text-xs font-medium text-emerald-900">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Active preference: {portfolio.linkedBroker}</span>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <select
                value={selectedBroker}
                onChange={(e) => setSelectedBroker(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                {CONSUMER_BROKERS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onLinkBroker(selectedBroker)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                Save brokerage preference
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Open Positions + Closed Trade History */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Open Paper Positions</h2>
                <p className="text-xs text-slate-500">Last updated {new Date(portfolio.updatedAt).toLocaleTimeString()}</p>
              </div>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {portfolio.positions.length} active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-3 pl-5 pr-3 font-medium">Asset</th>
                    <th className="px-3 py-3 text-right font-medium">Units</th>
                    <th className="px-3 py-3 text-right font-medium">Avg Entry</th>
                    <th className="px-3 py-3 text-right font-medium">Current</th>
                    <th className="px-3 py-3 text-right font-medium">Value</th>
                    <th className="px-3 py-3 text-right font-medium">Unrealized P&amp;L</th>
                    <th className="py-3 pl-3 pr-5 text-right font-medium">Close</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {portfolio.positions.map((p) => {
                    const value = p.quantity * p.currentPrice;
                    const cost = p.quantity * p.avgEntryPrice;
                    const pnl = value - cost;
                    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 pl-5 pr-3">
                          <div className="font-semibold text-slate-900">{p.ticker}</div>
                          <div className="max-w-[170px] truncate text-[11px] text-slate-500">{p.name}</div>
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono tabular-nums text-slate-700">
                          {p.quantity.toFixed(4)}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono tabular-nums text-slate-500">
                          {usd(p.avgEntryPrice)}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono font-semibold tabular-nums text-slate-900">
                          {usd(p.currentPrice)}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono font-semibold tabular-nums text-slate-900">
                          {usd(value)}
                        </td>
                        <td
                          className={`px-3 py-3.5 text-right font-mono font-semibold tabular-nums ${
                            pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {pnl >= 0 ? '+' : '-'}
                          {usd(Math.abs(pnl))}
                          <div className="text-[10px]">
                            ({pnlPct >= 0 ? '+' : ''}
                            {pnlPct.toFixed(2)}%)
                          </div>
                        </td>
                        <td className="py-3.5 pl-3 pr-5 text-right">
                          <button
                            type="button"
                            onClick={() => onClosePosition(p.id)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-100"
                          >
                            Sell / Close
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {portfolio.positions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                        Your paper portfolio is 100% in virtual cash ({usd(portfolio.cashBalance)}).
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={onBrowseIdeas}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Browse Research Ideas
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Closed Trades History */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <History className="h-4 w-4 text-slate-400" /> Closed Paper Trade History
              </h2>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                Realized: {summary.realizedPnL >= 0 ? '+' : '-'}
                {usd(Math.abs(summary.realizedPnL))}
              </span>
            </div>

            {portfolio.closedTrades.length === 0 ? (
              <p className="px-5 py-6 text-xs text-slate-500">
                When you close an open paper position, its entry price, exit price, and simulated profit or loss will be
                logged here for your personal review.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="py-2.5 pl-5 pr-3 font-medium">Asset</th>
                      <th className="px-3 py-2.5 text-right font-medium">Entry → Exit</th>
                      <th className="px-3 py-2.5 text-right font-medium">Realized P&amp;L</th>
                      <th className="py-2.5 pl-3 pr-5 text-right font-medium">Closed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {portfolio.closedTrades.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 pl-5 pr-3 font-semibold text-slate-900">{c.ticker}</td>
                        <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-600">
                          {usd(c.avgEntryPrice)} → {usd(c.exitPrice)}
                        </td>
                        <td
                          className={`px-3 py-3 text-right font-mono font-semibold tabular-nums ${
                            c.realizedPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {c.realizedPnL >= 0 ? '+' : '-'}
                          {usd(Math.abs(c.realizedPnL))} ({c.realizedPnLPct >= 0 ? '+' : ''}
                          {c.realizedPnLPct.toFixed(2)}%)
                        </td>
                        <td className="py-3 pl-3 pr-5 text-right text-slate-400">
                          {new Date(c.closedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <InlineDisclaimer text="Virtual paper trading uses simulated balances saved in your browser. No real brokerage orders are executed and no real money moves." />
        </div>
      </div>
    </div>
  );
};

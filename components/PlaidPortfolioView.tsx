import React, { useState } from 'react';
import { PlaidStatus, PlaidHolding } from '../types';

interface PlaidPortfolioViewProps {
  plaidStatus: PlaidStatus;
  onSync: () => Promise<void>;
  onLinkInstitution: (name: string) => Promise<void>;
  isSyncing: boolean;
}

export const PlaidPortfolioView: React.FC<PlaidPortfolioViewProps> = ({
  plaidStatus,
  onSync,
  onLinkInstitution,
  isSyncing,
}) => {
  const [selectedInstitution, setSelectedInstitution] = useState<string>('Apex Clearing DMA');
  const [isLinking, setIsLinking] = useState<boolean>(false);
  const [linkSuccessMsg, setLinkSuccessMsg] = useState<string | null>(null);

  const totalBalance = plaidStatus.accounts.reduce((acc, a) => acc + (a.currentBalance || 0), 0);
  const totalAvailable = plaidStatus.accounts.reduce((acc, a) => acc + (a.availableBalance || 0), 0);
  const totalHoldingsValue = plaidStatus.holdings.reduce((acc, h) => acc + (h.currentValue || 0), 0);
  const totalUnrealizedPnL = plaidStatus.holdings.reduce((acc, h) => acc + (h.unrealizedPnL || 0), 0);

  const handleLink = async () => {
    setIsLinking(true);
    try {
      await onLinkInstitution(selectedInstitution);
      setLinkSuccessMsg(`Connected successfully to ${selectedInstitution} via Plaid Link.`);
      setTimeout(() => setLinkSuccessMsg(null), 4000);
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Plaid Connection Header */}
      <div className="bg-slate-50 border border-slate-200 p-4 sm:p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Plaid Prime Brokerage Ledger
            </h2>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-normal">
            Direct institutional bank and brokerage ledger via Plaid API. Feeds real-time buying power, collateral escrow, and mark-to-market holdings into the PAL trading agent.
          </p>
        </div>

        <button
          onClick={onSync}
          disabled={isSyncing}
          className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-mono font-bold text-slate-800 transition-all flex items-center justify-center gap-2 shadow-xs w-full md:w-auto whitespace-nowrap shrink-0"
        >
          <span className={`w-2 h-2 rounded-full bg-emerald-500 ${isSyncing ? 'animate-ping' : ''}`}></span>
          {isSyncing ? 'SYNCING LEDGER...' : 'SYNC BALANCES'}
        </button>
      </div>

      {linkSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono text-emerald-800 animate-fade-in">
          ✓ {linkSuccessMsg}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-500 font-mono uppercase font-medium">Total Linked Liquidity</div>
          <div className="text-2xl font-mono font-bold text-slate-900 tracking-tight mt-1">
            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">Across {plaidStatus.accounts.length} linked accounts</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="text-[11px] text-blue-600 font-mono uppercase font-medium">Arbitrage Buying Power</div>
          <div className="text-2xl font-mono font-bold text-blue-600 tracking-tight mt-1">
            ${totalAvailable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">Direct Market Access (DMA) primed</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-500 font-mono uppercase font-medium">Holdings Market Value</div>
          <div className="text-2xl font-mono font-bold text-slate-900 tracking-tight mt-1">
            ${totalHoldingsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">{plaidStatus.holdings.length} Active Positions</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="text-[11px] text-emerald-700 font-mono uppercase font-medium">Total Unrealized P&L</div>
          <div className="text-2xl font-mono font-bold text-emerald-600 tracking-tight mt-1">
            +${totalUnrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-emerald-700 mt-1">Mark-to-market live</div>
        </div>
      </div>

      {/* Main Grid: Linked Accounts & Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Plaid Accounts */}
        <div className="lg:col-span-5 min-w-0 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">
                Linked Plaid Accounts
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">TOKEN: {(plaidStatus.linkToken || 'sandbox').slice(0, 16)}...</span>
            </div>

            <div className="p-4 space-y-3">
              {plaidStatus.accounts.map((acc) => (
                <div key={acc.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-slate-900">{acc.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {acc.institutionName} •••• {acc.mask}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase mt-1 font-mono">
                      {acc.type} ({acc.subtype})
                    </div>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <div className="text-sm font-mono font-bold text-slate-900 tabular-nums">
                      ${acc.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs font-mono text-blue-600 font-semibold tabular-nums">
                      Avail: ${acc.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Plaid Link Switcher */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2.5">
              <div className="text-xs text-slate-600 font-semibold">
                Link Additional Brokerage (Plaid Sandbox / Live)
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedInstitution}
                  onChange={(e) => setSelectedInstitution(e.target.value)}
                  className="bg-white border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2 flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                >
                  <option value="Apex Clearing DMA">Apex Clearing DMA</option>
                  <option value="Interactive Brokers Institutional">Interactive Brokers Institutional</option>
                  <option value="Charles Schwab Prime">Charles Schwab Prime</option>
                  <option value="Goldman Sachs Custody">Goldman Sachs Custody</option>
                </select>
                <button
                  onClick={handleLink}
                  disabled={isLinking}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  {isLinking ? 'Linking...' : '+ Connect'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Holdings Ledger */}
        <div className="lg:col-span-7 min-w-0 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">
                Real-Time Holdings & Position Basis
              </h3>
              <span className="text-[10px] text-emerald-700 font-mono font-semibold">SYNCHRONIZED</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-500 text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">TICKER</th>
                    <th className="p-3.5 text-right">QUANTITY</th>
                    <th className="p-3.5 text-right">COST BASIS</th>
                    <th className="p-3.5 text-right">MARKET PRICE</th>
                    <th className="p-3.5 text-right">TOTAL VALUE</th>
                    <th className="p-3.5 text-right">UNREALIZED P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {plaidStatus.holdings.map((h: PlaidHolding) => (
                    <tr key={h.securityId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-sm">{h.ticker}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px] font-sans">{h.name}</div>
                      </td>
                      <td className="p-3.5 text-right text-slate-700">{h.quantity.toLocaleString()}</td>
                      <td className="p-3.5 text-right text-slate-500">${h.costBasis.toFixed(2)}</td>
                      <td className="p-3.5 text-right text-slate-900 font-bold">${h.closePrice.toFixed(2)}</td>
                      <td className="p-3.5 text-right text-slate-900 font-bold">
                        ${h.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 text-right text-emerald-600 font-bold">
                        +${h.unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        <div className="text-[10px] text-emerald-700">(+{h.unrealizedPnLPct}%)</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

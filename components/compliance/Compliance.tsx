import React, { useEffect, useState } from 'react';
import { ShieldCheck, X, AlertTriangle } from 'lucide-react';

export const SHORT_DISCLOSURE =
  'Educational research only. Not investment advice or a recommendation to buy or sell any security. Investing involves risk, including loss of principal.';

export const FULL_DISCLOSURES: { title: string; body: string }[] = [
  {
    title: 'Not investment advice',
    body:
      'Sentinel Trading provides general financial information and research tools for educational purposes. Nothing on this platform is personalized investment, legal, tax or accounting advice, or an offer or solicitation to buy or sell any security, derivative, futures contract, event contract or digital asset. Sentinel Trading is not a registered broker-dealer, investment adviser or commodity trading advisor.',
  },
  {
    title: 'AI-generated content',
    body:
      'Answers, research ideas and summaries are produced by artificial intelligence using live public feeds and web search. They can be incomplete, out of date or wrong, and may cite sources that do not fully support a statement. Always verify information with the original source and your own research before making any decision.',
  },
  {
    title: 'Hypothetical and simulated results',
    body:
      'Model scores, virtual paper portfolios, growth projections and paper trades are hypothetical. They do not reflect actual trading, do not account for all fees, taxes, slippage or liquidity, and have inherent limitations. Hypothetical performance is not a reliable indicator of future results. Past performance does not guarantee future results.',
  },
  {
    title: 'Risk of loss',
    body:
      'All investing involves risk, including the possible loss of principal. Options, futures, margin, leveraged products, prediction markets and digital assets are complex, can be highly volatile and may result in losses greater than the amount invested. Arbitrage opportunities can disappear quickly and still carry execution, counterparty and regulatory risk.',
  },
  {
    title: 'Market data',
    body:
      'Live market quotes, RSS stories, SEC filings, Treasury rates and prediction market odds are pulled from public third-party APIs and feeds and may be delayed or incomplete. Data is provided "as is" without warranty.',
  },
  {
    title: 'Your decisions',
    body:
      'You are solely responsible for your investment decisions. Consider your objectives, financial situation and risk tolerance, and consult a licensed financial professional before acting on any information.',
  },
];

const ACK_KEY = 'sentinel_risk_ack_v1';

export const recordRiskAcknowledgement = () => {
  try {
    localStorage.setItem(ACK_KEY, new Date().toISOString());
  } catch {
    /* ignore */
  }
};

export const InlineDisclaimer: React.FC<{ className?: string; text?: string }> = ({
  className = '',
  text = SHORT_DISCLOSURE,
}) => (
  <p className={`flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500 ${className}`}>
    <ShieldCheck className="w-3.5 h-3.5 mt-px shrink-0 text-slate-400" aria-hidden="true" />
    <span>{text}</span>
  </p>
);

export const DataModeBadge: React.FC<{ mode?: string; className?: string }> = ({ mode, className = '' }) => {
  const liveAi = mode === 'live' || mode === 'cached-live';
  return (
    <span
      title={
        liveAi
          ? 'Powered by live AI web search + Top-100 financial RSS & public market APIs.'
          : 'Powered by live Top-100 financial RSS feeds, Yahoo Finance quotes, US Treasury & Polymarket APIs.'
      }
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[11px] font-medium ${
        liveAi
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-blue-200 bg-blue-50 text-blue-700'
      } ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${liveAi ? 'bg-emerald-600' : 'bg-blue-600'}`} />
      {liveAi ? 'Live AI + Feeds' : 'Live Market Feeds'}
    </span>
  );
};

export const SimulatedBadge: React.FC<{ label?: string }> = ({ label = 'Paper Mode' }) => (
  <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
    {label}
  </span>
);

export const DisclosuresModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="disclosures-title">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200 sentinel-pop">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur px-6 py-4">
          <h2 id="disclosures-title" className="text-base font-semibold text-slate-900">
            Important disclosures
          </h2>
          <button onClick={onClose} aria-label="Close disclosures" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-5 px-6 py-5">
          {FULL_DISCLOSURES.map((d) => (
            <section key={d.title}>
              <h3 className="text-sm font-semibold text-slate-900">{d.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{d.body}</p>
            </section>
          ))}
          <p className="text-xs text-slate-400">Last updated November 2026.</p>
        </div>
      </div>
    </div>
  );
};

export const RiskAcknowledgementGate: React.FC<{ onOpenDisclosures: () => void }> = ({ onOpenDisclosures }) => {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(ACK_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const accept = () => {
    try {
      localStorage.setItem(ACK_KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="risk-ack-title">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 sentinel-pop">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h2 id="risk-ack-title" className="mt-4 text-lg font-semibold text-slate-900">
          Before you start
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600 leading-relaxed list-disc pl-5 marker:text-slate-300">
          <li>Sentinel is an educational research tool, not a broker or investment adviser.</li>
          <li>AI answers can be wrong. Always check the cited sources.</li>
          <li>Scores, simulations and paper trades are hypothetical and don’t predict future results.</li>
          <li>Investing involves risk, including losing the money you invest.</li>
        </ul>
        <label className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
          />
          <span className="text-sm text-slate-700">
            I understand and agree to the{' '}
            <button type="button" onClick={onOpenDisclosures} className="font-medium text-blue-700 underline underline-offset-2">
              disclosures
            </button>
            .
          </span>
        </label>
        <button
          type="button"
          disabled={!checked}
          onClick={accept}
          className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

/** Interactive dollar-sized confirmation dialog for virtual paper trades. */
export const PaperTradeConfirm: React.FC<{
  trade: { ticker: string; name?: string; action: string; entryPrice?: number } | null;
  availableCash: number;
  onCancel: () => void;
  onConfirm: (dollarAmount: number) => void;
}> = ({ trade, availableCash, onCancel, onConfirm }) => {
  const defaultAmount = Math.max(10, Math.min(availableCash, Math.round(availableCash * 0.1) || 50));
  const [amountInput, setAmountInput] = useState<string>(String(defaultAmount));

  useEffect(() => {
    if (trade) {
      const suggested = Math.max(
        10,
        Math.min(availableCash, availableCash >= 500 ? Math.round(availableCash * 0.1) : Math.round(availableCash * 0.25))
      );
      setAmountInput(String(Number(suggested.toFixed(2))));
    }
  }, [trade, availableCash]);

  if (!trade) return null;

  const refPrice = trade.entryPrice && trade.entryPrice > 0 ? trade.entryPrice : 100;
  const parsedAmount = Number(amountInput) || 0;
  const estShares = parsedAmount > 0 ? parsedAmount / refPrice : 0;
  const remainingCash = availableCash - parsedAmount;
  const isInvalid = parsedAmount <= 0 || parsedAmount > availableCash;

  const quickAmounts = [
    { label: '$25', value: 25 },
    { label: '$50', value: 50 },
    { label: '$100', value: 100 },
    { label: '10%', value: Number((availableCash * 0.1).toFixed(2)) },
    { label: '25%', value: Number((availableCash * 0.25).toFixed(2)) },
  ].filter((q) => q.value > 0 && q.value <= availableCash);

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="paper-title">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 sentinel-pop">
        <div className="flex items-center justify-between">
          <SimulatedBadge label="Virtual Paper Trade" />
          <span className="font-mono text-xs text-slate-500 tabular-nums">
            Cash available: <strong className="text-slate-900">${availableCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </span>
        </div>

        <h2 id="paper-title" className="mt-3 text-lg font-semibold text-slate-900">
          Paper {trade.action} {trade.ticker}
        </h2>
        {trade.name && <p className="text-xs text-slate-500">{trade.name}</p>}

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">How much virtual cash do you want to allocate?</span>
            <div className="mt-1.5 flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-600">
              <span className="font-mono text-sm text-slate-400">$</span>
              <input
                type="number"
                min={1}
                step="any"
                max={availableCash}
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full bg-transparent pl-1.5 font-mono text-base font-semibold text-slate-900 focus:outline-none tabular-nums"
              />
            </div>
          </label>

          {quickAmounts.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {quickAmounts.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => setAmountInput(String(q.value))}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 space-y-1 border-t border-slate-200 pt-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Reference price</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">${refPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated shares / units</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">{estShares.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span>Virtual cash left after trade</span>
              <span className={`font-mono font-semibold tabular-nums ${remainingCash < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                ${Math.max(0, remainingCash).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {parsedAmount > availableCash && (
          <p className="mt-2.5 text-xs font-medium text-red-600">
            Not enough virtual cash. Lower the amount or adjust your starting budget in the Portfolio tab.
          </p>
        )}

        <InlineDisclaimer className="mt-4" text="Simulated paper trade using virtual cash. No real order is placed and no real money moves." />

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isInvalid}
            onClick={() => onConfirm(parsedAmount)}
            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Confirm paper trade
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { ShieldCheck, X, AlertTriangle } from 'lucide-react';

// Shared compliance UI: disclosures, risk acknowledgement and labels.
// Copy follows common SEC/FINRA expectations for financial content:
// clear "not advice" framing, hypothetical-performance warnings,
// AI-accuracy warnings and data-delay notices.

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
      'Answers, research ideas and summaries are produced by artificial intelligence. They can be incomplete, out of date or wrong, and may cite sources that do not fully support a statement. Always verify information with the original source and your own research before making any decision.',
  },
  {
    title: 'Hypothetical and simulated results',
    body:
      'Model scores, simulated portfolios, growth projections and paper trades are hypothetical. They do not reflect actual trading, do not account for all fees, taxes, slippage or liquidity, and have inherent limitations. Hypothetical performance is not a reliable indicator of future results. Past performance does not guarantee future results.',
  },
  {
    title: 'Risk of loss',
    body:
      'All investing involves risk, including the possible loss of principal. Options, futures, margin, leveraged products, prediction markets and digital assets are complex, can be highly volatile and may result in losses greater than the amount invested. Arbitrage opportunities can disappear quickly and still carry execution, counterparty and regulatory risk.',
  },
  {
    title: 'Market data',
    body:
      'Market data, news and prices may be delayed, estimated or sample data, and are provided "as is" without warranty. Demo mode uses illustrative data that does not reflect live markets.',
  },
  {
    title: 'Your decisions',
    body:
      'You are solely responsible for your investment decisions. Consider your objectives, financial situation and risk tolerance, and consult a licensed financial professional before acting on any information.',
  },
];

const ACK_KEY = 'sentinel_risk_ack_v1';

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
  const live = mode === 'live' || mode === 'cached-live';
  return (
    <span
      title={
        live
          ? 'Generated with live AI web search. Verify figures with the original sources.'
          : 'Illustrative sample data. Not live market data.'
      }
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
        live
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-amber-200 bg-amber-50 text-amber-800'
      } ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
      {live ? 'Live AI research' : 'Demo data'}
    </span>
  );
};

export const SimulatedBadge: React.FC<{ label?: string }> = ({ label = 'Simulated' }) => (
  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
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

/**
 * One-time risk acknowledgement shown on first visit. Users must confirm they
 * understand the platform is educational before using research features.
 */
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
          <li>Scores, simulations and paper trades are hypothetical and don't predict future results.</li>
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

/** Confirmation dialog shown before any simulated (paper) order. */
export const PaperTradeConfirm: React.FC<{
  trade: { ticker: string; name?: string; action: string; entryPrice?: number } | null;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ trade, onCancel, onConfirm }) => {
  if (!trade) return null;
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="paper-title">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 sentinel-pop">
        <SimulatedBadge label="Paper trade" />
        <h2 id="paper-title" className="mt-3 text-lg font-semibold text-slate-900">
          Add {trade.ticker} to your paper portfolio?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          This records a <strong>simulated</strong> {trade.action.toLowerCase()} idea
          {trade.entryPrice ? ` at a reference price of $${trade.entryPrice.toFixed(2)}` : ''} so you can track
          how it would have performed. No real order is placed and no money moves.
        </p>
        <InlineDisclaimer className="mt-4" />
        <div className="mt-5 flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
            Add paper trade
          </button>
        </div>
      </div>
    </div>
  );
};

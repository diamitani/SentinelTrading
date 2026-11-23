import React from 'react';

interface MarketingHeroProps {
  onLaunchTerminal: () => void;
  onOpenAuth: () => void;
  isAuthenticated: boolean;
  userEmail?: string;
}

export const MarketingHero: React.FC<MarketingHeroProps> = ({
  onLaunchTerminal,
  onOpenAuth,
  isAuthenticated,
  userEmail,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 py-12 md:py-20 animate-fade-in relative overflow-hidden">
      {/* Subtle structural grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Top Micro-Trust Indicator */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono text-slate-500 mb-5 sm:mb-6">
          <span>ROSTR / PAL Runtime</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>100 Daily Arbitrage Signals</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Plaid Prime Margin Direct</span>
        </div>

        {/* Main Pitch */}
        <div className="max-w-4xl space-y-5 sm:space-y-6">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] text-balance">
            The world’s premier personal{' '}
            <span className="text-blue-600">quantitative trading algorithm</span>.
          </h1>

          <p className="text-base sm:text-xl text-slate-600 leading-relaxed font-normal max-w-3xl">
            Input your proprietary investment thesis through our 10-step PAL intake compiler. AlphaSentience scans 200+ global intelligence nodes, synthesizes 100 daily cross-venue arbitrage tickets, and triggers One-Must-Act position scale multipliers directly through your Plaid margin accounts.
          </p>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              onClick={onLaunchTerminal}
              className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>Launch 100-Trade Terminal</span>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            {!isAuthenticated ? (
              <button
                onClick={onOpenAuth}
                className="py-3 px-6 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg font-semibold text-sm transition-all whitespace-nowrap text-center"
              >
                Sign In / Join Institutional Tier
              </button>
            ) : (
              <div className="text-xs font-mono text-slate-600 flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2.5 bg-slate-100 rounded-lg truncate">
                <span className="truncate">Active Member: {userEmail}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3-Pillar Institutional Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 border-t border-slate-100 mt-16">
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider">
              01 / PAL Intake Thesis
            </div>
            <h3 className="text-lg font-bold text-slate-900">10-Step Compiler Engine</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Transforms natural language thesis notes into strict <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-xs font-mono text-slate-800">master.md</code> manifests, inductive hypotheses, and 3-tier RAG credibility checks.
            </p>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="text-xs font-mono text-emerald-600 font-bold uppercase tracking-wider">
              02 / 100 Daily Trades
            </div>
            <h3 className="text-lg font-bold text-slate-900">Quantitative Arbitrage</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Real-time cross-venue scanning across cash equities, dual-listed ADRs, options box spreads, and index futures with dynamic scale sizing up to 4.5x.
            </p>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="text-xs font-mono text-indigo-600 font-bold uppercase tracking-wider">
              03 / Plaid API Prime Ledger
            </div>
            <h3 className="text-lg font-bold text-slate-900">Live Margin Synchronizer</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Direct connection to Apex Clearing, Morgan Stanley Wealth, and institutional custody. Tracks buying power, mark-to-market holdings, and settlement basis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

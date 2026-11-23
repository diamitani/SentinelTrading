import React, { useState, useEffect, useRef } from 'react';
import { fetchMarketAnalysis, submitPalThesis, fetchPlaidStatus, syncPlaidHoldings, linkPlaidInstitution } from './services/geminiService';
import { getStoredUser, signOutUser, UserProfile } from './services/authService';
import { MarketReport, AppView, PlaidStatus } from './types';
import { LoadingScreen } from './components/LoadingScreen';
import { Dashboard } from './components/Dashboard';
import { Arbitrage100Grid } from './components/Arbitrage100Grid';
import { OmnichannelHypothesisView } from './components/OmnichannelHypothesisView';
import { GrowthSimulatorView } from './components/GrowthSimulatorView';
import { BackendQaView } from './components/BackendQaView';
import { PalRuntimeView } from './components/PalRuntimeView';
import { PlaidPortfolioView } from './components/PlaidPortfolioView';
import { AnalysisView } from './components/AnalysisView';
import { ChatAssistant } from './components/ChatAssistant';
import { NewsTicker } from './components/NewsTicker';
import { MarketingHero } from './components/MarketingHero';
import { AuthModal } from './components/AuthModal';

const PRIMARY_NAV_ITEMS: { id: AppView; label: string }[] = [
  { id: AppView.DASHBOARD, label: 'Overview' },
  { id: AppView.ARBITRAGE_100, label: '100 Trades' },
  { id: AppView.OMNICHANNEL_HYPOTHESIS, label: 'Omnichannel' },
  { id: AppView.GROWTH_10X, label: '10x Growth' },
  { id: AppView.PAL_RUNTIME, label: 'PAL Thesis' },
];

const SECONDARY_NAV_ITEMS: { id: AppView; label: string; description: string }[] = [
  { id: AppView.PLAID_PORTFOLIO, label: 'Plaid Ledger', description: 'Prime brokerage balances & holdings' },
  { id: AppView.ANALYSIS, label: 'Market Intel', description: 'Geopolitics, news wires & sentiment' },
  { id: AppView.BACKEND_QA, label: 'Backend QA', description: 'Security, RLS & runtime verification' },
];

const ALL_NAV_ITEMS: { id: AppView; label: string }[] = [
  ...PRIMARY_NAV_ITEMS,
  ...SECONDARY_NAV_ITEMS.map(({ id, label }) => ({ id, label })),
];

const App: React.FC = () => {
  const [report, setReport] = useState<MarketReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [error, setError] = useState<string | null>(null);
  const [isCompilingThesis, setIsCompilingThesis] = useState<boolean>(false);
  const [plaidStatus, setPlaidStatus] = useState<PlaidStatus | null>(null);
  const [isSyncingPlaid, setIsSyncingPlaid] = useState<boolean>(false);
  const [executionBanner, setExecutionBanner] = useState<string | null>(null);

  // Navigation responsiveness state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navigateTo = (targetView: AppView) => {
    setView(targetView);
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
    }

    const loadData = async () => {
      try {
        const [marketData, plaidData] = await Promise.all([
          fetchMarketAnalysis(),
          fetchPlaidStatus().catch(() => null),
        ]);
        setReport(marketData);
        if (plaidData) setPlaidStatus(plaidData);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError('Failed to initialize Trading Core. Please check API configuration.');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleThesisSubmit = async (
    prompt: string,
    links: string[],
    riskTolerance: string,
    capitalBudget: number
  ) => {
    setIsCompilingThesis(true);
    try {
      const palSession = await submitPalThesis(prompt, links, riskTolerance, capitalBudget);
      const updatedReport = await fetchMarketAnalysis(prompt, links);
      setReport({
        ...updatedReport,
        palSession,
      });
      setExecutionBanner(`Thesis successfully compiled across 10 PAL stages! Synthesized 100 fresh arbitrage opportunities.`);
      setTimeout(() => setExecutionBanner(null), 5000);
      setView(AppView.ARBITRAGE_100);
    } catch (e: any) {
      console.error(e);
      setExecutionBanner('Thesis intake notice: ' + (e?.message || 'Unable to re-compile thesis.'));
      setTimeout(() => setExecutionBanner(null), 5000);
    } finally {
      setIsCompilingThesis(false);
    }
  };

  const handleSyncPlaid = async () => {
    setIsSyncingPlaid(true);
    try {
      const updated = await syncPlaidHoldings();
      setPlaidStatus(updated);
      setExecutionBanner('Plaid institutional ledger and margin buying power synchronized in real time.');
      setTimeout(() => setExecutionBanner(null), 4000);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsSyncingPlaid(false);
    }
  };

  const handleLinkPlaid = async (name: string) => {
    const updated = await linkPlaidInstitution(name);
    setPlaidStatus(updated);
  };

  const handleExecuteTrade = (trade: any, scale: number) => {
    setExecutionBanner(
      `ORDER ROUTED: ${trade.action} ${trade.ticker} [${scale}x Scale] across ${trade.primaryVenue} ⇄ ${trade.hedgeVenue}. Projected Spread: +${trade.arbitrageSpreadPct}%.`
    );
    setTimeout(() => setExecutionBanner(null), 6000);
  };

  const handleSignOut = () => {
    signOutUser();
    setCurrentUser(null);
    setExecutionBanner('Signed out of trading session.');
    setTimeout(() => setExecutionBanner(null), 3000);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="h-screen w-full bg-slate-50 flex items-center justify-center text-slate-800 font-sans">
        <div className="text-center p-8 border border-slate-200 bg-white rounded-2xl max-w-md shadow-lg">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h1 className="text-xl font-bold mb-2 text-slate-900">System Initialization Notice</h1>
          <p className="text-xs text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Reconnect Terminal
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const isSecondaryActive = SECONDARY_NAV_ITEMS.some((item) => item.id === view);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      {/* Responsive Top Navigation Bar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 lg:gap-8">
          {/* Zone 1: Brand Lockup */}
          <button
            type="button"
            onClick={() => navigateTo(AppView.DASHBOARD)}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-mono font-bold text-base shrink-0">
              α
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Alpha<span className="text-blue-600">Sentience</span>
            </span>
          </button>

          {/* Zone 2: Desktop Navigation (Clean Single-Line Links + Workspace Dropdown) */}
          <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-6">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`py-2 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    active
                      ? 'border-blue-600 text-slate-900 font-semibold'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Secondary Workspace Tools Dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen((prev) => !prev)}
                aria-expanded={moreMenuOpen}
                aria-haspopup="menu"
                className={`py-2 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isSecondaryActive
                    ? 'border-blue-600 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span>Ledger &amp; QA</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${moreMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {moreMenuOpen && (
                <div
                  role="menu"
                  className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50"
                >
                  {SECONDARY_NAV_ITEMS.map((item) => {
                    const active = view === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="menuitem"
                        onClick={() => navigateTo(item.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                          active ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="text-xs font-semibold">{item.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.description}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Zone 3: Account Action & Mobile Menu Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="text-right max-w-[140px]">
                  <div className="text-xs font-semibold text-slate-900 truncate">{currentUser.fullName}</div>
                  <div className="text-[11px] text-slate-500 truncate">{currentUser.tier}</div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </button>
            )}

            {/* Mobile / Tablet Menu Button (< lg) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Slide-Down Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-lg">
            <div className="max-w-7xl mx-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {ALL_NAV_ITEMS.map((item) => {
                  const active = view === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigateTo(item.id)}
                      className={`min-h-[44px] px-3.5 py-2.5 rounded-lg text-left text-sm font-medium flex items-center justify-between transition-colors ${
                        active
                          ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                          : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <span>{item.label}</span>
                      {active && <span className="text-xs font-mono text-blue-600">Active</span>}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Auth Footer inside Drawer */}
              <div className="sm:hidden pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                {currentUser ? (
                  <>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">{currentUser.fullName}</div>
                      <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="min-h-[40px] px-3.5 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 whitespace-nowrap shrink-0"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full min-h-[44px] py-2.5 px-4 bg-slate-900 text-white rounded-lg text-sm font-semibold"
                  >
                    Sign In / Institutional Access
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Execution Feedback Notification */}
      {executionBanner && (
        <div className="bg-blue-50 border-b border-blue-200 py-2.5 px-4 text-center text-xs font-mono font-medium text-blue-900 flex items-center justify-center gap-2 z-30">
          {executionBanner}
        </div>
      )}

      {/* Running Headline Ticker */}
      <NewsTicker news={report.newsFeed} />

      {/* Hero Section (Visible on Dashboard to anchor marketing value proposition) */}
      {view === AppView.DASHBOARD && (
        <MarketingHero
          onLaunchTerminal={() => navigateTo(AppView.ARBITRAGE_100)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          isAuthenticated={Boolean(currentUser)}
          userEmail={currentUser?.email}
        />
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-grow w-full relative">
        {view === AppView.DASHBOARD && (
          <Dashboard
            report={report}
            onNavigateTo100Trades={() => navigateTo(AppView.ARBITRAGE_100)}
            onNavigateToPal={() => navigateTo(AppView.PAL_RUNTIME)}
            onNavigateToPlaid={() => navigateTo(AppView.PLAID_PORTFOLIO)}
          />
        )}
        {view === AppView.ARBITRAGE_100 && (
          <Arbitrage100Grid
            recommendations={report.recommendations}
            onExecuteTrade={handleExecuteTrade}
          />
        )}
        {view === AppView.OMNICHANNEL_HYPOTHESIS && (
          <OmnichannelHypothesisView
            nodes={report.omnichannelNodes}
            chains={report.secondOrderChains}
            onDeployHypothesis={async (customPrompt) => {
              await handleThesisSubmit(customPrompt, [], 'Aggressive-Alpha', 19800000);
            }}
            isDeploying={isCompilingThesis}
          />
        )}
        {view === AppView.GROWTH_10X && (
          <GrowthSimulatorView
            onDeployToArbitrage={() => setView(AppView.ARBITRAGE_100)}
          />
        )}
        {view === AppView.BACKEND_QA && (
          <BackendQaView />
        )}
        {view === AppView.PAL_RUNTIME && (
          <PalRuntimeView
            palSession={report.palSession}
            onSubmitThesis={handleThesisSubmit}
            isCompiling={isCompilingThesis}
          />
        )}
        {view === AppView.PLAID_PORTFOLIO && (
          <PlaidPortfolioView
            plaidStatus={
              plaidStatus || {
                connected: true,
                institution: 'Apex Clearing Prime',
                accounts: [],
                holdings: [],
                lastSynced: new Date().toISOString(),
                linkToken: 'sandbox',
                mockMode: true,
              }
            }
            onSync={handleSyncPlaid}
            onLinkInstitution={handleLinkPlaid}
            isSyncing={isSyncingPlaid}
          />
        )}
        {view === AppView.ANALYSIS && <AnalysisView report={report} />}
      </main>

      {/* Tactical Bloomberg-Style Chat Assistant */}
      <ChatAssistant report={report} />

      {/* Auth Modal Drawer */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setExecutionBanner(`Authenticated as ${user.fullName} (${user.tier}). Session locked.`);
          setTimeout(() => setExecutionBanner(null), 5000);
        }}
      />

      {/* Responsive Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 text-xs text-slate-500 font-sans py-6 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold text-slate-800">AlphaSentience</span>
            <span aria-hidden="true">·</span>
            <span>100 Daily Arbitrage Signals</span>
            <span aria-hidden="true">·</span>
            <span>Plaid Prime Brokerage Ledger</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500">
            <button type="button" onClick={() => navigateTo(AppView.DASHBOARD)} className="hover:text-slate-900 transition-colors">
              Overview
            </button>
            <button type="button" onClick={() => navigateTo(AppView.ARBITRAGE_100)} className="hover:text-slate-900 transition-colors">
              100 Trades
            </button>
            <button type="button" onClick={() => navigateTo(AppView.GROWTH_10X)} className="hover:text-slate-900 transition-colors">
              10x Growth
            </button>
            <button type="button" onClick={() => navigateTo(AppView.BACKEND_QA)} className="hover:text-slate-900 transition-colors">
              Security &amp; QA
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
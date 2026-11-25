import React, { useState, useEffect, useRef } from 'react';
import {
  fetchMarketAnalysis,
  submitPalThesis,
  executeRostrHarness,
} from '../services/geminiService';
import { UserProfile, updateProfileBudget } from '../services/authService';
import {
  PaperPortfolioState,
  loadPaperPortfolio,
  savePaperPortfolio,
  placePaperTrade,
  closePaperPosition,
  simulatePriceRefresh,
  resetPaperBudget,
  linkConsumerBroker,
  computePortfolioSummary,
} from '../services/paperPortfolioService';
import { WelcomeCard } from './WelcomeCard';
import {
  MarketReport,
  AppView,
  HypothesisWizardConfig,
} from '../types';
import { LoadingScreen } from './LoadingScreen';
import { Dashboard } from './Dashboard';
import { Arbitrage100Grid } from './Arbitrage100Grid';
import { OmnichannelHypothesisView } from './OmnichannelHypothesisView';
import { GrowthSimulatorView } from './GrowthSimulatorView';
import { BackendQaView } from './BackendQaView';
import { PalRuntimeView } from './PalRuntimeView';
import { PlaidPortfolioView } from './PlaidPortfolioView';
import { AnalysisView } from './AnalysisView';
import { ChatAssistant } from './ChatAssistant';
import { NewsTicker } from './NewsTicker';
import { HypothesisWizardModal } from './HypothesisWizardModal';
import { AgentSandboxComposioView } from './AgentSandboxComposioView';
import { ResearchView } from './ResearchView';
import { useResearch } from './research/useResearch';
import { ResearchFocus } from '../services/answerEngine';
import {
  DisclosuresModal,
  RiskAcknowledgementGate,
  PaperTradeConfirm,
  SHORT_DISCLOSURE,
} from './compliance/Compliance';

const PRIMARY_NAV_ITEMS: { id: AppView; label: string }[] = [
  { id: AppView.DASHBOARD, label: 'Overview' },
  { id: AppView.RESEARCH, label: 'Ask Sentinel' },
  { id: AppView.OMNICHANNEL_HYPOTHESIS, label: 'Live Feeds (100)' },
  { id: AppView.ARBITRAGE_100, label: 'Research Ideas' },
  { id: AppView.PLAID_PORTFOLIO, label: 'Paper Portfolio' },
];

const SECONDARY_NAV_ITEMS: { id: AppView; label: string; description: string }[] = [
  {
    id: AppView.PAL_RUNTIME,
    label: 'Strategy Studio',
    description: '11 downloadable Markdown research guides & checklist',
  },
  {
    id: AppView.GROWTH_10X,
    label: 'Growth Simulator',
    description: 'Compound savings & monthly contribution calculator',
  },
  {
    id: AppView.ANALYSIS,
    label: 'Market Intel',
    description: 'Macro risks, breaking news & sector sentiment',
  },
  {
    id: AppView.AGENT_SANDBOX,
    label: 'Agent Sandbox',
    description: 'Test research skills & connected feeds',
  },
  {
    id: AppView.BACKEND_QA,
    label: 'Security & QA',
    description: 'Data security & system checks',
  },
];

const ALL_NAV_ITEMS: { id: AppView; label: string }[] = [
  ...PRIMARY_NAV_ITEMS,
  ...SECONDARY_NAV_ITEMS.map(({ id, label }) => ({ id, label })),
];

interface AppShellProps {
  user: UserProfile;
  onSignOut: () => void;
  onOpenUpgrade: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ user, onSignOut, onOpenUpgrade }) => {
  const [report, setReport] = useState<MarketReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [error, setError] = useState<string | null>(null);
  const [isCompilingThesis, setIsCompilingThesis] = useState<boolean>(false);
  const [executionBanner, setExecutionBanner] = useState<string | null>(null);

  // Real persistent virtual paper portfolio per user/guest
  const [paperPortfolio, setPaperPortfolio] = useState<PaperPortfolioState>(() =>
    loadPaperPortfolio(user.id, user.startingBudget || 1000)
  );

  useEffect(() => {
    setPaperPortfolio(loadPaperPortfolio(user.id, user.startingBudget || 1000));
  }, [user.id, user.startingBudget]);

  // Strategy Wizard Modal state
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);

  // Navigation responsiveness state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Shared live research engine (Ask Sentinel page + floating assistant)
  const research = useResearch();
  const [pendingQuery, setPendingQuery] = useState<{ query: string; focus: ResearchFocus } | null>(null);
  const [disclosuresOpen, setDisclosuresOpen] = useState(false);
  const [paperTrade, setPaperTrade] = useState<any | null>(null);

  const showToast = (msg: string, ms = 5000) => {
    setExecutionBanner(msg);
    setTimeout(() => setExecutionBanner((prev) => (prev === msg ? null : prev)), ms);
  };

  const askSentinel = (query: string, focus: ResearchFocus = 'all') => {
    setPendingQuery({ query, focus });
    navigateTo(AppView.RESEARCH);
  };

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
    const loadData = async () => {
      try {
        const marketData = await fetchMarketAnalysis();
        setReport(marketData);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError('We could not load live market feeds. Please check your connection and try again.');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleWizardSubmit = async (wizardConfig: HypothesisWizardConfig) => {
    setIsCompilingThesis(true);
    try {
      const res = await executeRostrHarness(wizardConfig);
      if (report) {
        setReport({
          ...report,
          rostrRun: res.rostrRun,
          palSession: res.palSession,
          wizardConfig: res.wizardConfig,
          recommendations: res.recommendations,
          secondOrderChains: res.secondOrderChains,
          omnichannelNodes: res.omnichannelNodes,
          lastUpdated: new Date().toLocaleTimeString(),
        });
      }
      showToast(`Research preferences updated: ${wizardConfig.philosophy} · ${wizardConfig.holdingHorizon}.`);
    } catch (e: any) {
      showToast('Could not update preferences: ' + (e?.message || 'please try again.'));
    } finally {
      setIsCompilingThesis(false);
    }
  };

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
      showToast('Research thesis updated across your guides and live ideas.');
    } catch (e: any) {
      console.error(e);
      showToast('Notice: ' + (e?.message || 'Unable to refresh thesis.'));
    } finally {
      setIsCompilingThesis(false);
    }
  };

  const handleSelectBudget = (amount: number) => {
    const next = resetPaperBudget(paperPortfolio, amount, true);
    savePaperPortfolio(user.id, next);
    updateProfileBudget(user, amount);
    setPaperPortfolio(next);
    showToast(`Virtual paper portfolio set to $${amount.toLocaleString()}.`);
  };

  const handleRefreshPaperPrices = () => {
    const next = simulatePriceRefresh(paperPortfolio);
    savePaperPortfolio(user.id, next);
    setPaperPortfolio(next);
    showToast('Paper portfolio prices updated.');
  };

  const handleClosePaperPosition = (positionId: string) => {
    const { nextState, closedTrade } = closePaperPosition(paperPortfolio, positionId);
    if (!closedTrade) {
      showToast('Could not close position.');
      return;
    }
    savePaperPortfolio(user.id, nextState);
    setPaperPortfolio(nextState);
    const sign = closedTrade.realizedPnL >= 0 ? '+' : '-';
    showToast(
      `Closed paper ${closedTrade.ticker} (${sign}$${Math.abs(closedTrade.realizedPnL).toFixed(2)} simulated P&L). Virtual cash updated.`
    );
  };

  const handleLinkConsumerBroker = (brokerName: string) => {
    const next = linkConsumerBroker(paperPortfolio, brokerName);
    savePaperPortfolio(user.id, next);
    setPaperPortfolio(next);
    showToast(`Active broker tracker switched to ${brokerName}.`);
  };

  const handleExecuteTrade = (trade: any, _scale?: number) => {
    setPaperTrade(trade);
  };

  const confirmPaperTrade = (dollarAmount: number) => {
    if (!paperTrade) return;
    const price = Number(paperTrade.entryPrice) > 0 ? Number(paperTrade.entryPrice) : 100;
    try {
      const next = placePaperTrade(
        paperPortfolio,
        {
          ticker: paperTrade.ticker,
          name: paperTrade.name || paperTrade.ticker,
          action: paperTrade.action || 'BUY',
          entryPrice: price,
        },
        dollarAmount
      );
      savePaperPortfolio(user.id, next);
      setPaperPortfolio(next);
      const shares = (dollarAmount / price).toFixed(3);
      showToast(
        `Paper ${paperTrade.action || 'BUY'} saved: $${dollarAmount.toLocaleString()} of ${paperTrade.ticker} (~${shares} units at $${price.toFixed(2)}). Cash left: $${next.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`
      );
      setPaperTrade(null);
    } catch (err: any) {
      showToast(err?.message || 'Unable to place paper trade.');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="h-screen w-full bg-[#FAFAF9] flex items-center justify-center text-slate-800 font-sans">
        <div className="text-center p-8 border border-slate-200 bg-white rounded-2xl max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h1 className="text-xl font-bold mb-2 text-slate-900">Something went wrong</h1>
          <p className="text-xs text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const isSecondaryActive = SECONDARY_NAV_ITEMS.some((item) => item.id === view);
  const summary = computePortfolioSummary(paperPortfolio);

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      {/* 3-Zone Top Navigation Bar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 lg:gap-6">
          {/* Zone 1: Clean 1-Line Brand Lockup */}
          <button
            type="button"
            onClick={() => navigateTo(AppView.DASHBOARD)}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <span className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-mono font-bold text-sm shrink-0">
              S
            </span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Sentinel<span className="text-blue-600 font-semibold"> · Trading</span>
            </span>
          </button>

          {/* Zone 2: Desktop Navigation */}
          <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-5">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`py-2 text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    active
                      ? 'border-blue-600 text-slate-900 font-semibold'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Tools & Data Dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen((prev) => !prev)}
                aria-expanded={moreMenuOpen}
                aria-haspopup="menu"
                className={`py-2 text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isSecondaryActive
                    ? 'border-blue-600 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span>Tools &amp; Data</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    moreMenuOpen ? 'rotate-180' : ''
                  }`}
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

          {/* Zone 3: Strategy Wizard + Guest/User Account Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsWizardOpen(true)}
              className="hidden sm:inline-flex items-center px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors whitespace-nowrap"
            >
              Strategy Wizard
            </button>

            {user.isGuest ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo(AppView.PLAID_PORTFOLIO)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 font-mono text-xs font-semibold text-slate-700 hover:bg-slate-100 tabular-nums"
                  title="Your virtual paper portfolio value"
                >
                  ${summary.totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </button>
                <button
                  type="button"
                  onClick={onOpenUpgrade}
                  className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
                >
                  Save progress
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <div className="text-right max-w-[140px]">
                  <div className="text-xs font-semibold text-slate-900 truncate">{user.fullName}</div>
                  <div className="font-mono text-[10px] font-semibold text-blue-700 tabular-nums">
                    ${summary.totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })} paper
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="px-2.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                >
                  Log out
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
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

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-lg">
            <div className="max-w-7xl mx-auto space-y-4">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsWizardOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 text-white text-xs font-bold text-center"
              >
                Open Strategy Wizard
              </button>

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

              <div className="sm:hidden pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {user.isGuest ? 'Guest Session' : user.fullName}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                    Paper balance: ${summary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                {user.isGuest ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenUpgrade();
                    }}
                    className="min-h-[40px] px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 whitespace-nowrap shrink-0"
                  >
                    Save progress
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSignOut();
                    }}
                    className="min-h-[40px] px-3.5 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 whitespace-nowrap shrink-0"
                  >
                    Log out
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Execution Feedback Toast */}
      {executionBanner && (
        <div
          className="fixed top-20 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 sentinel-pop"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm text-slate-700 shadow-lg backdrop-blur">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
            <span className="flex-1">{executionBanner}</span>
            <button onClick={() => setExecutionBanner(null)} aria-label="Dismiss" className="text-slate-400 hover:text-slate-700">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Live Headline Ticker */}
      <NewsTicker news={report.newsFeed} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-grow w-full relative">
        {view === AppView.DASHBOARD && (
          <WelcomeCard
            user={user}
            startingBudget={paperPortfolio.startingBudget}
            onSelectBudget={handleSelectBudget}
            onOpenUpgrade={onOpenUpgrade}
            onAsk={(q) => askSentinel(q)}
            onOpenIdeas={() => navigateTo(AppView.ARBITRAGE_100)}
            onOpenSimulator={() => navigateTo(AppView.GROWTH_10X)}
          />
        )}
        {view === AppView.DASHBOARD && (
          <Dashboard
            report={report}
            paperPortfolio={paperPortfolio}
            onRefreshPaperPrices={handleRefreshPaperPrices}
            onClosePosition={handleClosePaperPosition}
            onOpenWizard={() => setIsWizardOpen(true)}
            onNavigateTo100Trades={() => navigateTo(AppView.ARBITRAGE_100)}
            onNavigateToPlaid={() => navigateTo(AppView.PLAID_PORTFOLIO)}
            onNavigateToFeeds={() => navigateTo(AppView.OMNICHANNEL_HYPOTHESIS)}
            onAsk={askSentinel}
            onPaperTrade={(t) => handleExecuteTrade(t)}
            onOpenDisclosures={() => setDisclosuresOpen(true)}
          />
        )}
        {view === AppView.RESEARCH && (
          <ResearchView
            research={research}
            pendingQuery={pendingQuery}
            onPendingConsumed={() => setPendingQuery(null)}
          />
        )}
        {view === AppView.ARBITRAGE_100 && (
          <Arbitrage100Grid
            recommendations={report.recommendations}
            onExecuteTrade={handleExecuteTrade}
            onOpenWizard={() => setIsWizardOpen(true)}
          />
        )}
        {view === AppView.AGENT_SANDBOX && (
          <AgentSandboxComposioView
            report={report}
            onOpenWizard={() => setIsWizardOpen(true)}
          />
        )}
        {view === AppView.OMNICHANNEL_HYPOTHESIS && (
          <OmnichannelHypothesisView
            nodes={report.omnichannelNodes}
            chains={report.secondOrderChains}
            onAsk={askSentinel}
            onDeployHypothesis={async (customPrompt) => {
              await handleThesisSubmit(customPrompt, [], 'Balanced-Arbitrage', paperPortfolio.startingBudget);
            }}
            isDeploying={isCompilingThesis}
          />
        )}
        {view === AppView.GROWTH_10X && (
          <GrowthSimulatorView onDeployToArbitrage={() => setView(AppView.ARBITRAGE_100)} />
        )}
        {view === AppView.BACKEND_QA && <BackendQaView />}
        {view === AppView.PAL_RUNTIME && (
          <PalRuntimeView
            palSession={report.palSession}
            rostrRun={report.rostrRun}
            onSubmitThesis={handleThesisSubmit}
            onOpenWizard={() => setIsWizardOpen(true)}
            isCompiling={isCompilingThesis}
          />
        )}
        {view === AppView.PLAID_PORTFOLIO && (
          <PlaidPortfolioView
            portfolio={paperPortfolio}
            onSelectBudget={handleSelectBudget}
            onRefreshPrices={handleRefreshPaperPrices}
            onClosePosition={handleClosePaperPosition}
            onLinkBroker={handleLinkConsumerBroker}
            onBrowseIdeas={() => navigateTo(AppView.ARBITRAGE_100)}
          />
        )}
        {view === AppView.ANALYSIS && <AnalysisView report={report} />}
      </main>

      {/* Floating research assistant (hidden on the full Ask Sentinel page) */}
      {view !== AppView.RESEARCH && (
        <ChatAssistant research={research} onOpenFull={() => navigateTo(AppView.RESEARCH)} />
      )}

      <PaperTradeConfirm
        trade={paperTrade}
        availableCash={paperPortfolio.cashBalance}
        onCancel={() => setPaperTrade(null)}
        onConfirm={confirmPaperTrade}
      />
      <DisclosuresModal isOpen={disclosuresOpen} onClose={() => setDisclosuresOpen(false)} />
      <RiskAcknowledgementGate onOpenDisclosures={() => setDisclosuresOpen(true)} />

      {/* Strategy Wizard Modal */}
      <HypothesisWizardModal
        isOpen={isWizardOpen}
        initialConfig={{
          ...(report.wizardConfig || {
            hypothesisPrompt: '',
            philosophy: 'Second-Order Commodity Ripples',
            goalTarget: '+10% Target',
            targetReturnPct: 10,
            holdingHorizon: 'Weekly',
            assetClasses: ['Equities', 'Commodities'],
            capitalAllocated: paperPortfolio.startingBudget,
            maxDrawdownPct: 2,
            autoOptimizeWholeness: true,
          }),
          capitalAllocated: paperPortfolio.startingBudget,
        }}
        onClose={() => setIsWizardOpen(false)}
        onSubmit={handleWizardSubmit}
      />

      {/* Footer with regulatory disclosures */}
      <footer className="mt-auto border-t border-slate-200 bg-white px-4 py-8 text-xs text-slate-500 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 font-mono text-xs font-bold text-white">
                S
              </span>
              <span className="text-sm font-semibold text-slate-900">Sentinel Trading</span>
              <span className="text-slate-400">· Know. Believe. Buy. Research the present.</span>
            </div>
            <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <button type="button" onClick={() => navigateTo(AppView.DASHBOARD)} className="hover:text-slate-900">
                Overview
              </button>
              <button type="button" onClick={() => navigateTo(AppView.RESEARCH)} className="hover:text-slate-900">
                Ask Sentinel
              </button>
              <button type="button" onClick={() => navigateTo(AppView.OMNICHANNEL_HYPOTHESIS)} className="hover:text-slate-900">
                Live Feeds (100)
              </button>
              <button type="button" onClick={() => navigateTo(AppView.PLAID_PORTFOLIO)} className="hover:text-slate-900">
                Paper Portfolio
              </button>
              <button
                type="button"
                onClick={() => setDisclosuresOpen(true)}
                className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
              >
                Disclosures
              </button>
            </nav>
          </div>
          <p className="max-w-4xl leading-relaxed text-slate-500">
            {SHORT_DISCLOSURE} Sentinel Trading is not a registered broker-dealer, investment adviser or commodity
            trading advisor. AI-generated content may be inaccurate. Paper trades and simulations are hypothetical and
            do not reflect actual trading.
          </p>
          <p className="text-slate-400">© {new Date().getFullYear()} Sentinel Trading. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  fetchMarketAnalysis,
  submitPalThesis,
  fetchPlaidStatus,
  syncPlaidHoldings,
  linkPlaidInstitution,
  executeRostrHarness,
} from '../services/geminiService';
import { UserProfile } from '../services/authService';
import { getPlan } from '../config/plans';
import { WelcomeCard } from './WelcomeCard';
import { AiKeyModal } from './AiKeyModal';
import { getAiKey, onAiKeyChange } from '../services/aiKeyService';
import {
  MarketReport,
  AppView,
  PlaidStatus,
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
  { id: AppView.ARBITRAGE_100, label: 'Research Ideas' },
  { id: AppView.PAL_RUNTIME, label: 'Strategy Studio' },
  { id: AppView.GROWTH_10X, label: 'Growth Simulator' },
];

const SECONDARY_NAV_ITEMS: { id: AppView; label: string; description: string }[] = [
  {
    id: AppView.AGENT_SANDBOX,
    label: 'Agent Sandbox',
    description: 'Run research skills & integrations',
  },
  {
    id: AppView.OMNICHANNEL_HYPOTHESIS,
    label: 'Signal Feeds',
    description: 'News, social & prediction-market signals',
  },
  {
    id: AppView.PLAID_PORTFOLIO,
    label: 'Portfolio',
    description: 'Linked account balances & holdings',
  },
  {
    id: AppView.ANALYSIS,
    label: 'Market Intel',
    description: 'Geopolitics, news wires & sentiment',
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
}

export const AppShell: React.FC<AppShellProps> = ({ user, onSignOut }) => {
  const plan = getPlan(user.plan);

  // Bring-your-own-key AI: each user adds their own Gemini key (stored only in their browser).
  const [isAiKeyModalOpen, setIsAiKeyModalOpen] = useState(false);
  const [hasAiKey, setHasAiKey] = useState<boolean>(Boolean(getAiKey()));
  useEffect(() => onAiKeyChange(() => setHasAiKey(Boolean(getAiKey()))), []);
  const [report, setReport] = useState<MarketReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [error, setError] = useState<string | null>(null);
  const [isCompilingThesis, setIsCompilingThesis] = useState<boolean>(false);
  const [plaidStatus, setPlaidStatus] = useState<PlaidStatus | null>(null);
  const [isSyncingPlaid, setIsSyncingPlaid] = useState<boolean>(false);
  const [executionBanner, setExecutionBanner] = useState<string | null>(null);

  // Hypothesis, Trading Philosophy & Goals Wizard Modal state
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);

  // Navigation responsiveness state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Shared research engine (full Ask page + floating assistant)
  const research = useResearch();
  const [pendingQuery, setPendingQuery] = useState<{ query: string; focus: ResearchFocus } | null>(null);
  const [disclosuresOpen, setDisclosuresOpen] = useState(false);
  const [paperTrade, setPaperTrade] = useState<any | null>(null);

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
        const [marketData, plaidData] = await Promise.all([
          fetchMarketAnalysis(),
          fetchPlaidStatus().catch(() => null),
        ]);
        setReport(marketData);
        if (plaidData) setPlaidStatus(plaidData);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError('We could not load market data. Please check your connection and try again.');
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
      setExecutionBanner(
        `Research preferences saved: ${wizardConfig.philosophy} · ${wizardConfig.holdingHorizon}. Ideas have been refreshed.`
      );
      setTimeout(() => setExecutionBanner(null), 6500);
    } catch (e: any) {
      setExecutionBanner(
        'Could not update preferences: ' + (e?.message || 'please try again.')
      );
      setTimeout(() => setExecutionBanner(null), 5000);
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
      setExecutionBanner(
        `Thesis analyzed. Research artifacts and ideas have been refreshed.`
      );
      setTimeout(() => setExecutionBanner(null), 5000);
    } catch (e: any) {
      console.error(e);
      setExecutionBanner(
        'Thesis intake notice: ' + (e?.message || 'Unable to re-compile thesis.')
      );
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
      setExecutionBanner(
        'Portfolio balances refreshed.'
      );
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

  // No real orders are ever placed. "Trade" actions open a confirmation for a
  // simulated (paper) position so users can track ideas without risking money.
  const handleExecuteTrade = (trade: any, _scale?: number) => {
    setPaperTrade(trade);
  };

  const confirmPaperTrade = () => {
    if (!paperTrade) return;
    setExecutionBanner(
      `Paper trade added: ${paperTrade.ticker}${
        paperTrade.entryPrice ? ` at reference price $${Number(paperTrade.entryPrice).toFixed(2)}` : ''
      }. Simulated only. No real order was placed.`
    );
    setPaperTrade(null);
    setTimeout(() => setExecutionBanner(null), 5000);
  };

  const handleSignOut = () => {
    onSignOut();
  };

  // After the key is added/removed, reload the analysis so the dashboard switches modes.
  const refreshAfterKeyChange = () => {
    fetchMarketAnalysis()
      .then((fresh) => setReport(fresh))
      .catch((err) => console.error(err));
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

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      {/* Responsive Top Navigation Bar */}
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

            {/* Secondary Workspace Tools Dropdown */}
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
                <span>Ledger &amp; QA</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    moreMenuOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
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

          {/* Zone 3: Hypothesis Wizard Button, Account Action & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsWizardOpen(true)}
              className="hidden sm:inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shadow-xs"
            >
              ✦ Strategy Wizard
            </button>

            <button
              type="button"
              onClick={() => setIsAiKeyModalOpen(true)}
              title={hasAiKey ? 'Live AI is running on your own Gemini key' : 'Add your Gemini key to turn on live AI'}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                hasAiKey
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${hasAiKey ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              {hasAiKey ? 'AI: your key' : 'AI key'}
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <div className="text-right max-w-[150px]">
                <div className="text-xs font-semibold text-slate-900 truncate">{user.fullName}</div>
                <div className="text-[10px] font-semibold text-blue-700 truncate">{plan.name} plan</div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-2.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                Log out
              </button>
            </div>

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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Slide-Down Navigation Drawer */}
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
                ✦ Open Strategy Wizard
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

              {/* Mobile Auth Footer inside Drawer */}
              <div className="sm:hidden pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 truncate">{user.fullName}</div>
                  <div className="text-[11px] text-slate-500 truncate">{plan.name} plan · {user.email}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="min-h-[40px] px-3.5 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Execution Feedback Notification */}
      {executionBanner && (
        <div className="fixed top-20 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 sentinel-pop" role="status" aria-live="polite">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm text-slate-700 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.35)] backdrop-blur">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
            <span className="flex-1">{executionBanner}</span>
            <button onClick={() => setExecutionBanner(null)} aria-label="Dismiss" className="text-slate-400 hover:text-slate-700">✕</button>
          </div>
        </div>
      )}

      {/* AI status notice (sample data / key problems) */}
      {report.aiNotice && (
        <div
          role="status"
          className="bg-amber-50 border-b border-amber-200 py-2 px-4 text-center text-xs text-amber-900 flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
        >
          <span>{report.aiNotice}</span>
          <button type="button" onClick={() => setIsAiKeyModalOpen(true)} className="font-semibold underline hover:text-amber-950">
            {hasAiKey ? 'Check my key' : 'Add my key'}
          </button>
        </div>
      )}

      {/* Running Headline Ticker */}
      <NewsTicker news={report.newsFeed} />

      {/* Main Content Area */}
      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-grow w-full relative"
      >
        {view === AppView.DASHBOARD && (
          <WelcomeCard
            user={user}
            onAsk={(q) => askSentinel(q)}
            onOpenIdeas={() => navigateTo(AppView.ARBITRAGE_100)}
            onOpenSimulator={() => navigateTo(AppView.GROWTH_10X)}
          />
        )}
        {view === AppView.DASHBOARD && (
          <Dashboard
            report={report}
            plaidStatus={plaidStatus}
            onSyncPlaid={handleSyncPlaid}
            onOpenWizard={() => setIsWizardOpen(true)}
            onNavigateTo100Trades={() => navigateTo(AppView.ARBITRAGE_100)}
            onNavigateToPlaid={() => navigateTo(AppView.PLAID_PORTFOLIO)}
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
            onDeployHypothesis={async (customPrompt) => {
              await handleThesisSubmit(customPrompt, [], 'Aggressive-Alpha', 19800000);
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

      {/* Floating research assistant (hidden on the full research page) */}
      {view !== AppView.RESEARCH && (
        <ChatAssistant research={research} onOpenFull={() => navigateTo(AppView.RESEARCH)} />
      )}

      <PaperTradeConfirm trade={paperTrade} onCancel={() => setPaperTrade(null)} onConfirm={confirmPaperTrade} />
      <DisclosuresModal isOpen={disclosuresOpen} onClose={() => setDisclosuresOpen(false)} />
      <AiKeyModal isOpen={isAiKeyModalOpen} onClose={() => setIsAiKeyModalOpen(false)} onChanged={refreshAfterKeyChange} />
      <RiskAcknowledgementGate onOpenDisclosures={() => setDisclosuresOpen(true)} />

      {/* 4-Step Hypothesis, Trading Philosophy & Goals Wizard Modal */}
      <HypothesisWizardModal
        isOpen={isWizardOpen}
        initialConfig={report.wizardConfig}
        onClose={() => setIsWizardOpen(false)}
        onSubmit={handleWizardSubmit}
      />

      {/* Footer with regulatory disclosures */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-50/80 px-4 py-8 text-xs text-slate-500 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 font-mono text-xs font-bold text-white">S</span>
              <span className="text-sm font-semibold text-slate-900">Sentinel Trading</span>
              <span className="text-slate-400">· Research the present. Plan your future.</span>
            </div>
            <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <button type="button" onClick={() => navigateTo(AppView.DASHBOARD)} className="hover:text-slate-900">Overview</button>
              <button type="button" onClick={() => navigateTo(AppView.RESEARCH)} className="hover:text-slate-900">Ask Sentinel</button>
              <button type="button" onClick={() => navigateTo(AppView.BACKEND_QA)} className="hover:text-slate-900">Security</button>
              <button type="button" onClick={() => setDisclosuresOpen(true)} className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900">Disclosures</button>
            </nav>
          </div>
          <p className="max-w-4xl leading-relaxed text-slate-500">
            {SHORT_DISCLOSURE} Sentinel Trading is not a registered broker-dealer, investment adviser or commodity
            trading advisor. AI-generated content may be inaccurate. Model scores, simulations and paper trades are
            hypothetical and do not reflect actual trading; past or hypothetical performance does not guarantee future
            results. Market data may be delayed or illustrative.
          </p>
          <p className="text-slate-400">© {new Date().getFullYear()} Sentinel Trading. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};


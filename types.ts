export interface TradeRecommendation {
  ticker: string;
  name: string;
  action: 'BUY' | 'SELL' | 'CALL' | 'PUT';
  entryPrice?: number;
  confidence: number; // 0-100
  reasoning: string;
  horizon: 'Intraday' | 'Swing' | 'Long-term';
  // Advanced Quant & Arbitrage Properties
  arbitrageType?: 'Cross-Exchange' | 'Statistical' | 'Triangular' | 'Dual-Listing' | 'Options Box/Conversion' | 'Cash-and-Carry' | 'Index Basis' | 'None';
  arbitrageSpreadPct?: number;
  primaryVenue?: string;
  hedgeVenue?: string;
  oneMustActUrgency?: 'CRITICAL_IMMEDIATE' | 'HIGH_MOMENTUM' | 'MODERATE_OPPORTUNITY';
  positionScaleMultiple?: number;
  riskRewardRatio?: number;
  expectedAlphaBps?: number;
  thesisStage?: 'PreD' | 'Design' | 'Development' | 'Deployment' | 'Live';
  palAdjudicationScore?: number;
  // Multi-Node Hypothesis Grounding Link
  hypothesisSourceStream?: string; // e.g. "X (Twitter) Firehose", "Reddit r/WallStreetBets", "Google Trends", "EDGAR SEC 13F"
  commoditySecondOrderImpact?: string; // e.g. "Aluminium Futures (ALI=F) Spike", "Rare Earth Metals (REMX)", "Lithium Carbonate"
}

export interface MarketTrend {
  topic: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export interface MacroMetric {
  name: string;
  value: string;
  trend: 'UP' | 'DOWN' | 'FLAT';
}

export interface SectorPerformance {
  sector: string;
  performance: number;
}

export interface PoliticalRisk {
  region: string;
  event: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impact: string;
  situationAnalysis: string;
}

export interface GeopoliticalUpdate {
  headline: string;
  summary: string;
  source: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface NewsItem {
  headline: string;
  source: string;
  url: string;
  publishedAt: string;
  sentimentScore?: number;
  channel?: 'News Wire' | 'X/Twitter' | 'Reddit' | 'Google Trends' | 'Quora/Forums' | 'Regulatory';
}

export interface PortfolioStrategy {
  sectorRotation: string;
  riskManagement: string;
  suggestedAllocation: {
    cash: number;
    equity: number;
    crypto: number;
    derivatives: number;
  };
}

export interface SentimentBreakdown {
  newsSentiment: number;
  socialSentiment: number;
  politicalImpact: number;
  volatility: number;
}

// Multi-Feed Omnichannel Ingest Types
export interface OmnichannelStreamNode {
  id: string;
  channel: 'X / Twitter' | 'Reddit WallStreetBets' | 'Google Trends' | 'Quora & Tech Forums' | 'News Wires (Bloomberg/Reuters)' | 'Facebook / Meta Groups' | 'SEC EDGAR Filings';
  activeSignalsCount: number;
  velocityScore: number; // 0-100
  sampleSignal: string;
  sentimentBias: 'BULLISH' | 'BEARISH' | 'DISLOCATION';
  lastPing: string;
}

export interface SecondOrderCommodityChain {
  primaryEvent: string; // e.g. "New Pepsi initiative to surge can volume"
  derivedHypothesis: string; // e.g. "High surge in beverage can packaging demand"
  impactedCommodity: string; // e.g. "Aluminium Futures (ALI=F) & Packaging Equities"
  recommendedContract: string; // e.g. "CME Aluminum Long Call $2,700 / Ball Corp (BALL) Buy"
  expectedSpreadExpansion: string;
  confidence: number;
}

export interface PalStageResult {
  step: number;
  name: string;
  row: 'Ingest' | 'Understand' | 'Build and deliver' | 'Feedback';
  status: 'pending' | 'running' | 'completed' | 'verified';
  summary: string;
  durationMs: number;
  outputArtifact?: string;
  details?: any;
}

export interface PalThesisSession {
  id: string;
  createdAt: string;
  rawInputs: {
    prompt: string;
    links: string[];
    fileNames: string[];
    riskTolerance: 'Aggressive-Alpha' | 'Balanced-Arbitrage' | 'Capital-Preservation';
    capitalBudget: number;
    targetOpportunities: number;
    selectedFeeds?: string[];
  };
  stages: {
    intake: { status: string; summary: string };
    compile: { masterMd: string; summary: string };
    store: { databaseTable: string; fileBucket: string };
    extract: {
      wants: string;
      goal: string;
      deliverables: string[];
      constraints: string[];
      missing_info: string[];
    };
    assess: {
      hypothesis: string;
      inductiveReasoning: string;
      expectedSharpe: number;
      secondOrderChains?: SecondOrderCommodityChain[];
    };
    enhance: {
      sourcesConsulted: number;
      tier1Count: number;
      tier2Count: number;
      tier3Count: number;
      credibilityScore: number;
      findings: string[];
    };
    plan: {
      masterSystemPrompt: string;
      guardrails: string[];
      executionProtocol: string;
    };
    build: {
      toolInvocations: string[];
      tradesSynthesized: number;
    };
    test: {
      palScore: number;
      verdict: 'PASS' | 'WARN' | 'BLOCK';
      findings: string[];
    };
    submit: {
      deliveredTo: string[];
      totalArbitrageOpportunities: number;
      maxScaleMultiplier: number;
    };
  };
}

export interface PlaidAccount {
  id: string;
  name: string;
  officialName?: string;
  type: 'investment' | 'depository' | 'credit';
  subtype: string;
  mask: string;
  currentBalance: number;
  availableBalance: number;
  currency: string;
  institutionName: string;
}

export interface PlaidHolding {
  securityId: string;
  ticker: string;
  name: string;
  closePrice: number;
  quantity: number;
  costBasis: number;
  currentValue: number;
  institutionValue: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
}

export interface PlaidStatus {
  connected: boolean;
  institution: string;
  accounts: PlaidAccount[];
  holdings: PlaidHolding[];
  lastSynced: string;
  linkToken?: string;
  mockMode: boolean;
}

export interface MarketReport {
  overallSentimentScore: number;
  sentimentBreakdown: SentimentBreakdown;
  socialSentimentSummary: string;
  institutionalFlow: string;
  macroMetrics: MacroMetric[];
  sectorPerformance: SectorPerformance[];
  politicalRisks: PoliticalRisk[];
  geopoliticalUpdates: GeopoliticalUpdate[];
  keyTrends: MarketTrend[];
  recommendations: TradeRecommendation[];
  portfolioStrategy: PortfolioStrategy;
  newsFeed: NewsItem[];
  sources: { title: string; uri: string }[];
  lastUpdated: string;
  computationTime: string;
  palSession?: PalThesisSession;
  totalArbitrageTradesCount?: number;
  criticalUrgencyTradesCount?: number;
  averageArbitrageSpreadPct?: number;
  // Multi-Feed Omnichannel Signals
  omnichannelNodes?: OmnichannelStreamNode[];
  secondOrderChains?: SecondOrderCommodityChain[];
  aiMode?: 'live' | 'cached-live' | 'quant-synthesis';
  aiNotice?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// Growth Engine: $100 to $1,000+ (10x Compounder for 1,000,000 everyday traders)
export interface CompoundMilestone {
  month: number;
  startingCapital: number;
  monthlyArbitrageGainPct: number;
  monthlyAddition: number;
  endingCapital: number;
  tradesExecuted: number;
  winRatePct: number;
  maxDrawdownPct: number;
  riskGuardrailsActive: string;
}

export interface GrowthPlanConfig {
  initialCapital: number; // e.g. $100
  monthlyContribution: number; // e.g. $25 - $100
  targetMultiplier: number; // e.g. 10x
  timeframeMonths: number; // e.g. 12 months
  riskProfile: 'Conservative-Compound' | 'Balanced-Spread' | 'Aggressive-Alpha';
}

// JEV / PAL Backend QA Audit Engine
export interface QaFinding {
  id: string;
  category: 'SECRETS' | 'AUTH' | 'DATABASE_RLS' | 'UNBOUNDED_QUERY' | 'API_CONTRACT' | 'PAYMENT_RAILS';
  title: string;
  fileLocation: string;
  riskProbability: number; // 0.0 - 1.0
  severityScore: number; // 0 - 10
  fixOwner: 'builder' | 'security' | 'database_lead';
  isFalsePositive: boolean;
  status: 'RESOLVED_VERIFIED' | 'PASS' | 'WARN' | 'BLOCK';
  remedyDescription: string;
}

export interface QaAuditReport {
  timestamp: string;
  commitHash: string;
  totalChecksCount: number;
  cleanChecksCount: number;
  findings: QaFinding[];
  calibratedVerdict: 'PASS' | 'WARN' | 'BLOCK';
  verdictSummary: string;
  palBatteryResults: {
    realRiskVerified: boolean;
    zeroSecretsConfirmed: boolean;
    rlsPoliciesEnforced: boolean;
    routeInputValidationClean: boolean;
  };
  certifiedSafeToShip: boolean;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ARBITRAGE_100 = 'ARBITRAGE_100',
  OMNICHANNEL_HYPOTHESIS = 'OMNICHANNEL_HYPOTHESIS',
  GROWTH_10X = 'GROWTH_10X',
  BACKEND_QA = 'BACKEND_QA',
  PAL_RUNTIME = 'PAL_RUNTIME',
  PLAID_PORTFOLIO = 'PLAID_PORTFOLIO',
  ANALYSIS = 'ANALYSIS',
}
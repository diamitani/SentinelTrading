export type GoalHorizonTag = '3-Day Profit' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Hold 1 Year';

export type TradingPhilosophyType =
  | 'Statistical Arbitrage'
  | 'Second-Order Commodity Ripples'
  | 'Prediction & Betting Markets'
  | 'Asymmetric Options Skew'
  | 'Long-Term Enterprise Compound';

export type MarketCategoryType =
  | 'Equities'
  | 'Commodities'
  | 'Options'
  | 'Prediction Markets'
  | 'Crypto Basis';

export interface HypothesisWizardConfig {
  hypothesisPrompt: string;
  philosophy: TradingPhilosophyType;
  goalTarget: '+10% Target' | '+25% Swing' | '2x-5x Macro' | '10x Annual Compound';
  targetReturnPct: number;
  holdingHorizon: GoalHorizonTag;
  assetClasses: MarketCategoryType[];
  capitalAllocated: number;
  maxDrawdownPct: number;
  autoOptimizeWholeness: boolean;
}

export interface TradeRecommendation {
  ticker: string;
  name: string;
  action: 'BUY' | 'SELL' | 'CALL' | 'PUT';
  entryPrice?: number;
  confidence: number; // 0-100
  reasoning: string;
  horizon: 'Intraday' | 'Swing' | 'Long-term';
  // Advanced Quant & Arbitrage Properties
  arbitrageType?: 'Cross-Exchange' | 'Statistical' | 'Triangular' | 'Dual-Listing' | 'Options Box/Conversion' | 'Cash-and-Carry' | 'Index Basis' | 'Prediction Event Spread' | 'None';
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
  hypothesisSourceStream?: string;
  commoditySecondOrderImpact?: string;
  // Wizard Philosophy, Horizon & Prediction Market Fields
  goalHorizonTag?: GoalHorizonTag;
  targetReturnPct?: number;
  marketCategory?: MarketCategoryType;
  predictionOddsSpread?: string;
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
  channel?: 'News Wire' | 'X/Twitter' | 'Reddit' | 'Google Trends' | 'Quora/Forums' | 'Regulatory' | 'Prediction Markets';
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
  channel: 'X / Twitter' | 'Reddit WallStreetBets' | 'Google Trends' | 'Quora & Tech Forums' | 'News Wires (Bloomberg/Reuters)' | 'Facebook / Meta Groups' | 'SEC EDGAR Filings' | 'Polymarket & Kalshi Odds';
  activeSignalsCount: number;
  velocityScore: number; // 0-100
  sampleSignal: string;
  sentimentBias: 'BULLISH' | 'BEARISH' | 'DISLOCATION';
  lastPing: string;
}

export interface SecondOrderCommodityChain {
  primaryEvent: string;
  derivedHypothesis: string;
  impactedCommodity: string;
  recommendedContract: string;
  expectedSpreadExpansion: string;
  confidence: number;
  horizonTag?: GoalHorizonTag;
  targetGain?: string;
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

// ============================================================================
// ROSTR AUTONOMOUS AGENT OS TYPES (Wholeness, DAG Waves, Diagrid, Truth, POP)
// ============================================================================

export interface RostrCriterion {
  id: string;
  name: string;
  description: string;
  satisfied: boolean;
  autoEnrichedByRostr: boolean;
  extractedValue: string;
}

export interface RostrFoundationWholeness {
  rawScoreW: number; // 0.0 to 1.0
  guidedScoreW: number; // 1.00 when auto-guided
  formulaLatex: string;
  criteria: RostrCriterion[];
  multipliers: { id: string; name: string; factor: number }[];
  effectiveOutputValueV: number; // V(W, M) = W * prod(M_j)
  status: 'COMPLETE_FOUNDATION_100' | 'HALTED_INCOMPLETE';
  guidanceSummary: string;
}

export interface DagWaveNode {
  id: string;
  name: string;
  wave: number;
  dependencies: string[];
  preconditionLabel: string;
  preconditionPassed: boolean;
  status: 'EXECUTED_PARALLEL' | 'SHORT_CIRCUITED_PRUNED';
  sequentialBaselineMs: number;
  compressedExecutionMs: number;
  outputSummary: string;
}

export interface DagWaveExecution {
  sequentialBaselineMs: number;
  compressedTotalMs: number;
  compressionRatio: string;
  latencyCollapsePct: string;
  watchdogThresholdMs: number;
  watchdogTriggered: boolean;
  shortCircuitedNodesCount: number;
  waves: {
    waveIndex: number;
    title: string;
    durationMs: number;
    nodes: DagWaveNode[];
  }[];
}

export interface CalibratedTruthEntity {
  entityType: 'EMAIL' | 'VENUE_OR_ADDRESS' | 'CALENDAR_DATE' | 'ROYALTY_OR_MARGIN_SPLIT';
  rawValue: string;
  verified: boolean;
  verificationSource: string;
}

export interface CalibratedTruthAssessment {
  creativeWarmthActive: boolean;
  creativeContextSummary: string;
  operationalEntitiesChecked: number;
  entities: CalibratedTruthEntity[];
  noticeBanner: string;
  truthScore: number;
}

export interface DiagridVirtualActor {
  actorId: string;
  workflowName: string;
  state: 'ACTIVE_COMPUTING' | 'ZERO_COMPUTE_SLEEP' | 'AWAITING_HUMAN_APPROVAL' | 'RESUMED_APPROVED';
  cpuAllocationPct: number;
  tokenBurnRatePerHr: number;
  suspendedAt?: string;
  resumedAt?: string;
  pendingApprovalReason: string;
  durableStorageNamespace: string;
  lastEventPayload?: string;
}

export interface RostrSkillDefinition {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  inputs: string[];
  outputs: string[];
  executionLatencyMs: number;
}

export interface RostrSubAgent {
  id: string;
  name: string;
  role: string;
  model: string;
  activeSkills: string[];
  status: 'READY' | 'EXECUTING' | 'SUSPENDED';
}

export interface RostrAgentManifest {
  agentName: string;
  version: string;
  soulStatement: string;
  primaryModel: string;
  subAgents: RostrSubAgent[];
  skills: RostrSkillDefinition[];
  mcpServers: string[];
}

export interface PopArtifact {
  code: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K';
  fileName: string;
  title: string;
  purpose: string;
  wordCount: number;
  content: string;
}

export interface RostrHarnessRun {
  runId: string;
  createdAt: string;
  wizardConfig: HypothesisWizardConfig;
  wholeness: RostrFoundationWholeness;
  dagCompression: DagWaveExecution;
  diagridActor: DiagridVirtualActor;
  calibratedTruth: CalibratedTruthAssessment;
  manifest: RostrAgentManifest;
  popArtifacts: PopArtifact[];
}

export interface SandboxExecutionResult {
  runId: string;
  skillId: string;
  inputPayload: string;
  status: 'SUCCESS' | 'ERROR';
  executionTimeMs: number;
  logs: string[];
  outputMarkdown: string;
  truthVerified: boolean;
}

export interface ComposioIntegration {
  id: string;
  name: string;
  category: string;
  status: 'CONNECTED' | 'DISCONNECTED';
  authProtocol: string;
  description: string;
  actions: string[];
  lastSynced: string;
  lastExecutionReceipt?: string;
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
  rostrRun?: RostrHarnessRun;
  wizardConfig?: HypothesisWizardConfig;
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
  id?: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  toolCalls?: string[];
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
  initialCapital: number;
  monthlyContribution: number;
  targetMultiplier: number;
  timeframeMonths: number;
  riskProfile: 'Conservative-Compound' | 'Balanced-Spread' | 'Aggressive-Alpha';
}

// JEV / PAL Backend QA Audit Engine
export interface QaFinding {
  id: string;
  category: 'SECRETS' | 'AUTH' | 'DATABASE_RLS' | 'UNBOUNDED_QUERY' | 'API_CONTRACT' | 'PAYMENT_RAILS';
  title: string;
  fileLocation: string;
  riskProbability: number;
  severityScore: number;
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
  RESEARCH = 'RESEARCH',
  ARBITRAGE_100 = 'ARBITRAGE_100',
  PAL_RUNTIME = 'PAL_RUNTIME',
  AGENT_SANDBOX = 'AGENT_SANDBOX',
  OMNICHANNEL_HYPOTHESIS = 'OMNICHANNEL_HYPOTHESIS',
  GROWTH_10X = 'GROWTH_10X',
  PLAID_PORTFOLIO = 'PLAID_PORTFOLIO',
  ANALYSIS = 'ANALYSIS',
  BACKEND_QA = 'BACKEND_QA',
}
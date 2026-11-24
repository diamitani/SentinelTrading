// ============================================================================
// ROSTR research engine: shared types.
//
//   PAL     Prompt Abstraction Layer       understand + sharpen the question
//   NPAO    Navigate/Prioritize/Allocate/Orchestrate   plan the research
//   RAG DAL Dynamic Acquisition Layer      multi-pass, credibility-scored search
//   Hub     Reference hub                  persistent semantic knowledge base
//
// Spec: public/assets/aistudio/ROSTR_Research_Paper_*.md (sections 4-7).
// Files in api/_lib are helpers, not Vercel functions (underscore = private).
// ============================================================================

export type SubTopicKind = 'definition' | 'risk' | 'core' | 'extension';
export type NpaoCategory = 'necessity' | 'anxiety' | 'priority' | 'opportunity';
export type Phase = 'PreD' | 'Design' | 'Development' | 'Deployment' | 'Debugging';
export type Tier = 1 | 2 | 3;

export interface SubTopic {
  id: string; // "t1", "t2" ...
  question: string;
  kind: SubTopicKind;
}

/** PAL Stage 1 output (paper §4.2). */
export interface Intent {
  primary_intent: string;
  domain: 'stocks' | 'etfs' | 'macro' | 'commodities' | 'crypto' | 'prediction-markets' | 'filings' | 'education' | 'personal-finance' | 'other';
  subject: string;
  tickers: string[];
  constraints: string[];
  desired_output: string;
  urgency: 'immediate' | 'queued' | 'scheduled';
  ambiguity_score: number; // 0..1
  time_sensitive: boolean;
  sub_topics: SubTopic[];
  source: 'model' | 'rules';
}

/** PAL Stage 4 output: the runtime manifest the researcher runs under. */
export interface RuntimeManifest {
  agent_type: 'researcher';
  model: string;
  temperature: number;
  tools_enabled: { allow: string[]; deny: string[] };
  memory: { mode: 'session' | 'persistent'; retrieve_strategy: 'vector_similarity' };
  completion_criteria: string[];
  escalation_policy: 'auto-proceed' | 'require-approval';
  output: { format: 'markdown'; verification: 'compliance-review' };
}

/** PAL Stage 5 output. */
export interface Route {
  phase: Phase;
  agent_type: 'researcher';
  trigger_ragdal: boolean;
  reason: string;
}

export interface NpaoTask {
  id: string;
  question: string;
  category: NpaoCategory;
  phase: Phase;
  scores: { phase_urgency: number; dependency_impact: number; business_impact: number; resource_efficiency: number };
  priority: number; // composite, 0..10
  queue: 'immediate' | 'normal' | 'async';
  doer: string;
  blocked_by: string[];
  gated: boolean; // Opportunity waits for the whole (W = 1)
}

export interface NpaoPlan {
  tasks: NpaoTask[]; // already sorted N -> A -> P -> O, then score
  pattern: string;
  weights: { phase_urgency: number; dependency_impact: number; business_impact: number; resource_efficiency: number };
  thresholds: { immediate: number; async: number };
}

export interface ResearchSource {
  id: number; // global citation number [n]
  title: string;
  url: string;
  domain: string;
  tier: Tier;
  credibility: number;
  tierLabel: string;
  snippet?: string;
  subTopics: string[];
  fromHub?: boolean;
}

export interface TopicCoverage {
  id: string;
  question: string;
  category: NpaoCategory;
  findings: string; // synthesized text with [n] citations
  sourceIds: number[];
  confidence: number; // 0..1
  breakdown: { sources: number; consistency: number; tier: number; recency: number };
  status: 'verified' | 'uncertain' | 'open' | 'reused' | 'deferred';
  passes: number;
  note?: string;
}

export interface RagDalReport {
  passes_run: number;
  overall_confidence: number; // 0..1
  threshold: number;
  topics: TopicCoverage[];
  open_questions: string[];
  gaps: string[];
  tier_mix: { tier1: number; tier2: number; tier3: number };
  elapsed_ms: number;
}

/** A finding saved to / loaded from the Hub knowledge base. */
export interface HubEntry {
  id?: string;
  query_origin: string;
  topic: string;
  summary: string;
  sources: { title: string; url: string; domain: string; tier: Tier; credibility: number }[];
  confidence: number;
  verification_status: 'verified' | 'uncertain';
  time_sensitive: boolean;
  created_at?: string;
  similarity?: number;
}

/** Events streamed to the browser. */
export type Emit = (payload: Record<string, unknown>) => void;

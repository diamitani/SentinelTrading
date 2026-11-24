// ============================================================================
// NPAO: Navigate, Prioritize, Allocate, Orchestrate (paper §6, npao skill).
// Each research sub-question is a task.
//   Navigate:   category from the sub-question's role; phase = PreD (research)
//                 definition -> Necessity  (basics block everything else)
//                 risk       -> Anxiety    (uncertainty that degrades the answer)
//                 core       -> Priority   (the mission)
//                 extension  -> Opportunity (growth; waits until W = 1)
//   Prioritize: Priority = urgency*w1 + dependency*w2 + impact*w3 + efficiency*w4
//               using Pat's default weights 0.40 / 0.25 / 0.25 / 0.10.
//   Allocate:   each task gets a doer (knowledge base if already known,
//               otherwise a RAG DAL researcher).
//   Orchestrate: parallel fan-out per pass, fan-in synthesis.
// ============================================================================
import type { Intent, NpaoCategory, NpaoPlan, NpaoTask, SubTopic, SubTopicKind } from './types.js';

export const WEIGHTS = { phase_urgency: 0.4, dependency_impact: 0.25, business_impact: 0.25, resource_efficiency: 0.1 };
export const THRESHOLDS = { immediate: 7.0, async: 3.0 };

const CATEGORY_OF: Record<SubTopicKind, NpaoCategory> = {
  definition: 'necessity',
  risk: 'anxiety',
  core: 'priority',
  extension: 'opportunity',
};
const CATEGORY_ORDER: NpaoCategory[] = ['necessity', 'anxiety', 'priority', 'opportunity'];

function dependencyScore(blocked: number): number {
  if (blocked <= 0) return 0;
  if (blocked <= 2) return 3;
  if (blocked <= 5) return 6;
  return 10;
}

export function plan(intent: Intent, reusedTopicIds: Set<string>): NpaoPlan {
  const subs: SubTopic[] = intent.sub_topics;
  const necessityIds = subs.filter((s) => s.kind === 'definition').map((s) => s.id);

  const tasks: NpaoTask[] = subs.map((s) => {
    const category = CATEGORY_OF[s.kind];
    // PreD base 2, +3 when a deadline-like signal exists (here: time-sensitive data).
    const phase_urgency = 2 + (intent.time_sensitive ? 3 : 0);
    // Basics unblock every other sub-question.
    const blocks = category === 'necessity' ? subs.length - necessityIds.length : 0;
    const dependency_impact = dependencyScore(blocks);
    // Business impact rubric: user experience 6-8; nice-to-have 0-2.
    const business_impact = category === 'priority' ? 8 : category === 'anxiety' ? 7 : category === 'necessity' ? 6 : 2;
    // Value per hour: known answer = instant (10); timeless basics fast (10); current data 1-4h equivalent (7).
    const resource_efficiency = reusedTopicIds.has(s.id) ? 10 : category === 'necessity' && !intent.time_sensitive ? 10 : 7;
    const priority =
      Math.round(
        (phase_urgency * WEIGHTS.phase_urgency +
          dependency_impact * WEIGHTS.dependency_impact +
          business_impact * WEIGHTS.business_impact +
          resource_efficiency * WEIGHTS.resource_efficiency) *
          10
      ) / 10;
    return {
      id: s.id,
      question: s.question,
      category,
      phase: 'PreD',
      scores: { phase_urgency, dependency_impact, business_impact, resource_efficiency },
      priority,
      queue: priority > THRESHOLDS.immediate ? 'immediate' : priority >= THRESHOLDS.async ? 'normal' : 'async',
      doer: reusedTopicIds.has(s.id)
        ? 'Knowledge base (verified earlier)'
        : category === 'necessity'
          ? 'RAG DAL researcher · Tier 1 first'
          : category === 'anxiety'
            ? 'RAG DAL researcher · opposing views'
            : category === 'priority'
              ? 'RAG DAL researcher · current sources'
              : 'RAG DAL researcher · if time allows',
      blocked_by: [],
      gated: category === 'opportunity',
    };
  });

  tasks.sort((a, b) => {
    const c = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    if (c !== 0) return c;
    if (b.priority !== a.priority) return b.priority - a.priority;
    return b.scores.dependency_impact - a.scores.dependency_impact;
  });

  return {
    tasks,
    pattern: 'Parallel fan-out per pass (N, A, P), fan-in synthesis; Opportunity runs only once the core is covered (W = 1)',
    weights: WEIGHTS,
    thresholds: THRESHOLDS,
  };
}

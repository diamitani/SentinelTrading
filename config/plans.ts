// ============================================================================
// PLANS: edit this one file to change names, prices or features.
// The landing page pricing section and the sign-up screen both read from here.
// ============================================================================

export type PlanId = 'beginner' | 'active' | 'pro';

export interface Plan {
  id: PlanId;
  name: string;
  /** Monthly price in US dollars. 0 = free. */
  price: number;
  /** Who this plan is for, in the customer's own words. */
  who: string;
  tagline: string;
  features: string[];
  recommended?: boolean;
}

/**
 * Billing isn't connected yet (that's Stripe, a later step). While this is
 * false, paid plans are shown as "free during early access" and nobody is
 * charged. Flip to true once Stripe checkout is wired up.
 */
export const BILLING_ENABLED = false;

export const PLANS: Plan[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    price: 0,
    who: "I'm new to investing",
    tagline: 'Learn how markets work and practice with fake money first.',
    features: [
      'Ask Sentinel anything, with plain-English answers and sources',
      'Paper trading: practice with no real money',
      'Daily market overview',
      'Growth simulator',
    ],
    recommended: true,
  },
  {
    id: 'active',
    name: 'Active',
    price: 19,
    who: 'I already buy and sell sometimes',
    tagline: 'Research ideas faster and build your own strategy.',
    features: [
      'Everything in Beginner',
      'Research Ideas, each with a risk note',
      'Strategy Studio to save your own rules',
      'News, social and prediction-market signal feeds',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    who: 'I trade often and want every tool',
    tagline: 'The full research workspace.',
    features: [
      'Everything in Active',
      'Portfolio tracking',
      'Agent Sandbox for research automations',
      'Market Intel: geopolitics and sentiment',
    ],
  },
];

export const DEFAULT_PLAN: PlanId = 'beginner';

export function getPlan(id: string | null | undefined): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export function isPlanId(id: string | null | undefined): id is PlanId {
  return PLANS.some((p) => p.id === id);
}

export function priceLabel(plan: Plan): string {
  if (plan.price === 0) return 'Free';
  return `$${plan.price}/mo`;
}

// Anonymous funnel tracking: landing -> sign-up -> AI key -> dashboard -> first answer.
// Sends only a random browser id and a fixed step name (see /api/track).
// Never sends emails, names or keys. Failures are ignored.

export type FunnelEvent =
  | 'landing_view'
  | 'cta_click'
  | 'signup_view'
  | 'signup_plan_selected'
  | 'signup_account_created'
  | 'signup_ai_key_view'
  | 'signup_ai_key_connected'
  | 'signup_ai_key_skipped'
  | 'signup_ai_key_invalid'
  | 'dashboard_first_view'
  | 'first_question_asked'
  | 'first_answer_received'
  | 'needs_key_shown';

const ID_KEY = 'sentinel_anon_id';
const ONCE_KEY = 'sentinel_funnel_once';

function anonId(): string {
  try {
    let id = localStorage.getItem(ID_KEY);
    if (!id) {
      id = (crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36)).replace(/-/g, '');
      localStorage.setItem(ID_KEY, id);
    }
    return id;
  } catch {
    return 'anon' + Math.random().toString(36).slice(2, 12);
  }
}

export function track(event: FunnelEvent, opts: { plan?: string; props?: Record<string, string | number | boolean> } = {}) {
  try {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, anonId: anonId(), plan: opts.plan, props: opts.props }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

/** Track an event only the first time it happens in this browser. */
export function trackOnce(event: FunnelEvent, opts: Parameters<typeof track>[1] = {}) {
  try {
    const done: string[] = JSON.parse(localStorage.getItem(ONCE_KEY) || '[]');
    if (done.includes(event)) return;
    localStorage.setItem(ONCE_KEY, JSON.stringify([...done, event]));
  } catch {
    /* if storage is blocked, still send */
  }
  track(event, opts);
}

/** Set while a new user is in the sign-up wizard, so the app doesn't jump to the dashboard early. */
const ONBOARDING_KEY = 'sentinel_onboarding_active';
export const onboarding = {
  start() {
    try {
      sessionStorage.setItem(ONBOARDING_KEY, '1');
    } catch {
      /* ignore */
    }
  },
  finish() {
    try {
      sessionStorage.removeItem(ONBOARDING_KEY);
    } catch {
      /* ignore */
    }
  },
  active(): boolean {
    try {
      return sessionStorage.getItem(ONBOARDING_KEY) === '1';
    } catch {
      return false;
    }
  },
};

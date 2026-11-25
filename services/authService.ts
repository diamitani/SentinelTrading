// ============================================================================
// Accounts: instant guest access + optional personal email sign up / log in.
//
// Three modes, handled smoothly:
//  • GUEST MODE: instant one-click access with no email required. Saved in
//    this browser so everyday users can try paper trading immediately.
//  • SUPABASE MODE (real accounts): used when Supabase URL + public key are
//    configured. Upgrading from Guest to a personal email migrates their
//    paper portfolio automatically.
//  • PREVIEW MODE (no keys yet): personal email accounts saved in this browser.
// ============================================================================
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { PlanId, DEFAULT_PLAN, isPlanId } from '../config/plans';
import { migratePaperPortfolio } from './paperPortfolioService';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  plan: PlanId;
  createdAt: string;
  isGuest?: boolean;
  startingBudget?: number;
}

const env = (import.meta as any).env || {};
const supabaseUrl: string = (env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseKey: string = (
  env.VITE_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim();

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const AUTH_MODE: 'supabase' | 'preview' = supabase ? 'supabase' : 'preview';

type Listener = (user: UserProfile | null) => void;

/* ------------------------------ Helpers ---------------------------------- */

const friendlyError = (message: string): string => {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'That email and password don’t match. Try again.';
  if (m.includes('already registered') || m.includes('already exists'))
    return 'An account with this email already exists. Try logging in instead.';
  if (m.includes('email not confirmed')) return 'Please confirm your email first. Check your inbox for the link.';
  if (m.includes('password') && m.includes('at least')) return 'Your password needs at least 8 characters.';
  if (m.includes('rate limit')) return 'Too many attempts. Please wait a minute and try again.';
  return message || 'Something went wrong. Please try again.';
};

const fromSupabaseUser = (u: User): UserProfile => {
  const meta = (u.user_metadata || {}) as Record<string, unknown>;
  const plan = String(meta.plan || '');
  const budget = Number(meta.starting_budget);
  return {
    id: u.id,
    email: u.email || '',
    fullName: String(meta.full_name || u.email?.split('@')[0] || 'Trader'),
    plan: isPlanId(plan) ? plan : DEFAULT_PLAN,
    createdAt: u.created_at,
    isGuest: false,
    startingBudget: Number.isFinite(budget) && budget >= 25 ? budget : undefined,
  };
};

/* ---------------- Browser storage (Guest + Preview accounts) -------------- */

const ACCOUNTS_KEY = 'sentinel_preview_accounts_v1';
const SESSION_KEY = 'sentinel_preview_session_v1';
const GUEST_KEY = 'sentinel_guest_session_v1';
const listeners = new Set<Listener>();

type StoredAccount = UserProfile & { passwordHash: string };

const notify = (user: UserProfile | null) => {
  listeners.forEach((fn) => fn(user));
};

const readAccounts = (): Record<string, StoredAccount> => {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeAccounts = (accounts: Record<string, StoredAccount>) => {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

const readGuestSession = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
};

const writeGuestSession = (guest: UserProfile | null) => {
  try {
    if (guest) localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
    else localStorage.removeItem(GUEST_KEY);
  } catch {
    // ignore storage errors
  }
};

const hashPassword = async (password: string): Promise<string> => {
  const bytes = new TextEncoder().encode('sentinel:' + password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const setPreviewSession = (user: UserProfile | null) => {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
  notify(user);
};

const strip = ({ passwordHash: _ignored, ...profile }: StoredAccount): UserProfile => profile;

/* ------------------------------ Public API ------------------------------- */

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      return fromSupabaseUser(data.session.user);
    }
    return readGuestSession();
  }
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as UserProfile;
  } catch {
    // ignore
  }
  return readGuestSession();
}

/** Calls `fn` whenever someone enters guest mode, logs in, or logs out. */
export function onAuthChange(fn: Listener): () => void {
  listeners.add(fn);
  if (supabase) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fn(fromSupabaseUser(session.user));
      } else {
        fn(readGuestSession());
      }
    });
    return () => {
      listeners.delete(fn);
      data.subscription.unsubscribe();
    };
  }
  return () => {
    listeners.delete(fn);
  };
}

/** Instant frictionless guest entry — no email or password needed. */
export function enterGuestMode(startingBudget = 1000, plan: PlanId = DEFAULT_PLAN): UserProfile {
  const existing = readGuestSession();
  if (existing && existing.isGuest) {
    const updated: UserProfile = {
      ...existing,
      plan: plan || existing.plan,
      startingBudget: startingBudget || existing.startingBudget || 1000,
    };
    writeGuestSession(updated);
    notify(updated);
    return updated;
  }

  const guest: UserProfile = {
    id: 'guest_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 10) : Math.random().toString(36).slice(2, 10)),
    email: '',
    fullName: 'Guest Trader',
    plan,
    createdAt: new Date().toISOString(),
    isGuest: true,
    startingBudget,
  };
  writeGuestSession(guest);
  notify(guest);
  return guest;
}

export function updateProfileBudget(user: UserProfile, startingBudget: number): UserProfile {
  const updated: UserProfile = { ...user, startingBudget };
  if (user.isGuest) {
    writeGuestSession(updated);
    notify(updated);
  } else if (!supabase) {
    setPreviewSession(updated);
  }
  return updated;
}

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  plan: PlanId;
  startingBudget?: number;
}

export interface SignUpResult {
  user: UserProfile | null;
  /** True when Supabase wants the person to click a link in their email first. */
  needsEmailConfirmation: boolean;
}

export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  if (input.password.length < 8) throw new Error('Your password needs at least 8 characters.');

  const activeGuest = readGuestSession();
  const budget = input.startingBudget || activeGuest?.startingBudget || 1000;

  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        data: { full_name: fullName, plan: input.plan, starting_budget: budget },
        emailRedirectTo: `${window.location.origin}/app`,
      },
    });
    if (error) throw new Error(friendlyError(error.message));
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error(friendlyError('already registered'));
    }
    if (data.user && activeGuest) {
      migratePaperPortfolio(activeGuest.id, data.user.id);
    }
    if (!data.session) return { user: null, needsEmailConfirmation: true };
    writeGuestSession(null);
    const created = fromSupabaseUser(data.session.user);
    notify(created);
    return { user: created, needsEmailConfirmation: false };
  }

  const accounts = readAccounts();
  if (accounts[email]) throw new Error(friendlyError('already registered'));
  const account: StoredAccount = {
    id: 'usr_' + crypto.randomUUID().slice(0, 12),
    email,
    fullName: fullName || email.split('@')[0],
    plan: input.plan,
    createdAt: new Date().toISOString(),
    isGuest: false,
    startingBudget: budget,
    passwordHash: await hashPassword(input.password),
  };
  accounts[email] = account;
  writeAccounts(accounts);
  if (activeGuest) {
    migratePaperPortfolio(activeGuest.id, account.id);
    writeGuestSession(null);
  }
  const user = strip(account);
  setPreviewSession(user);
  return { user, needsEmailConfirmation: false };
}

export async function logIn(emailInput: string, password: string): Promise<UserProfile> {
  const email = emailInput.trim().toLowerCase();
  const activeGuest = readGuestSession();

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(friendlyError(error.message));
    if (activeGuest) {
      migratePaperPortfolio(activeGuest.id, data.user.id);
      writeGuestSession(null);
    }
    const loggedIn = fromSupabaseUser(data.user);
    notify(loggedIn);
    return loggedIn;
  }
  const account = readAccounts()[email];
  if (!account || account.passwordHash !== (await hashPassword(password))) {
    throw new Error(friendlyError('invalid login'));
  }
  if (activeGuest) {
    migratePaperPortfolio(activeGuest.id, account.id);
    writeGuestSession(null);
  }
  const user = strip(account);
  setPreviewSession(user);
  return user;
}

export async function logOut(): Promise<void> {
  writeGuestSession(null);
  if (supabase) {
    await supabase.auth.signOut();
  }
  setPreviewSession(null);
}

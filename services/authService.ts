// ============================================================================
// Accounts: sign up, log in, log out.
//
// Two modes, picked automatically:
//  • SUPABASE MODE (real accounts): used when the Supabase URL + public key
//    are set. On Vercel the Supabase connection already sets
//    NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Locally, put
//    the same two lines in a .env file. Accounts live in your Supabase project.
//  • PREVIEW MODE (no keys yet): accounts are saved in this browser only.
//    Good for building and demos. NOT a real customer list.
// ============================================================================
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { PlanId, DEFAULT_PLAN, isPlanId } from '../config/plans';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  plan: PlanId;
  createdAt: string;
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
  return {
    id: u.id,
    email: u.email || '',
    fullName: String(meta.full_name || u.email?.split('@')[0] || 'Trader'),
    plan: isPlanId(plan) ? plan : DEFAULT_PLAN,
    createdAt: u.created_at,
  };
};

/* --------------------- Preview mode (browser storage) -------------------- */

const ACCOUNTS_KEY = 'sentinel_preview_accounts_v1';
const SESSION_KEY = 'sentinel_preview_session_v1';
const previewListeners = new Set<Listener>();

type StoredAccount = UserProfile & { passwordHash: string };

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
  previewListeners.forEach((fn) => fn(user));
};

const strip = ({ passwordHash: _ignored, ...profile }: StoredAccount): UserProfile => profile;

/* ------------------------------ Public API ------------------------------- */

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    return data.session?.user ? fromSupabaseUser(data.session.user) : null;
  }
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

/** Calls `fn` whenever someone logs in or out. Returns a function to stop listening. */
export function onAuthChange(fn: Listener): () => void {
  if (supabase) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      fn(session?.user ? fromSupabaseUser(session.user) : null);
    });
    return () => data.subscription.unsubscribe();
  }
  previewListeners.add(fn);
  return () => previewListeners.delete(fn);
}

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  plan: PlanId;
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

  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        data: { full_name: fullName, plan: input.plan },
        emailRedirectTo: `${window.location.origin}/app`,
      },
    });
    if (error) throw new Error(friendlyError(error.message));
    // Supabase returns a user with no identities when the email is already taken.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error(friendlyError('already registered'));
    }
    if (!data.session) return { user: null, needsEmailConfirmation: true };
    return { user: fromSupabaseUser(data.session.user), needsEmailConfirmation: false };
  }

  const accounts = readAccounts();
  if (accounts[email]) throw new Error(friendlyError('already registered'));
  const account: StoredAccount = {
    id: 'usr_' + crypto.randomUUID().slice(0, 12),
    email,
    fullName: fullName || email.split('@')[0],
    plan: input.plan,
    createdAt: new Date().toISOString(),
    passwordHash: await hashPassword(input.password),
  };
  accounts[email] = account;
  writeAccounts(accounts);
  const user = strip(account);
  setPreviewSession(user);
  return { user, needsEmailConfirmation: false };
}

export async function logIn(emailInput: string, password: string): Promise<UserProfile> {
  const email = emailInput.trim().toLowerCase();
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(friendlyError(error.message));
    return fromSupabaseUser(data.user);
  }
  const account = readAccounts()[email];
  if (!account || account.passwordHash !== (await hashPassword(password))) {
    throw new Error(friendlyError('invalid login'));
  }
  const user = strip(account);
  setPreviewSession(user);
  return user;
}

export async function logOut(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
    return;
  }
  setPreviewSession(null);
}

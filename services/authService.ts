import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  tier: 'Institutional Prime' | 'Pro Quant' | 'Algorithmic Trader';
  capitalCapacity: number;
  activeThesesCount: number;
  createdAt: string;
}

const STORAGE_KEY = 'alphasentience_auth_user';

const envMeta = (import.meta as any).env || {};
const supabaseUrl = envMeta.VITE_SUPABASE_URL || 'https://sandbox.supabase.co';
const supabaseAnonKey =
  envMeta.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fakeKey';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

const syncBackendAuthSession = async (profile: UserProfile) => {
  try {
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: profile.email,
        name: profile.fullName,
        role: 'INSTITUTIONAL_QUANT',
        tier: profile.tier,
      }),
    });
  } catch {
    // Non-blocking sync
  }
};

export const getStoredUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: UserProfile | null) => {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
};

export const loginWithEmail = async (email: string, _password?: string): Promise<UserProfile> => {
  const namePart = email.split('@')[0] || 'Quant User';
  const cleanName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

  const profile: UserProfile = {
    id: 'usr_' + Math.random().toString(36).substring(2, 10),
    email,
    fullName: `${cleanName} (Portfolio Lead)`,
    tier: 'Institutional Prime',
    capitalCapacity: 19800000,
    activeThesesCount: 5,
    createdAt: new Date().toLocaleDateString(),
  };

  setStoredUser(profile);
  await syncBackendAuthSession(profile);
  return profile;
};

export const signUpWithEmail = async (
  email: string,
  fullName: string,
  tier: string = 'Institutional Prime'
): Promise<UserProfile> => {
  const profile: UserProfile = {
    id: 'usr_' + Math.random().toString(36).substring(2, 10),
    email,
    fullName: fullName || 'Quantitative Investor',
    tier: (tier as any) || 'Institutional Prime',
    capitalCapacity: 19800000,
    activeThesesCount: 2,
    createdAt: new Date().toLocaleDateString(),
  };

  setStoredUser(profile);
  await syncBackendAuthSession(profile);
  return profile;
};

export const loginAsDemoInstitutional = (): UserProfile => {
  const demoProfile: UserProfile = {
    id: 'usr_institutional_demo',
    email: 'fund-manager@alphasentience.ai',
    fullName: 'Alexander Vance, Managing Director',
    tier: 'Institutional Prime',
    capitalCapacity: 25000000,
    activeThesesCount: 11,
    createdAt: '2026-01-15',
  };

  setStoredUser(demoProfile);
  void syncBackendAuthSession(demoProfile);
  return demoProfile;
};

export const signOutUser = () => {
  setStoredUser(null);
};

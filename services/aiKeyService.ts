/**
 * Bring-Your-Own-Key (BYOK) helper.
 *
 * The user's Gemini key lives ONLY in this browser (localStorage). It is sent
 * to our API in the `x-user-ai-key` header with each AI request, used once for
 * that request, and never stored on the server.
 */
const STORAGE_KEY = 'sentinel_user_ai_key';
const CHANGE_EVENT = 'sentinel-ai-key-changed';

export const GEMINI_KEY_PATTERN = /^AIza[0-9A-Za-z_-]{30,60}$/;

export const looksLikeGeminiKey = (key: string): boolean => GEMINI_KEY_PATTERN.test(key.trim());

export const getAiKey = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

const notify = () => {
  try {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* non-blocking */
  }
};

export const saveAiKey = (key: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } catch {
    /* storage blocked (private mode): key just won't persist */
  }
  notify();
};

export const clearAiKey = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  notify();
};

/** Subscribe to key changes (returns an unsubscribe function). */
export const onAiKeyChange = (cb: () => void): (() => void) => {
  window.addEventListener(CHANGE_EVENT, cb);
  return () => window.removeEventListener(CHANGE_EVENT, cb);
};

/** Headers to attach to AI requests. Empty when the user has no key. */
export const aiKeyHeaders = (): Record<string, string> => {
  const key = getAiKey();
  return key ? { 'x-user-ai-key': key } : {};
};

export const validateAiKey = async (
  key: string
): Promise<{ valid: boolean; reason?: string; warning?: string }> => {
  try {
    const response = await fetch('/api/ai/validate', {
      method: 'POST',
      headers: { 'x-user-ai-key': key.trim() },
    });
    return await response.json();
  } catch {
    return { valid: false, reason: 'Could not reach the server to check the key.' };
  }
};

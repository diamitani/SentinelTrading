import React, { useEffect, useState } from 'react';
import {
  clearAiKey,
  getAiKey,
  looksLikeGeminiKey,
  saveAiKey,
  validateAiKey,
} from '../services/aiKeyService';

interface AiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after a key was saved or removed, so the app can refresh its AI data. */
  onChanged: () => void;
}

export const AiKeyModal: React.FC<AiKeyModalProps> = ({ isOpen, onClose, onChanged }) => {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasKey = Boolean(getAiKey());

  useEffect(() => {
    if (!isOpen) return;
    setValue('');
    setError(null);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = value.trim();
    if (!looksLikeGeminiKey(key)) {
      setError('That does not look like a Gemini key. Gemini keys start with "AIza".');
      return;
    }
    setBusy(true);
    setError(null);
    const result = await validateAiKey(key);
    setBusy(false);
    if (!result.valid) {
      setError(result.reason || 'This key could not be verified.');
      return;
    }
    saveAiKey(key);
    onChanged();
    onClose();
  };

  const handleRemove = () => {
    clearAiKey();
    onChanged();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-key-title"
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100">
          <h3 id="ai-key-title" className="text-base font-bold text-slate-900 tracking-tight">
            Use your own Gemini API key
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Sentinel runs AI on <strong>your</strong> Google Gemini account through the Vercel AI
            Gateway, so you only ever use your own quota.
          </p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="ai-key-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Gemini API key {hasKey && <span className="text-emerald-700 font-mono">(a key is saved)</span>}
            </label>
            <input
              id="ai-key-input"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="AIza…"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1.5 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Get a free key from Google AI Studio →
            </a>
          </div>

          <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-4">
            <li>Saved only in this browser. It is not stored on our servers.</li>
            <li>Sent over HTTPS with each AI request and used for that request only.</li>
            <li>Without a key you still get the app with built-in sample data.</li>
            <li>Anyone using this browser profile can use the saved key; remove it on shared computers.</li>
          </ul>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={busy || !value.trim()}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {busy ? 'Checking key…' : 'Verify & save'}
            </button>
            {hasKey && (
              <button
                type="button"
                onClick={handleRemove}
                className="py-2.5 px-3.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium"
              >
                Remove
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-3.5 text-slate-600 hover:text-slate-900 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

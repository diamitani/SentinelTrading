// Tiny router: gives every screen its own URL so the browser back button,
// refreshes and shared links all work.
//   /        -> landing page (public)
//   /signup  -> create account (pick a plan, then details)
//   /login   -> log in
//   /app     -> dashboard (only for signed-in users)
import { useEffect, useState, type MouseEvent } from 'react';

export const ROUTES = {
  home: '/',
  signup: '/signup',
  login: '/login',
  app: '/app',
} as const;

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  if (to === window.location.pathname + window.location.search) return;
  if (opts.replace) window.history.replaceState(null, '', to);
  else window.history.pushState(null, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0 });
}

export function usePath(): string {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onChange = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onChange);
    return () => window.removeEventListener('popstate', onChange);
  }, []);
  return path;
}

export function getQueryParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

/** Use on <a href="/signup"> links so they open instantly without a page reload. */
export function linkClick(to: string) {
  return (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let "open in new tab" work
    e.preventDefault();
    navigate(to);
  };
}

// Top-level traffic cop: decides which page to show for each URL.
//
//   /         Landing page    (everyone)
//   /signup   Create account  (signed-in people are sent on to /app)
//   /login    Log in          (signed-in people are sent on to /app)
//   /app      Dashboard       (signed-out people are sent to /signup)
import React, { useEffect, useState } from 'react';
import { usePath, navigate, ROUTES } from './lib/router';
import { getCurrentUser, onAuthChange, logOut, UserProfile } from './services/authService';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { AppShell } from './components/AppShell';
import { LoadingScreen } from './components/LoadingScreen';
import { onboarding } from './services/funnel';

const App: React.FC = () => {
  const path = usePath();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [checkedSession, setCheckedSession] = useState(false);

  // On first load, find out whether someone is already logged in,
  // then keep listening for log-ins / log-outs.
  useEffect(() => {
    let active = true;
    getCurrentUser().then((u) => {
      if (!active) return;
      setUser(u);
      setCheckedSession(true);
    });
    const stop = onAuthChange((u) => setUser(u));
    return () => {
      active = false;
      stop();
    };
  }, []);

  const isApp = path === ROUTES.app || path.startsWith(ROUTES.app + '/');
  const isAuthPage = path === ROUTES.signup || path === ROUTES.login;
  const isKnown = isApp || isAuthPage || path === ROUTES.home;

  // Redirect rules.
  useEffect(() => {
    if (!checkedSession) return;
    if (isApp && !user) navigate(ROUTES.signup, { replace: true });
    // A brand-new user stays in the sign-up wizard until they finish the AI step.
    else if (isAuthPage && user && !onboarding.active()) navigate(ROUTES.app, { replace: true });
    else if (!isKnown) navigate(ROUTES.home, { replace: true });
  }, [checkedSession, user, isApp, isAuthPage, isKnown]);

  const handleAuthed = (u: UserProfile) => {
    setUser(u);
    navigate(ROUTES.app);
  };

  const handleSignOut = async () => {
    await logOut();
    setUser(null);
    navigate(ROUTES.home);
  };

  if (!checkedSession) return path === ROUTES.home ? <LandingPage user={null} /> : <LoadingScreen message="Loading…" />;

  if (isApp) return user ? <AppShell user={user} onSignOut={handleSignOut} /> : <LoadingScreen message="Loading…" />;
  if (path === ROUTES.signup) return <AuthPage key="signup" mode="signup" onAuthed={handleAuthed} />;
  if (path === ROUTES.login) return <AuthPage key="login" mode="login" onAuthed={handleAuthed} />;
  return <LandingPage user={user} />;
};

export default App;

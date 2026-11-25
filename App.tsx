// Top-level traffic cop: decides which page to show for each URL.
//
//   /         Landing page    (everyone)
//   /signup   Save / create personal account (optional — guests can also upgrade here)
//   /login    Log in with personal email
//   /app      Dashboard       (instant guest access or signed-in personal account)
import React, { useEffect, useState } from 'react';
import { usePath, navigate, ROUTES } from './lib/router';
import {
  getCurrentUser,
  onAuthChange,
  logOut,
  enterGuestMode,
  UserProfile,
} from './services/authService';
import { PlanId } from './config/plans';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { AppShell } from './components/AppShell';
import { LoadingScreen } from './components/LoadingScreen';

const App: React.FC = () => {
  const path = usePath();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [checkedSession, setCheckedSession] = useState(false);

  // On first load, find out whether someone is already logged in (or in guest mode),
  // then keep listening for changes.
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

  // Redirect rules:
  // - Visitors hitting /app directly without an account enter instant Guest Mode automatically.
  // - Full signed-in personal accounts on /login or /signup redirect straight to /app.
  // - Guest users visiting /signup or /login are allowed to stay so they can save their progress.
  useEffect(() => {
    if (!checkedSession) return;
    if (isApp && !user) {
      const guest = enterGuestMode(1000, 'beginner');
      setUser(guest);
    } else if (isAuthPage && user && !user.isGuest) {
      navigate(ROUTES.app, { replace: true });
    } else if (!isKnown) {
      navigate(ROUTES.home, { replace: true });
    }
  }, [checkedSession, user, isApp, isAuthPage, isKnown]);

  const handleAuthed = (u: UserProfile) => {
    setUser(u);
    navigate(ROUTES.app);
  };

  const handleEnterGuest = (startingBudget = 1000, plan: PlanId = 'beginner') => {
    const guest = enterGuestMode(startingBudget, plan);
    setUser(guest);
    navigate(ROUTES.app);
  };

  const handleSignOut = async () => {
    await logOut();
    setUser(null);
    navigate(ROUTES.home);
  };

  if (!checkedSession) {
    return path === ROUTES.home ? (
      <LandingPage user={null} onEnterGuest={handleEnterGuest} />
    ) : (
      <LoadingScreen message="Loading Sentinel…" />
    );
  }

  if (isApp) {
    return user ? (
      <AppShell
        user={user}
        onSignOut={handleSignOut}
        onOpenUpgrade={() => navigate(ROUTES.signup)}
      />
    ) : (
      <LoadingScreen message="Opening your workspace…" />
    );
  }

  if (path === ROUTES.signup) {
    return (
      <AuthPage
        key="signup"
        mode="signup"
        existingGuest={user?.isGuest ? user : null}
        onAuthed={handleAuthed}
        onEnterGuest={handleEnterGuest}
      />
    );
  }

  if (path === ROUTES.login) {
    return (
      <AuthPage
        key="login"
        mode="login"
        existingGuest={user?.isGuest ? user : null}
        onAuthed={handleAuthed}
        onEnterGuest={handleEnterGuest}
      />
    );
  }

  return <LandingPage user={user} onEnterGuest={handleEnterGuest} />;
};

export default App;

import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PublicLanding } from './components/PublicLanding';
import { useAppStartup } from './hooks/useAppStartup';
import { useAuth } from './hooks/useAuth';
import { analyticsBeforeSend, setAnalyticsSignedIn } from './lib/analytics';
import { PUBLIC_PAGES } from './seo/pageMeta';

/**
 * Hydration tree for prerendered public documents.
 * It renders the same first paint as the static HTML. Sign-in and payment
 * screens are full page loads of the app shell, not this tree.
 */
export function PublicShell() {
  const { user, loading } = useAuth();
  setAnalyticsSignedIn(loading || Boolean(user));
  useAppStartup();

  return (
    <BrowserRouter>
      <Analytics beforeSend={analyticsBeforeSend} />
      <Routes>
        {PUBLIC_PAGES.map((page) => (
          <Route key={page.path} path={page.path} element={<PublicLanding path={page.path} />} />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

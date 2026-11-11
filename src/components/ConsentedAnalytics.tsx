import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { analyticsBeforeSend, PUBLIC_ANALYTICS_PATHS } from '../lib/analytics';
import { useConsent } from '../lib/consent';

function currentPath(): string {
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

/**
 * Vercel Web Analytics, loaded only on the public home and welcome pages and
 * only after cookie consent. Auth, payment, checkout, policy, and signed-in
 * routes never load the script.
 */
export function ConsentedAnalytics() {
  const consent = useConsent();
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    setPath(currentPath());
  }, []);

  if (consent !== 'accepted' || path === null || !PUBLIC_ANALYTICS_PATHS.has(path)) return null;
  return <Analytics beforeSend={analyticsBeforeSend} />;
}

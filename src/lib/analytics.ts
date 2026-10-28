import type { BeforeSendEvent } from '@vercel/analytics/react';

/**
 * Vercel Web Analytics runs only on the public marketing pages, and only while
 * nobody is signed in. Auth, payment, checkout and every signed-in route are
 * dropped before anything is sent, and query strings/hashes are stripped.
 */
export const PUBLIC_ANALYTICS_PATHS = new Set(['/', '/welcome']);

let signedIn = true; // fail closed until auth state is known

export function setAnalyticsSignedIn(value: boolean) {
  signedIn = value;
}

export function analyticsBeforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  if (signedIn) return null;
  let url: URL;
  try {
    url = new URL(event.url);
  } catch {
    return null;
  }
  const path = url.pathname.replace(/\/+$/, '') || '/';
  if (!PUBLIC_ANALYTICS_PATHS.has(path)) return null;
  return { ...event, url: `${url.origin}${path}` };
}

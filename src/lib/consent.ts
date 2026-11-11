import { useSyncExternalStore } from 'react';

/**
 * Cookie consent for the public pages. Third-party ads and Vercel Web
 * Analytics load only after the visitor accepts. The choice lives in this
 * browser only (localStorage) and is never sent anywhere.
 */
export type ConsentState = 'unset' | 'accepted' | 'declined';

export const CONSENT_STORAGE_KEY = 'll_cookie_consent_v1';

const listeners = new Set<() => void>();

function read(): ConsentState {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === 'accepted' || value === 'declined' ? value : 'unset';
  } catch {
    return 'unset';
  }
}

export function getConsent(): ConsentState {
  if (typeof window === 'undefined') return 'unset';
  return read();
}

export function setConsent(value: ConsentState): void {
  try {
    if (value === 'unset') window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    else window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
  memo = value;
  listeners.forEach((listener) => listener());
}

let memo: ConsentState | null = null;

function snapshot(): ConsentState {
  if (memo === null) memo = getConsent();
  return memo;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== CONSENT_STORAGE_KEY) return;
    memo = read();
    listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** Prerender and the first hydration pass see 'unset', so markup always matches. */
export function useConsent(): ConsentState {
  return useSyncExternalStore(subscribe, snapshot, () => 'unset');
}

/** Test helper: forget the cached value so the next read hits storage. */
export function resetConsentCacheForTests(): void {
  memo = null;
}

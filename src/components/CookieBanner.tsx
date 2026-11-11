import { useEffect, useState } from 'react';
import { setConsent, useConsent } from '../lib/consent';
import { ADS_ENABLED } from '../lib/adsConfig';

/**
 * Lightweight cookie notice for the public pages. It renders only in the
 * browser after mount, so prerendered HTML never contains it. Ads and Vercel
 * Web Analytics stay off until the visitor presses Accept.
 */
export function CookieBanner() {
  const consent = useConsent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || consent !== 'unset') return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie notice"
      data-cookie-banner=""
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur shadow-lg"
    >
      <div className="max-w-5xl mx-auto px-4 py-4 sm:flex sm:items-center sm:gap-6">
        <p className="text-sm text-gray-700">
          {ADS_ENABLED
            ? 'We use cookies and similar storage for third-party advertising and to measure visits to our public pages. They only load if you accept. Sign-in and payment pages never show ads.'
            : 'We measure visits to our public pages. That only starts if you accept.'}{' '}
          Read the{' '}
          <a href="/privacy#cookies" className="text-blue-600 hover:text-blue-700 underline">
            cookie section of our privacy policy
          </a>
          .
        </p>
        <div className="mt-3 flex shrink-0 gap-3 sm:mt-0">
          <button
            type="button"
            onClick={() => setConsent('declined')}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => setConsent('accepted')}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

/** Footer control that clears the stored choice so the notice shows again. */
export function CookieSettingsButton({ className = '' }: { className?: string }) {
  return (
    <button type="button" onClick={() => setConsent('unset')} className={className}>
      Cookie settings
    </button>
  );
}

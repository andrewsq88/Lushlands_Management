import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CookieBanner, CookieSettingsButton } from './CookieBanner';
import { AdsterraRectangle } from './AdsterraBanner';
import { AdsterraNative } from './AdsterraNative';
import { PremiumCta } from './public/PublicPage';
import { CONSENT_STORAGE_KEY, getConsent, resetConsentCacheForTests, setConsent } from '../lib/consent';

function adScripts() {
  return Array.from(document.querySelectorAll('script[src]')).filter((s) =>
    (s as HTMLScriptElement).src.includes('bauval.org'),
  );
}

async function flush() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
}

describe('cookie consent', () => {
  beforeEach(() => {
    localStorage.clear();
    resetConsentCacheForTests();
    document.querySelectorAll('script').forEach((s) => s.remove());
    // jsdom has no IntersectionObserver: the slot helper then mounts at once.
    vi.stubGlobal('IntersectionObserver', undefined);
  });

  it('shows the banner and loads no ad script before a choice', async () => {
    render(
      <>
        <AdsterraRectangle />
        <AdsterraNative />
        <CookieBanner />
      </>,
    );
    await flush();
    expect(screen.getByRole('dialog', { name: 'Cookie notice' })).toBeInTheDocument();
    expect(adScripts()).toHaveLength(0);
    // The reserved slots are still rendered so the layout does not move.
    expect(document.querySelectorAll('[data-ad-slot]')).toHaveLength(2);
  });

  it('loads ad scripts only after Accept and remembers the choice', async () => {
    const user = userEvent.setup();
    render(
      <>
        <AdsterraRectangle />
        <AdsterraNative />
        <CookieBanner />
      </>,
    );
    await flush();
    await user.click(screen.getByRole('button', { name: 'Accept' }));
    await flush();
    expect(screen.queryByRole('dialog', { name: 'Cookie notice' })).not.toBeInTheDocument();
    expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('accepted');
    expect(adScripts().length).toBeGreaterThanOrEqual(2);
  });

  it('keeps ads off after Decline', async () => {
    const user = userEvent.setup();
    render(
      <>
        <AdsterraRectangle />
        <CookieBanner />
      </>,
    );
    await flush();
    await user.click(screen.getByRole('button', { name: 'Decline' }));
    await flush();
    expect(getConsent()).toBe('declined');
    expect(adScripts()).toHaveLength(0);
    expect(screen.queryByRole('dialog', { name: 'Cookie notice' })).not.toBeInTheDocument();
  });

  it('Cookie settings brings the notice back', async () => {
    setConsent('declined');
    const user = userEvent.setup();
    render(
      <>
        <CookieBanner />
        <CookieSettingsButton />
      </>,
    );
    await flush();
    expect(screen.queryByRole('dialog', { name: 'Cookie notice' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cookie settings' }));
    expect(screen.getByRole('dialog', { name: 'Cookie notice' })).toBeInTheDocument();
  });
});

describe('Premium CTA', () => {
  it('sends signed-out visitors to sign-up first, then upgrade', () => {
    render(<PremiumCta signedIn={false} />);
    expect(screen.getByRole('link', { name: 'Get Premium' })).toHaveAttribute('href', '/signup?plan=premium');
    expect(screen.getByRole('link', { name: 'sign in' })).toHaveAttribute('href', '/login?plan=premium');
    expect(document.body.innerHTML).not.toContain('buy.stripe.com');
  });

  it('sends signed-in visitors to the subscription screen', () => {
    render(<PremiumCta signedIn />);
    expect(screen.getByRole('link', { name: 'Upgrade to Premium' })).toHaveAttribute('href', '/subscription');
  });
});

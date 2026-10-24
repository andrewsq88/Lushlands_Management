import { useEffect, useRef, useState } from 'react';

/** 728x90 banner, zone 31825906. */
const ADSTERRA_LEADERBOARD = {
  key: '1fe49dab56617f56988a2eb60575c323',
  width: 728,
  height: 90,
} as const;

/** 300x250 banner, zone 31825905. */
const ADSTERRA_RECTANGLE = {
  key: '2eb00fce858b24f88558dc5e57ad2542',
  width: 300,
  height: 250,
} as const;

const DESKTOP_LEADERBOARD_QUERY = '(min-width: 1024px)';

interface AtOptions {
  key: string;
  format: 'iframe';
  height: number;
  width: number;
  params: Record<string, never>;
}

declare global {
  interface Window {
    atOptions?: AtOptions;
  }
}

interface AdsterraBannerProps {
  adKey: string;
  width: number;
  height: number;
  className?: string;
}

/**
 * Two banners share window.atOptions. Mount the next unit only after the
 * previous invoke.js has loaded so the second assignment cannot win the race.
 */
let bannerQueue: Promise<void> = Promise.resolve();

function enqueueBanner(task: () => Promise<void>): void {
  const run = bannerQueue.then(task, task);
  bannerQueue = run.then(
    () => undefined,
    () => undefined,
  );
}

function mountBanner(container: HTMLElement, options: AtOptions): Promise<void> {
  window.atOptions = options;

  const inline = document.createElement('script');
  inline.type = 'text/javascript';
  inline.text = `atOptions = ${JSON.stringify(options)};`;
  container.appendChild(inline);

  return new Promise((resolve) => {
    const invoke = document.createElement('script');
    invoke.type = 'text/javascript';
    invoke.async = false;
    invoke.src = `https://bauval.org/22/${encodeURIComponent(options.key)}`;
    const timer = window.setTimeout(resolve, 10000);
    const done = () => {
      window.clearTimeout(timer);
      resolve();
    };
    invoke.addEventListener('load', done, { once: true });
    invoke.addEventListener('error', done, { once: true });
    container.appendChild(invoke);
  });
}

/**
 * Official Adsterra banner placement: atOptions plus invoke.js inside a
 * fixed-size box. Adsterra creates the creative iframe. The slot size stays
 * reserved so the page does not jump when the creative arrives.
 */
export function AdsterraBanner({ adKey, width, height, className = '' }: AdsterraBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    const options: AtOptions = {
      key: adKey,
      format: 'iframe',
      height,
      width,
      params: {},
    };
    enqueueBanner(async () => {
      if (cancelled || !container.isConnected) return;
      await mountBanner(container, options);
    });
    return () => {
      cancelled = true;
    };
  }, [adKey, width, height]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width,
        height,
        marginLeft: 'auto',
        marginRight: 'auto',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    />
  );
}

function useDesktopLeaderboard(): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(DESKTOP_LEADERBOARD_QUERY).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_LEADERBOARD_QUERY);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return matches;
}

/** Fixed 300x250 rectangle, zone 31825905. */
export function AdsterraRectangle({ className = '' }: { className?: string }) {
  return (
    <AdsterraBanner
      adKey={ADSTERRA_RECTANGLE.key}
      width={ADSTERRA_RECTANGLE.width}
      height={ADSTERRA_RECTANGLE.height}
      className={className}
    />
  );
}

/** 728x90 on desktop only. Narrow viewports skip the unit so it does not squeeze the page. */
export function AdsterraLeaderboard({ className = '' }: { className?: string }) {
  const isDesktop = useDesktopLeaderboard();
  if (!isDesktop) return null;
  return (
    <AdsterraBanner
      adKey={ADSTERRA_LEADERBOARD.key}
      width={ADSTERRA_LEADERBOARD.width}
      height={ADSTERRA_LEADERBOARD.height}
      className={className}
    />
  );
}

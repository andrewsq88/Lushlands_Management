import { useEffect, useRef } from 'react';
import { LOWER_SLOT_ROOT_MARGIN, observeNearViewport, whenPageLoaded } from './adSlotTiming';

/** 300x250 banner, zone 31825905. The 728x90 unit is not used. */
const ADSTERRA_RECTANGLE = {
  key: '2eb00fce858b24f88558dc5e57ad2542',
  width: 300,
  height: 250,
  slot: '300x250-below-signup',
} as const;

const LABEL_HEIGHT = 16;
const LABEL_GAP = 8;

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
  slot: string;
  className?: string;
  /** Lower slots wait until they are near the viewport. The box is reserved either way. */
  lazy?: boolean;
}

/**
 * Two banners would share window.atOptions. Mount through one queue so a
 * later assignment cannot win a race. This page only mounts the 300x250.
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
 * fixed-size box. The slot height includes the label and is reserved before
 * the script runs, so the creative cannot shift the page or cover a control
 * above it.
 */
export function AdsterraBanner({
  adKey,
  width,
  height,
  slot,
  className = '',
  lazy = false,
}: AdsterraBannerProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slotEl = slotRef.current;
    const container = containerRef.current;
    if (!slotEl || !container) return;

    let cancelled = false;
    let stopObserve = () => {};

    const mount = () => {
      if (cancelled || !container.isConnected) return;
      if (container.dataset.adMounted === '1') return;
      container.dataset.adMounted = '1';
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
    };

    void whenPageLoaded().then(() => {
      if (cancelled || !container.isConnected) return;
      if (!lazy) {
        mount();
        return;
      }
      stopObserve = observeNearViewport(slotEl, LOWER_SLOT_ROOT_MARGIN, mount);
    });

    return () => {
      cancelled = true;
      stopObserve();
    };
  }, [adKey, width, height, lazy]);

  const reservedHeight = height + LABEL_HEIGHT + LABEL_GAP;

  return (
    <div
      ref={slotRef}
      data-ad-slot={slot}
      className={className}
      style={{
        width,
        height: reservedHeight,
        minHeight: reservedHeight,
        overflow: 'hidden',
        flexShrink: 0,
        position: 'static',
      }}
    >
      <div
        className="text-xs text-gray-500 text-center"
        style={{ height: LABEL_HEIGHT, marginBottom: LABEL_GAP, lineHeight: `${LABEL_HEIGHT}px` }}
      >
        Advertisement
      </div>
      <div ref={containerRef} style={{ width, height, overflow: 'hidden' }} />
    </div>
  );
}

/** Fixed 300x250 rectangle, zone 31825905. One slot, placed under the first sign-up control. */
export function AdsterraRectangle({ className = '' }: { className?: string }) {
  return (
    <AdsterraBanner
      adKey={ADSTERRA_RECTANGLE.key}
      width={ADSTERRA_RECTANGLE.width}
      height={ADSTERRA_RECTANGLE.height}
      slot={ADSTERRA_RECTANGLE.slot}
      className={className}
    />
  );
}

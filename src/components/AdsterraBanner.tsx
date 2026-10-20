import { useEffect, useState } from 'react';

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

interface AdsterraBannerProps {
  adKey: string;
  width: number;
  height: number;
  className?: string;
}

function bannerDocument(adKey: string, width: number, height: number): string {
  const options = {
    key: adKey,
    format: 'iframe',
    height,
    width,
    params: {},
  };
  const invokeSrc = `https://bauval.org/22/${encodeURIComponent(adKey)}`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent;}</style></head><body><script>atOptions=${JSON.stringify(options)};</script><script src=${JSON.stringify(invokeSrc)}></script></body></html>`;
}

/**
 * One atOptions banner in its own fixed-size iframe so several units can share a page
 * without overwriting the global atOptions object.
 */
export function AdsterraBanner({ adKey, width, height, className = '' }: AdsterraBannerProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        marginLeft: 'auto',
        marginRight: 'auto',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <iframe
        title={`Advertisement ${width} by ${height}`}
        srcDoc={bannerDocument(adKey, width, height)}
        width={width}
        height={height}
        scrolling="no"
        style={{
          width,
          height,
          border: 0,
          display: 'block',
          overflow: 'hidden',
        }}
      />
    </div>
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

/** 728x90 on desktop. The 300x250 unit replaces it when the viewport is narrower. */
export function AdsterraLeaderboard({ className = '' }: { className?: string }) {
  const isDesktop = useDesktopLeaderboard();
  const unit = isDesktop ? ADSTERRA_LEADERBOARD : ADSTERRA_RECTANGLE;
  return (
    <AdsterraBanner
      adKey={unit.key}
      width={unit.width}
      height={unit.height}
      className={className}
    />
  );
}

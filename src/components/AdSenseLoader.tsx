import { useEffect } from 'react';

const SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2857342591276131';

/**
 * Loads the AdSense script only on public pages. It is not in index.html,
 * so auth, payment, checkout and dashboard routes never load ad code.
 */
export function AdSenseLoader() {
  useEffect(() => {
    if (document.querySelector(`script[src="${SRC}"]`)) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = SRC;
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }, []);
  return null;
}

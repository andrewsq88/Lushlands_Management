/** Resolve after the window load event so ad scripts stay off the critical path. */
export function whenPageLoaded(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();
  if (document.readyState === 'complete') return Promise.resolve();
  return new Promise((resolve) => {
    window.addEventListener('load', () => resolve(), { once: true });
  });
}

/**
 * Resolve once `element` is within `rootMargin` of the viewport.
 * Returns a cancel function that disconnects the observer.
 * The slot element stays in normal flow; only the script load waits.
 */
export function observeNearViewport(
  element: Element,
  rootMargin: string,
  onNear: () => void,
): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    onNear();
    return () => undefined;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        onNear();
      }
    },
    { root: null, rootMargin, threshold: 0 },
  );
  observer.observe(element);
  return () => observer.disconnect();
}

/** About 200px, per the placement notes, so a lower slot starts loading as it approaches. */
export const LOWER_SLOT_ROOT_MARGIN = '200px';

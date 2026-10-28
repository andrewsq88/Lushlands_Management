import { useEffect, useRef } from 'react';
import { LOWER_SLOT_ROOT_MARGIN, observeNearViewport, whenPageLoaded } from './adSlotTiming';

/** Native Banner zone 31825903. Official snippet: async script plus the container div. */
const NATIVE_SCRIPT_SRC = 'https://bauval.org/21/5df5a6a46bb57d8615e5aefa3f8cb512';
const NATIVE_CONTAINER_ID = 'container-5df5a6a46bb57d8615e5aefa3f8cb512';
const NATIVE_SCRIPT_ID = 'adsterra-native-31825903';
const NATIVE_SLOT = 'native-above-footer';

const LABEL_HEIGHT = 16;
const LABEL_GAP = 8;
const CREATIVE_HEIGHT = 250;
const RESERVED_HEIGHT = LABEL_HEIGHT + LABEL_GAP + CREATIVE_HEIGHT;

/**
 * Fixed native slot directly above the public footer.
 * The box is in the first render. The script waits for page load, then for
 * the slot to come within 200px of the viewport.
 */
export function AdsterraNative() {
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;

    let cancelled = false;
    let stopObserve = () => {};

    const mount = () => {
      if (cancelled) return;
      if (document.getElementById(NATIVE_SCRIPT_ID)) return;
      const container = document.getElementById(NATIVE_CONTAINER_ID);
      if (!container || !container.parentNode) return;
      const script = document.createElement('script');
      script.id = NATIVE_SCRIPT_ID;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = NATIVE_SCRIPT_SRC;
      container.parentNode.insertBefore(script, container);
    };

    void whenPageLoaded().then(() => {
      if (cancelled || !slot.isConnected) return;
      stopObserve = observeNearViewport(slot, LOWER_SLOT_ROOT_MARGIN, mount);
    });

    return () => {
      cancelled = true;
      stopObserve();
    };
  }, []);

  return (
    <div
      ref={slotRef}
      data-ad-slot={NATIVE_SLOT}
      style={{
        width: '100%',
        maxWidth: 728,
        height: RESERVED_HEIGHT,
        minHeight: RESERVED_HEIGHT,
        margin: '2rem auto 0',
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
      <div
        id={NATIVE_CONTAINER_ID}
        style={{ width: '100%', height: CREATIVE_HEIGHT, overflow: 'hidden' }}
      />
    </div>
  );
}

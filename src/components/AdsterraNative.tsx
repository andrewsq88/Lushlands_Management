import { useEffect } from 'react';

/** Native Banner zone 31825903. */
const NATIVE_SCRIPT_SRC = 'https://bauval.org/21/5df5a6a46bb57d8615e5aefa3f8cb512';
const NATIVE_CONTAINER_ID = 'container-5df5a6a46bb57d8615e5aefa3f8cb512';
const NATIVE_SCRIPT_ID = 'adsterra-native-31825903';

/** Inject the native script once per page load and reserve a fixed box so the page does not jump. */
export function AdsterraNative() {
  useEffect(() => {
    if (document.getElementById(NATIVE_SCRIPT_ID)) return;
    const script = document.createElement('script');
    script.id = NATIVE_SCRIPT_ID;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = NATIVE_SCRIPT_SRC;
    document.body.appendChild(script);
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: 728, margin: '2rem auto 0' }}>
      <div className="text-xs text-gray-400 mb-2 text-center">Advertisement</div>
      <div
        id={NATIVE_CONTAINER_ID}
        style={{ width: '100%', height: 250, overflow: 'hidden' }}
      />
    </div>
  );
}

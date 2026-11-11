/**
 * Single kill switch for every Adsterra slot and script.
 *
 * Set the build env var VITE_ADS_ENABLED=false (or 0 / off) and redeploy to
 * turn ads off everywhere: no ad script is requested and the ad slots are not
 * rendered at all, so they leave no gap. Unset or any other value keeps ads on.
 */
export function adsEnabledFrom(value: string | undefined): boolean {
  if (value === undefined) return true;
  return !['false', '0', 'off', 'no'].includes(value.trim().toLowerCase());
}

export const ADS_ENABLED = adsEnabledFrom(import.meta.env.VITE_ADS_ENABLED);

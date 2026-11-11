/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Ads kill switch: "false", "0", "off" or "no" turns every Adsterra slot off. Unset means on. */
  readonly VITE_ADS_ENABLED?: string;
}

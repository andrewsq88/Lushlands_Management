import React, { useEffect } from 'react';

interface AdSenseBannerProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: 'true' | 'false';
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdSenseBanner({ 
  slot, 
  format = 'auto', 
  responsive = 'true', 
  className = '',
  style = {}
}: AdSenseBannerProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  // Use the client ID from the script tag
  const client = 'ca-pub-2857342591276131';

  if (!client) {
    console.warn("Google AdSense client ID is not configured. AdSense banners will not be displayed.");
    return null;
  }

  return (
    <div className={`my-8 text-center ${className}`} style={style}>
      <div className="text-xs text-gray-400 mb-2">Advertisement</div>
      <ins
        className="adsbygoogle"
        style={{ 
          display: 'block',
          minHeight: '90px',
          ...style
        }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
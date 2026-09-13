import React from 'react';

/** Non-layout Adsterra SmartLink - text only, new tab. */
export function SponsoredLink(props: { className?: string }) {
  const className = props.className || '';
  const href = 'https://www.profitableratecpmnetwork.com/kzpbt1dn?key=fd5a34fdf4dd2a170d0693d9bb892589';
  return (
    <p className={'text-center text-xs text-gray-400 ' + className}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="underline hover:text-gray-600"
      >
        Sponsored
      </a>
    </p>
  );
}

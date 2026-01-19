import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SEOConfig } from '../utils/seoConfig';

interface SEOHeadProps {
  config: SEOConfig;
  structuredData?: object;
}

export function SEOHead({ config, structuredData }: SEOHeadProps) {
  const {
    title,
    description,
    keywords,
    ogTitle,
    ogDescription,
    canonicalUrl
  } = config;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />

      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:card" content="summary_large_image" />

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

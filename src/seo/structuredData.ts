import { FAQ_ITEMS } from './faq';
import { SITE_ORIGIN } from './site';

const LOGO_URL = `${SITE_ORIGIN}/Possible%20Property%20Hub%20Logo.png`;

/** Organization, SoftwareApplication, and FAQPage for every public document. */
export function publicJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_ORIGIN}/#organization`,
        name: 'LushLands Management',
        url: `${SITE_ORIGIN}/`,
        logo: LOGO_URL,
        description:
          'Property management software for landlords and property managers worldwide. Record properties, occupants, maintenance, and payments.',
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_ORIGIN}/#software`,
        name: 'LushLands Management',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: `${SITE_ORIGIN}/`,
        description:
          'Web software for landlords and property managers to record properties, occupants, maintenance, and payments. A free plan is available. Premium is 15 US dollars per month.',
        isAccessibleForFree: true,
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: '0',
          highPrice: '15',
          priceCurrency: 'USD',
          offerCount: 2,
        },
        provider: { '@id': `${SITE_ORIGIN}/#organization` },
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_ORIGIN}/faq#faq`,
        url: `${SITE_ORIGIN}/faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };
}

/** JSON text safe to place inside an HTML script element. */
export function publicJsonLdText(): string {
  return JSON.stringify(publicJsonLd()).replace(/</g, '\\u003c');
}

export function publicJsonLdScript(): string {
  return `<script type="application/ld+json" data-seo="public">${publicJsonLdText()}</script>`;
}

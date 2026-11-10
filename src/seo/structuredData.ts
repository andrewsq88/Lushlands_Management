import { FAQ_ITEMS } from './faq';
import { OG_IMAGE, SITE_ORIGIN } from './site';

export const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

const ORGANIZATION_DESCRIPTION =
  'Property management software for landlords and property managers worldwide. Record properties, occupants, maintenance, and payments.';

/** Facts already published on the site: name, canonical origin, and the existing logo file. */
export function organizationNode(): Record<string, unknown> {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'LushLands Management',
    url: `${SITE_ORIGIN}/`,
    logo: OG_IMAGE,
    description: ORGANIZATION_DESCRIPTION,
  };
}

/** Site entity. No social profile, contact point, or search action is published. */
export function websiteNode(): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'LushLands Management',
    url: `${SITE_ORIGIN}/`,
    description: ORGANIZATION_DESCRIPTION,
    publisher: { '@id': ORGANIZATION_ID },
  };
}

function softwareNode(): Record<string, unknown> {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${SITE_ORIGIN}/#software`,
    name: 'LushLands Management',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: `${SITE_ORIGIN}/`,
    description:
      'Web software for landlords and property managers to record properties, occupants, maintenance, and payments. Free covers up to 5 properties. Premium is unlimited.',
    isAccessibleForFree: true,
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      highPrice: '15',
      priceCurrency: 'USD',
      offerCount: 2,
    },
    provider: { '@id': ORGANIZATION_ID },
  };
}

function faqNode(): Record<string, unknown> {
  return {
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
  };
}

/**
 * Organization and WebSite are on every public document.
 * FAQPage is included only for /faq, which renders those questions.
 * The SoftwareApplication block is the existing application description.
 */
export function publicJsonLd({ includeFaq = false } = {}): Record<string, unknown> {
  const graph = [organizationNode(), websiteNode(), softwareNode()];
  if (includeFaq) graph.push(faqNode());
  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

/** JSON text safe to place inside an HTML script element. */
export function publicJsonLdText(options?: { includeFaq?: boolean }): string {
  return JSON.stringify(publicJsonLd(options)).replace(/</g, '\\u003c');
}


export function publicJsonLdScript(): string {
  return `<script type="application/ld+json" data-seo="public">${publicJsonLdText()}</script>`;
}

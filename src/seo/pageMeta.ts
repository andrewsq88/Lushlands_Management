/**
 * Per-route document head copy.
 * Homepage title and description match index.html.
 * Absolute URLs use www because the apex host 307-redirects there.
 */
import { guideJsonLdFor, GUIDES } from './guides';
import { publicJsonLdText } from './structuredData';
import { type PublicPath } from './publicPaths';
import { OG_IMAGE, SITE_ORIGIN } from './site';

export interface PageMetaValues {
  path: PublicPath;
  heading: string;
  title: string;
  description: string;
  canonical: string;
  /** Open Graph and Twitter description. Defaults to `description`. */
  socialDescription?: string;
  /** Open Graph type. Public guides are articles. */
  ogType?: string;
  keywords?: string;
  jsonLd: string;
}

export { OG_IMAGE, SITE_ORIGIN } from './site';

function canonicalFor(path: PublicPath): string {
  return path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
}

function page(
  values: Omit<PageMetaValues, 'canonical' | 'jsonLd'>,
  options?: { includeFaq?: boolean },
): PageMetaValues {
  return {
    ...values,
    canonical: canonicalFor(values.path),
    jsonLd: publicJsonLdText({ includeFaq: options?.includeFaq === true }),
  };
}

function guidePage(guide: (typeof GUIDES)[number]): PageMetaValues {
  if (guide.title.length >= 60) {
    throw new Error(`Guide title must be under 60 characters: ${guide.title}`);
  }
  if (guide.description.length >= 155) {
    throw new Error(`Guide description must be under 155 characters: ${guide.path}`);
  }
  return {
    path: guide.path,
    heading: guide.h1,
    title: guide.title,
    description: guide.description,
    ogType: 'article',
    canonical: canonicalFor(guide.path),
    jsonLd: guideJsonLdFor(guide),
  };
}

export const HOME_PAGE_HEAD: PageMetaValues = page({
  path: '/',
  heading: 'Property management for landlords and tenants',
  title: 'LushLands Management - Professional Property Management Platform',
  description:
    'Property management software for landlords and property managers in any country. Record properties, tenants, maintenance, and payments in one place, with optional audio and video tools.',
  keywords: 'property management, landlord, property manager, letting agent, tenant, maintenance, payments',
});

export const WELCOME_PAGE_HEAD: PageMetaValues = page({
  path: '/welcome',
  heading: 'Property management software for landlords in any country',
  title: 'Property Management Software for Landlords & Letting Agents | LushLands',
  description:
    'Property management software for landlords, letting agents, and property managers in any country. Track properties, tenants, maintenance, and rent payments. A free plan is available. Premium is 15 US dollars a month.',
});

export const FAQ_PAGE_HEAD: PageMetaValues = page({
  path: '/faq',
  heading: 'Frequently asked questions',
  title: 'FAQ | LushLands Management',
  description:
    'Answers about LushLands Management for landlords and property managers worldwide, including features, the free plan, Premium, payments, and AI audio.',
}, { includeFaq: true });

export const TERMS_PAGE_HEAD: PageMetaValues = page({
  path: '/terms',
  heading: 'Terms and Conditions',
  title: 'Terms and Conditions | LushLands Management',
  description:
    'Terms for using LushLands Management, property-management software for landlords and property managers worldwide.',
});

export const PRIVACY_PAGE_HEAD: PageMetaValues = page({
  path: '/privacy',
  heading: 'Privacy Policy',
  title: 'Privacy Policy | LushLands Management',
  description:
    'How LushLands Management handles account data, property records, Stripe payments, generated audio, and public-page analytics.',
});

export const DISCLAIMER_PAGE_HEAD: PageMetaValues = page({
  path: '/disclaimer',
  heading: 'Disclaimer',
  title: 'Disclaimer | LushLands Management',
  description:
    'LushLands Management is not legal, financial, or tax advice. You are responsible for local laws. AI and audio content may contain errors.',
});

export const TRACK_RENT_PAGE_HEAD: PageMetaValues = guidePage(GUIDES[0]);
export const MAINTENANCE_LOG_PAGE_HEAD: PageMetaValues = guidePage(GUIDES[1]);
export const TENANT_RECORDS_PAGE_HEAD: PageMetaValues = guidePage(GUIDES[2]);
export const LETTING_AGENTS_PAGE_HEAD: PageMetaValues = guidePage(GUIDES[3]);

export const PUBLIC_PAGES: readonly PageMetaValues[] = [
  HOME_PAGE_HEAD,
  WELCOME_PAGE_HEAD,
  FAQ_PAGE_HEAD,
  TERMS_PAGE_HEAD,
  PRIVACY_PAGE_HEAD,
  DISCLAIMER_PAGE_HEAD,
  TRACK_RENT_PAGE_HEAD,
  MAINTENANCE_LOG_PAGE_HEAD,
  TENANT_RECORDS_PAGE_HEAD,
  LETTING_AGENTS_PAGE_HEAD,
];

const pagesByPath = new Map<string, PageMetaValues>(PUBLIC_PAGES.map((entry) => [entry.path, entry]));

export function getPageHead(path: string): PageMetaValues {
  const normalized = path.replace(/\/+$/, '') || '/';
  const head = pagesByPath.get(normalized);
  if (!head) {
    throw new Error(`No public page head for ${path}`);
  }
  return head;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Static tags for one prerendered document. The font links stay outside this block. */
export function renderHead(page: PageMetaValues): string {
  const social = page.socialDescription ?? page.description;
  const lines = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
  ];

  if (page.keywords) {
    lines.push(`<meta name="keywords" content="${escapeHtml(page.keywords)}" />`);
  }

  lines.push(
    '<meta name="author" content="LushLands Management" />',
    `<meta property="og:type" content="${escapeHtml(page.ogType ?? 'website')}" />`,
    '<meta property="og:site_name" content="LushLands Management" />',
    `<meta property="og:url" content="${escapeHtml(page.canonical)}" />`,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(social)}" />`,
    `<meta property="og:image" content="${escapeHtml(OG_IMAGE)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:url" content="${escapeHtml(page.canonical)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(social)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(OG_IMAGE)}" />`,
    `<link rel="canonical" href="${escapeHtml(page.canonical)}" />`,
    `<script type="application/ld+json" data-seo="public">${page.jsonLd}</script>`,
  );

  return lines.join('\n    ');
}

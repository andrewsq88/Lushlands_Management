/**
 * Per-route document head copy.
 * Homepage strings match index.html. Welcome copy is the 25 Oct SEO draft.
 * Absolute URLs use www because the apex host 307-redirects there, and the
 * homepage canonical already points at www.
 */
export interface PageMetaValues {
  title: string;
  description: string;
  canonical: string;
  /** Open Graph and Twitter description. Defaults to `description`. */
  socialDescription?: string;
}

export const SITE_ORIGIN = 'https://www.lushlandsmanagement.com';

export const HOME_PAGE_HEAD: PageMetaValues = {
  title: 'LushLands Management - Professional Property Management Platform',
  description:
    'Professional property management platform for landlords and tenants with AI-powered features. Manage properties, tenants, maintenance, and payments with ease.',
  socialDescription:
    'Professional property management platform for landlords and tenants with AI-powered features.',
  canonical: `${SITE_ORIGIN}/`,
};

export const WELCOME_PAGE_HEAD: PageMetaValues = {
  title: 'Property Management Software for Landlords & Letting Agents | LushLands',
  description:
    'Track properties, tenants, maintenance requests and rent payments in one dashboard. Requests are prioritised automatically. Built for landlords and letting agents.',
  canonical: `${SITE_ORIGIN}/welcome`,
};

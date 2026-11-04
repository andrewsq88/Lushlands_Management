/** Indexable marketing and policy pages. Auth, payment, and dashboard routes are not included. */
export const PUBLIC_PATHS = ['/', '/welcome', '/faq', '/terms', '/privacy', '/disclaimer'] as const;

export type PublicPath = (typeof PUBLIC_PATHS)[number];

export const PUBLIC_PATH_SET = new Set<string>(PUBLIC_PATHS);

/**
 * Routes that must never appear in the sitemap.
 * /checkout is not a page today; Stripe returns to /payments. It is listed so a
 * checkout URL is still treated as private. /spa.html is the signed-in app shell.
 */
export const PRIVATE_PATHS = [
  '/auth',
  '/login',
  '/signup',
  '/checkout',
  '/properties',
  '/tenants',
  '/maintenance',
  '/payments',
  '/financing',
  '/down-payment',
  '/subscription',
  '/spa.html',
] as const;

import { PUBLIC_PAGES } from './pageMeta';
import { PRIVATE_PATHS } from './publicPaths';
import { SITE_ORIGIN, SITEMAP_LASTMOD } from './site';

function locFor(path: string): string {
  return path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
}

/** Sitemap of public routes only. Private, auth, payment, and checkout URLs are rejected. */
export function buildSitemapXml(): string {
  const blocks = PUBLIC_PAGES.map((page) => {
    const loc = locFor(page.path);
    return ['  <url>', `    <loc>${loc}</loc>`, `    <lastmod>${SITEMAP_LASTMOD}</lastmod>`, '  </url>'].join('\n');
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    blocks.join('\n'),
    '</urlset>',
    '',
  ].join('\n');

  for (const blocked of PRIVATE_PATHS) {
    const forbidden = locFor(blocked);
    if (xml.includes(forbidden)) {
      throw new Error(`Sitemap includes private route ${blocked}`);
    }
  }

  return xml;
}

export function buildRobotsTxt(): string {
  return `# Public pages are allowed by default:
# /, /welcome, /faq, /terms, /privacy, /disclaimer.
# The signed-in dashboard uses /, which is also the public homepage, so / stays allowed.
# Disallow auth, payment, checkout, and private dashboard routes.
# There is no /dashboard or /sign-in path.
# Sign-in is /auth, /login, and /signup. Stripe checkout returns to /payments.
# /checkout is disallowed so a checkout path is not crawled. /spa.html is the app shell.

User-agent: *
Disallow: /auth
Disallow: /login
Disallow: /signup
Disallow: /checkout
Disallow: /properties
Disallow: /tenants
Disallow: /maintenance
Disallow: /payments
Disallow: /financing
Disallow: /down-payment
Disallow: /subscription
Disallow: /spa.html

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;
}

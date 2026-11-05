import { PUBLIC_PAGES } from './pageMeta';
import { PRIVATE_PATHS, PUBLIC_PATHS } from './publicPaths';
import { SITE_ORIGIN, SITEMAP_LASTMOD } from './site';

/**
 * Crawlers that get their own group. A named group does not inherit rules from
 * User-agent: *, so each one repeats every private-route Disallow.
 * Disallow lines are listed before Allow lines so a first-match parser still
 * blocks auth, payment, and private routes.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ClaudeBot',
  'PerplexityBot',
  'Google-Extended',
] as const;

const AI_ALLOW_PATHS = [...PUBLIC_PATHS, '/llms.txt'] as const;

function disallowLines(): string {
  return PRIVATE_PATHS.map((path) => `Disallow: ${path}`).join('\n');
}

function allowLines(): string {
  return AI_ALLOW_PATHS.map((path) => `Allow: ${path}`).join('\n');
}

function agentGroup(agent: string, rules: string): string {
  return `User-agent: ${agent}\n${rules}`;
}

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
  const aiRules = `${disallowLines()}\n${allowLines()}`;
  const aiGroups = AI_CRAWLERS.map((agent) => agentGroup(agent, aiRules)).join('\n\n');

  return `# Public pages are allowed by default:
# /, /welcome, /faq, /terms, /privacy, /disclaimer.
# The signed-in dashboard uses /, which is also the public homepage, so / stays allowed.
# Disallow auth, payment, checkout, and private dashboard routes.
# There is no /dashboard or /sign-in path.
# Sign-in is /auth, /login, and /signup. Stripe checkout returns to /payments.
# /checkout is disallowed so a checkout path is not crawled. /spa.html is the app shell.
# GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, and Google-Extended each get
# explicit Allow entries for the public pages and /llms.txt, and the same Disallow list.

${aiGroups}

${agentGroup('*', disallowLines())}

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;
}

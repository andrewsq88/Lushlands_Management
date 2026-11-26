import { PUBLIC_PATHS } from './publicPaths';

/**
 * Last real content-change date for each public URL.
 * Used only when git history for that page's source files is not available
 * (for example a shallow checkout that does not contain the older commit).
 * Dates are the commit dates of the files that render the page, not a single
 * site-wide stamp. Pages whose copy changes in this branch use that change's
 * date. Pages that did not change stay on the earlier commit.
 */
export const SITEMAP_LASTMOD_FALLBACK: Record<string, string> = {
  '/': '2026-11-26',
  '/welcome': '2026-11-26',
  '/faq': '2026-11-11',
  '/terms': '2026-11-11',
  '/privacy': '2026-11-11',
  '/disclaimer': '2026-11-11',
  '/guides/track-rent-payments': '2026-11-26',
  '/guides/maintenance-log-template': '2026-11-26',
  '/guides/tenant-records': '2026-11-26',
  '/guides/property-management-for-letting-agents': '2026-11-26',
};

const HOME_SOURCES = [
  'src/components/public/PublicPage.tsx',
  'src/seo/pageMeta.ts',
  'src/seo/structuredData.ts',
] as const;

const LEGAL_SOURCES = [
  'src/components/public/legalPages.tsx',
  'src/seo/pageMeta.ts',
  'src/seo/structuredData.ts',
] as const;

const GUIDE_SOURCES = [
  'src/seo/guides.ts',
  'src/components/public/guidePages.tsx',
  'src/seo/pageMeta.ts',
] as const;

/** Source files whose latest commit date is the page's sitemap lastmod. */
export const SITEMAP_LASTMOD_SOURCES: Record<string, readonly string[]> = {
  '/': HOME_SOURCES,
  '/welcome': HOME_SOURCES,
  '/faq': ['src/components/public/legalPages.tsx', 'src/seo/faq.ts', 'src/seo/pageMeta.ts', 'src/seo/structuredData.ts'],
  '/terms': LEGAL_SOURCES,
  '/privacy': LEGAL_SOURCES,
  '/disclaimer': LEGAL_SOURCES,
  '/guides/track-rent-payments': GUIDE_SOURCES,
  '/guides/maintenance-log-template': GUIDE_SOURCES,
  '/guides/tenant-records': GUIDE_SOURCES,
  '/guides/property-management-for-letting-agents': GUIDE_SOURCES,
};

for (const path of PUBLIC_PATHS) {
  if (!SITEMAP_LASTMOD_FALLBACK[path] || !SITEMAP_LASTMOD_SOURCES[path]?.length) {
    throw new Error(`Sitemap lastmod is not configured for ${path}`);
  }
}

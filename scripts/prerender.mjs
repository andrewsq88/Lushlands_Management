import { createServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const shellPath = path.join(dist, 'index.html');
const shell = fs.readFileSync(shellPath, 'utf8');

const slotRe = /<div id="root" data-prerender-slot="app">\s*<\/div>/;
const headRe = /<!--app-head-->[\s\S]*?<!--\/app-head-->/;

if (!slotRe.test(shell)) {
  throw new Error('Built index.html is missing the prerender slot.');
}
if (!headRe.test(shell)) {
  throw new Error('Built index.html is missing app-head markers.');
}

fs.writeFileSync(path.join(dist, 'spa.html'), shell);

const REQUIRED_HEAD = [
  '<title>',
  'name="description"',
  'rel="canonical"',
  'property="og:title"',
  'property="og:description"',
  'property="og:url"',
  'property="og:image"',
  'name="twitter:card"',
  'name="twitter:title"',
  'name="twitter:description"',
  'type="application/ld+json"',
  '"@type":"Organization"',
  '"@type":"SoftwareApplication"',
  '"@type":"FAQPage"',
];

function inject(template, page) {
  if (!headRe.test(page.head) && page.head.includes('<script') && !page.head.includes('type="application/ld+json"')) {
    throw new Error(`Refusing non-JSON-LD script in head for ${page.path}`);
  }
  const scripts = page.head.match(/<script\b[^>]*>/g) ?? [];
  if (scripts.length !== 1 || !scripts[0].includes('type="application/ld+json"')) {
    throw new Error(`Public head for ${page.path} must contain only the JSON-LD script.`);
  }

  let document = template.replace(headRe, `<!--app-head-->\n    ${page.head}\n    <!--/app-head-->`);
  document = document.replace(slotRe, `<div id="root" data-ssg="true">${page.html}</div>`);
  if (document.includes('data-prerender-slot')) {
    throw new Error(`Prerender slot remained in ${page.path}`);
  }
  if (!document.includes('data-ssg="true"')) {
    throw new Error(`Prerender marker missing for ${page.path}`);
  }
  for (const token of REQUIRED_HEAD) {
    if (!document.includes(token)) {
      throw new Error(`${page.path} is missing ${token}`);
    }
  }
  if (!document.includes(`>${page.heading}<`)) {
    throw new Error(`${page.path} document is missing its heading`);
  }
  return document;
}

const server = await createServer({
  root,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

try {
  const pagesMod = await server.ssrLoadModule('/src/seo/prerenderPublicPages.tsx');
  const sitemapMod = await server.ssrLoadModule('/src/seo/sitemap.ts');
  const pages = pagesMod.renderAllPublicPages();
  const sitemap = sitemapMod.buildSitemapXml();
  const robots = sitemapMod.buildRobotsTxt();

  if (!sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
    throw new Error('Sitemap is missing its XML declaration.');
  }
  if (!sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
    throw new Error('Sitemap is missing the urlset namespace.');
  }
  if (!robots.includes('Sitemap: https://www.lushlandsmanagement.com/sitemap.xml')) {
    throw new Error('robots.txt does not reference the sitemap.');
  }

  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (locs.length !== pages.length) {
    throw new Error(`Sitemap has ${locs.length} URLs and prerender produced ${pages.length} pages.`);
  }

  for (const page of pages) {
    const document = inject(shell, page);
    const outfile = page.path === '/'
      ? path.join(dist, 'index.html')
      : path.join(dist, page.path.slice(1), 'index.html');
    fs.mkdirSync(path.dirname(outfile), { recursive: true });
    fs.writeFileSync(outfile, document);

    const expectedLoc = page.path === '/'
      ? 'https://www.lushlandsmanagement.com/'
      : `https://www.lushlandsmanagement.com${page.path}`;
    if (!locs.includes(expectedLoc)) {
      throw new Error(`Sitemap is missing ${expectedLoc}`);
    }
  }

  fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(dist, 'robots.txt'), robots);

  const spa = fs.readFileSync(path.join(dist, 'spa.html'), 'utf8');
  if (spa.includes('data-ssg="true"') || !spa.includes('data-prerender-slot="app"')) {
    throw new Error('spa.html must stay an empty shell.');
  }

  console.log(`Prerendered ${pages.length} public pages and wrote sitemap.xml`);
} finally {
  await server.close();
}

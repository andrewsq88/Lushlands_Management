import { createServer, loadEnv } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Same rule as src/lib/adsConfig.ts: ads are on unless VITE_ADS_ENABLED is false/0/off/no.
const adsFlag = loadEnv('production', root, 'VITE_').VITE_ADS_ENABLED;
const ADS_ENABLED = adsFlag === undefined || !['false', '0', 'off', 'no'].includes(adsFlag.trim().toLowerCase());
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
];

function requiredHead(page) {
  const base = [...REQUIRED_HEAD, '"@type":"Organization"', '"@type":"WebSite"'];
  if (page.path.startsWith('/guides/')) {
    return [
      ...base,
      '"@type":"Article"',
      '"@type":"FAQPage"',
      '"@type":"HowTo"',
      '"@type":"BreadcrumbList"',
    ];
  }
  const tokens = [...base, '"@type":"SoftwareApplication"'];
  if (page.path === '/faq') tokens.push('"@type":"FAQPage"');
  return tokens;
}

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
  for (const token of requiredHead(page)) {
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
  if (
    spa.includes('thedailypulse.space') ||
    spa.includes('weeklymealplan.space') ||
    spa.includes('Explore our other sites')
  ) {
    throw new Error('spa.html must not include the public other-sites footer.');
  }

  const verification = 'name="google-site-verification" content="fJ2D1sGWNNQ-R0gu8Z7nXCsMms8ea330BGCVDrzniMs"';
  if (!shell.includes(verification) || !spa.includes(verification)) {
    throw new Error('google-site-verification tag was removed from the shell.');
  }

  const llms = fs.readFileSync(path.join(dist, 'llms.txt'), 'utf8');
  if (/<!doctype|<html|id="root"|<script/i.test(llms)) {
    throw new Error('llms.txt must be plain text, not the SPA shell.');
  }
  if (!/property management software/i.test(llms) || !/any country/i.test(llms)) {
    throw new Error('llms.txt must describe the product for landlords in any country.');
  }
  for (const publicPath of [
    '/',
    '/welcome',
    '/faq',
    '/terms',
    '/privacy',
    '/disclaimer',
    '/guides/track-rent-payments',
    '/guides/maintenance-log-template',
    '/guides/tenant-records',
    '/guides/property-management-for-letting-agents',
  ]) {
    const url = publicPath === '/'
      ? 'https://www.lushlandsmanagement.com/'
      : `https://www.lushlandsmanagement.com${publicPath}`;
    if (!llms.includes(`](${url})`) && !llms.includes(`](${url}):`)) {
      throw new Error(`llms.txt is missing ${url}`);
    }
  }

  const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const spaRewrite = vercel.rewrites?.find((rule) => rule.destination === '/spa.html');
  if (!spaRewrite) {
    throw new Error('SPA rewrite is missing.');
  }
  const rewritePattern = new RegExp(`^${spaRewrite.source}$`);
  if (rewritePattern.test('/llms.txt')) {
    throw new Error('SPA rewrite still matches /llms.txt.');
  }
  for (const route of ['/', '/welcome', '/auth', '/payments', '/spa.html']) {
    if (!rewritePattern.test(route)) {
      throw new Error(`SPA rewrite no longer matches ${route}.`);
    }
  }
  const llmsType = vercel.headers
    ?.find((rule) => rule.source === '/llms.txt')
    ?.headers?.find((header) => header.key.toLowerCase() === 'content-type')?.value ?? '';
  if (!llmsType.toLowerCase().startsWith('text/plain')) {
    throw new Error('/llms.txt must declare Content-Type text/plain.');
  }

  const indexNowKey = 'aa07e5ec709905f895fcccc55555a4c9';
  const indexNowFile = `${indexNowKey}.txt`;
  const indexNowPath = `/${indexNowFile}`;
  const indexNowBody = fs.readFileSync(path.join(dist, indexNowFile));
  if (!indexNowBody.equals(Buffer.from(indexNowKey))) {
    throw new Error(`${indexNowFile} must be the key alone, with no trailing newline.`);
  }
  if (/<!doctype|<html|id="root"|<script/i.test(indexNowBody.toString('utf8'))) {
    throw new Error(`${indexNowFile} must be plain text, not the SPA shell.`);
  }
  if (rewritePattern.test(indexNowPath)) {
    throw new Error(`SPA rewrite still matches ${indexNowPath}.`);
  }
  const indexNowType = vercel.headers
    ?.find((rule) => rule.source === indexNowPath)
    ?.headers?.find((header) => header.key.toLowerCase() === 'content-type')?.value ?? '';
  if (!indexNowType.toLowerCase().startsWith('text/plain')) {
    throw new Error(`${indexNowPath} must declare Content-Type text/plain.`);
  }

  const dailyPulseHref =
    'href="https://thedailypulse.space/?utm_source=lushlands&amp;utm_medium=crosslink&amp;utm_campaign=footer-2026-11"';
  const weeklyMealPlanHref =
    'href="https://www.weeklymealplan.space/?utm_source=lushlands&amp;utm_medium=crosslink&amp;utm_campaign=footer-2026-11"';
  const otherSitesTitle = 'Explore our other sites';

  const aiCrawlers = ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'];
  for (const bot of aiCrawlers) {
    if (!robots.includes(`User-agent: ${bot}\n`)) {
      throw new Error(`robots.txt is missing ${bot}.`);
    }
  }
  const privatePaths = [
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
  ];
  for (const blocked of privatePaths) {
    const count = robots.split(`Disallow: ${blocked}\n`).length - 1;
    if (count < aiCrawlers.length + 1) {
      throw new Error(`robots.txt dropped a Disallow for ${blocked}.`);
    }
  }
  for (const allowed of [
    '/\n',
    '/welcome\n',
    '/faq\n',
    '/terms\n',
    '/privacy\n',
    '/disclaimer\n',
    '/guides/track-rent-payments\n',
    '/guides/maintenance-log-template\n',
    '/guides/tenant-records\n',
    '/guides/property-management-for-letting-agents\n',
    '/llms.txt\n',
  ]) {
    const count = robots.split(`Allow: ${allowed}`).length - 1;
    if (count < aiCrawlers.length) {
      throw new Error(`robots.txt is missing Allow: ${allowed.trim()} for an AI crawler.`);
    }
  }

  const logoName = 'possible-property-hub-logo.png';
  if (!fs.existsSync(path.join(dist, logoName))) {
    throw new Error(`Missing ${logoName}.`);
  }
  if (fs.existsSync(path.join(dist, 'Possible Property Hub Logo.png'))) {
    throw new Error('The spaced logo filename is still in the build output.');
  }

  const home = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const welcome = fs.readFileSync(path.join(dist, 'welcome', 'index.html'), 'utf8');
  for (const [route, html] of [['/', home], ['/welcome', welcome]]) {
    if (!html.includes(verification)) {
      throw new Error(`${route} dropped google-site-verification.`);
    }
    if (!html.includes(otherSitesTitle) || !html.includes(dailyPulseHref) || !html.includes(weeklyMealPlanHref)) {
      throw new Error(`${route} is missing the other-sites footer.`);
    }
    for (const guidePath of [
      '/guides/track-rent-payments',
      '/guides/maintenance-log-template',
      '/guides/tenant-records',
      '/guides/property-management-for-letting-agents',
    ]) {
      if (!html.includes(`href="${guidePath}"`)) {
        throw new Error(`${route} footer is missing ${guidePath}`);
      }
    }
    if (html.split(dailyPulseHref).length - 1 !== 1 || html.split(weeklyMealPlanHref).length - 1 !== 1) {
      throw new Error(`${route} must contain each other-sites link once.`);
    }
    if (!/any country/i.test(html) || !/property managers/i.test(html)) {
      throw new Error(`${route} is missing the landlord and international copy.`);
    }
    if (ADS_ENABLED) {
      if (!html.includes('data-ad-slot="300x250-below-signup"') || !html.includes('data-ad-slot="native-above-footer"')) {
        throw new Error(`${route} is missing an ad slot.`);
      }
    } else if (html.includes('data-ad-slot=')) {
      throw new Error(`${route} still renders an ad slot with ads switched off.`);
    }
    if (!html.includes(logoName) || html.includes('Possible Property Hub Logo')) {
      throw new Error(`${route} still points at the old logo filename.`);
    }
  }
  for (const route of ['faq', 'terms', 'privacy', 'disclaimer']) {
    const html = fs.readFileSync(path.join(dist, route, 'index.html'), 'utf8');
    if (html.includes('data-ad-slot=')) {
      throw new Error(`${route} must not include an ad slot.`);
    }
    if (!html.includes(otherSitesTitle) || !html.includes(dailyPulseHref) || !html.includes(weeklyMealPlanHref)) {
      throw new Error(`${route} is missing the other-sites footer.`);
    }
    if (!html.includes(verification)) {
      throw new Error(`${route} dropped google-site-verification.`);
    }
  }

  const guideChecks = [
    {
      dir: 'guides/track-rent-payments',
      h1: 'How to track rent payments as a landlord',
      title: 'How to Track Rent Payments as a Landlord',
      button: 'Start tracking rent',
      steps: 7,
      question: 'What should a landlord record for each rent payment?',
    },
    {
      dir: 'guides/maintenance-log-template',
      h1: 'Rental property maintenance log: template and guide',
      title: 'Rental Property Maintenance Log Template',
      button: 'Start my maintenance log',
      steps: 6,
      question: 'What should a landlord maintenance log include?',
    },
    {
      dir: 'guides/tenant-records',
      h1: 'How to keep tenant records',
      title: 'How to Keep Tenant Records as a Landlord',
      button: 'Organise my tenant records',
      steps: 6,
      question: 'What records should a landlord keep for each tenant?',
    },
    {
      dir: 'guides/property-management-for-letting-agents',
      h1: 'Property management for letting agents',
      title: 'Property Management Software for Letting Agents',
      button: 'Try LushLands',
      steps: 6,
      question: 'Can letting agents use LushLands?',
    },
  ];
  const sitemapXml = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
  for (const guide of guideChecks) {
    const html = fs.readFileSync(path.join(dist, guide.dir, 'index.html'), 'utf8');
    const canonical = `https://www.lushlandsmanagement.com/${guide.dir}`;
    if (!html.includes(`<title>${guide.title}</title>`)) {
      throw new Error(`${guide.dir} title does not match the approved copy.`);
    }
    if ((html.match(/<h1\b/g) ?? []).length !== 1 || !html.includes(`>${guide.h1}<`)) {
      throw new Error(`${guide.dir} must have exactly one H1.`);
    }
    if (!html.includes('Short answer:') || !html.includes(`<h3`) || !html.includes(guide.question)) {
      throw new Error(`${guide.dir} is missing the short answer or FAQ.`);
    }
    if ((html.match(/<h3\b/g) ?? []).length !== 5) {
      throw new Error(`${guide.dir} must show five FAQ questions.`);
    }
    if (ADS_ENABLED) {
      const buttonAt = html.indexOf(`>${guide.button}</a>`);
      const firstAd = html.indexOf('data-ad-slot=');
      const secondAd = html.indexOf('data-ad-slot=', firstAd + 1);
      const footerAt = html.indexOf('<footer');
      if (buttonAt < 0 || firstAd < 0 || secondAd < 0 || !(buttonAt < firstAd && firstAd < secondAd && secondAd < footerAt)) {
        throw new Error(`${guide.dir} ads must be the two slots below the main button and above the footer.`);
      }
      if ((html.match(/data-ad-slot=/g) ?? []).length !== 2) {
        throw new Error(`${guide.dir} must have exactly two ad slots.`);
      }
      if (html.slice(footerAt).includes('data-ad-slot=')) {
        throw new Error(`${guide.dir} has an ad inside the footer.`);
      }
    } else if (html.includes('data-ad-slot=')) {
      throw new Error(`${guide.dir} still renders an ad slot with ads switched off.`);
    }
    if (!html.includes('href="/auth"') || !html.includes(`rel="canonical" href="${canonical}"`)) {
      throw new Error(`${guide.dir} is missing /auth or its canonical URL.`);
    }
    if (!html.includes('"@type":"FAQPage"') || !html.includes('"@type":"HowTo"') || !html.includes('"@type":"BreadcrumbList"') || !html.includes('"@type":"Article"')) {
      throw new Error(`${guide.dir} JSON-LD is missing a required type.`);
    }
    if ((html.match(/"@type":"HowToStep"/g) ?? []).length !== guide.steps) {
      throw new Error(`${guide.dir} HowTo step count does not match the numbered list.`);
    }
    if (/Premium|affiliate|5 properties|property limit/i.test(html)) {
      throw new Error(`${guide.dir} includes a Premium, property-limit, or affiliate claim.`);
    }
    if (!sitemapXml.includes(`<loc>${canonical}</loc>`)) {
      throw new Error(`Sitemap is missing ${canonical}`);
    }
    if (!html.includes('Explore our other sites')) {
      throw new Error(`${guide.dir} is missing the public footer.`);
    }
  }
  if (spa.includes('Start tracking rent') || spa.includes('Try LushLands')) {
    throw new Error('spa.html must not include the public guides.');
  }

  const origin = 'https://www.lushlandsmanagement.com';
  const seenTitles = new Map();
  const seenDescriptions = new Map();
  const softwareDescription =
    'Web software for landlords and property managers to record properties, occupants, maintenance, and payments. Free covers up to 5 properties. Premium is unlimited.';

  function attrValues(html, pattern) {
    return [...html.matchAll(pattern)].map((match) => match[1]);
  }

  function markupHas(html, value) {
    const escaped = value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return html.includes(value) || html.includes(escaped);
  }

  function oneValue(html, pattern, label, filePath) {
    const values = attrValues(html, pattern);
    if (values.length !== 1) {
      throw new Error(`${filePath} has ${values.length} ${label} tags`);
    }
    return values[0];
  }

  for (const page of pages) {
    const filePath = page.path === '/' ? 'index.html' : `${page.path.slice(1)}/index.html`;
    const html = fs.readFileSync(path.join(dist, filePath), 'utf8');
    const expectedCanonical = page.path === '/' ? `${origin}/` : `${origin}${page.path}`;
    const title = oneValue(html, /<title>([^<]*)<\/title>/g, 'title', page.path);
    const description = oneValue(html, /<meta name="description" content="([^"]*)"/g, 'description', page.path);
    const canonical = oneValue(html, /<link rel="canonical" href="([^"]+)"/g, 'canonical', page.path);
    const ogUrl = oneValue(html, /<meta property="og:url" content="([^"]+)"/g, 'og:url', page.path);
    const ogTitle = oneValue(html, /<meta property="og:title" content="([^"]+)"/g, 'og:title', page.path);
    const ogDescription = oneValue(html, /<meta property="og:description" content="([^"]+)"/g, 'og:description', page.path);
    const twitterUrl = oneValue(html, /<meta name="twitter:url" content="([^"]+)"/g, 'twitter:url', page.path);
    const twitterTitle = oneValue(html, /<meta name="twitter:title" content="([^"]+)"/g, 'twitter:title', page.path);
    const twitterDescription = oneValue(html, /<meta name="twitter:description" content="([^"]+)"/g, 'twitter:description', page.path);
    if (!title.trim() || !description.trim()) {
      throw new Error(`${page.path} is missing a title or description`);
    }
    if (seenTitles.has(title)) {
      throw new Error(`${page.path} repeats the title of ${seenTitles.get(title)}`);
    }
    if (seenDescriptions.has(description)) {
      throw new Error(`${page.path} repeats the description of ${seenDescriptions.get(description)}`);
    }
    seenTitles.set(title, page.path);
    seenDescriptions.set(description, page.path);
    if (canonical !== expectedCanonical || ogUrl !== expectedCanonical || twitterUrl !== expectedCanonical) {
      throw new Error(`${page.path} canonical does not match its own www URL`);
    }
    if (ogTitle !== title || twitterTitle !== title || ogDescription !== description || twitterDescription !== description) {
      throw new Error(`${page.path} Open Graph or Twitter tags conflict with the title or description`);
    }

    const jsonScripts = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
    if (jsonScripts.length !== 1) {
      throw new Error(`${page.path} has ${jsonScripts.length} JSON-LD scripts`);
    }
    let data;
    try {
      data = JSON.parse(jsonScripts[0][1]);
    } catch (error) {
      throw new Error(`${page.path} JSON-LD does not parse: ${error.message}`);
    }
    const graph = data['@graph'];
    if (!Array.isArray(graph)) {
      throw new Error(`${page.path} JSON-LD is missing @graph`);
    }
    const byType = new Map();
    for (const node of graph) {
      const key = node['@type'];
      if (byType.has(key)) {
        throw new Error(`${page.path} has more than one ${key} node`);
      }
      byType.set(key, node);
    }
    const organization = byType.get('Organization');
    const website = byType.get('WebSite');
    if (!organization || organization.name !== 'LushLands Management' || organization.url !== `${origin}/` || organization.logo !== `${origin}/possible-property-hub-logo.png`) {
      throw new Error(`${page.path} Organization JSON-LD is missing a published fact`);
    }
    if (organization.sameAs || organization.contactPoint || organization.email) {
      throw new Error(`${page.path} Organization JSON-LD invented contact or social details`);
    }
    if (!website || website.name !== 'LushLands Management' || website.url !== `${origin}/` || website.publisher?.['@id'] !== `${origin}/#organization`) {
      throw new Error(`${page.path} WebSite JSON-LD is incomplete`);
    }
    if (website.sameAs || website.potentialAction) {
      throw new Error(`${page.path} WebSite JSON-LD invented a profile or search action`);
    }
    const hasFaqSection = page.path === '/faq' || page.path.startsWith('/guides/');
    const faq = byType.get('FAQPage');
    if (hasFaqSection) {
      if (!faq || !Array.isArray(faq.mainEntity) || faq.mainEntity.length < 1) {
        throw new Error(`${page.path} is missing FAQPage questions`);
      }
      for (const question of faq.mainEntity) {
        const answer = question.acceptedAnswer?.text;
        if (!question.name || !answer || !markupHas(html, question.name) || !markupHas(html, answer)) {
          throw new Error(`${page.path} FAQPage text does not match the visible FAQ`);
        }
      }
    } else if (faq) {
      throw new Error(`${page.path} has FAQPage without a visible FAQ section`);
    }
    if (page.path.startsWith('/guides/')) {
      const article = byType.get('Article');
      const breadcrumb = byType.get('BreadcrumbList');
      const howTo = byType.get('HowTo');
      if (!article?.headline || !article.description || !article.datePublished || article.author?.['@id'] !== `${origin}/#organization` || article.publisher?.['@id'] !== `${origin}/#organization`) {
        throw new Error(`${page.path} Article JSON-LD is incomplete`);
      }
      if (!markupHas(html, article.headline) || !markupHas(html, article.description)) {
        throw new Error(`${page.path} Article JSON-LD does not match the visible heading or summary`);
      }
      const crumbs = breadcrumb?.itemListElement;
      if (!Array.isArray(crumbs) || crumbs.length !== 2 || crumbs[0].name !== 'Home' || crumbs[0].item !== `${origin}/` || crumbs[1].item !== expectedCanonical) {
        throw new Error(`${page.path} BreadcrumbList does not match the visible breadcrumb`);
      }
      if (!howTo?.name || howTo.name !== article.headline || !Array.isArray(howTo.step) || howTo.step.some((step) => {
        const detail = step.text?.startsWith(`${step.name} `) ? step.text.slice(step.name.length + 1) : '';
        return !step.name || !detail || !markupHas(html, step.name) || !markupHas(html, detail);
      })) {
        throw new Error(`${page.path} HowTo JSON-LD does not match the numbered steps`);
      }
      if (byType.has('SoftwareApplication')) {
        throw new Error(`${page.path} must not add the application pricing block`);
      }
    } else {
      const software = byType.get('SoftwareApplication');
      if (!software || software.description !== softwareDescription) {
        throw new Error(`${page.path} changed the existing application description`);
      }
    }
  }

  if ((spa.match(/<link rel="canonical"/g) ?? []).length !== 1) {
    throw new Error('spa.html does not have exactly one canonical');
  }
  if (spa.includes('name="robots"') || spa.includes('noindex')) {
    throw new Error('spa.html robots meta changed');
  }

  console.log(`Prerendered ${pages.length} public pages and wrote sitemap.xml (ads ${ADS_ENABLED ? 'on' : 'off'})`);
} finally {
  await server.close();
}

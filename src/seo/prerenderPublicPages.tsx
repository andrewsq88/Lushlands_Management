import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { PublicPage } from '../components/public/PublicPage';
import { PUBLIC_PAGES, renderHead } from './pageMeta';

export interface PrerenderedPage {
  path: string;
  html: string;
  head: string;
  heading: string;
}

function renderPage(path: string): string {
  return renderToString(
    <StrictMode>
      <PublicPage path={path} signedIn={false} />
    </StrictMode>,
  );
}

/** Server-rendered public documents. Auth and payment screens are not included. */
export function renderAllPublicPages(): PrerenderedPage[] {
  return PUBLIC_PAGES.map((page) => {
    const html = renderPage(page.path);
    const again = renderPage(page.path);
    if (html !== again) {
      throw new Error(`Unstable prerender HTML for ${page.path}`);
    }
    if (!html.includes(`>${page.heading}<`)) {
      throw new Error(`Prerender for ${page.path} is missing its heading`);
    }
    if (html.includes('<script')) {
      throw new Error(`Prerender for ${page.path} includes a script tag`);
    }
    return {
      path: page.path,
      html,
      head: renderHead(page),
      heading: page.heading,
    };
  });
}

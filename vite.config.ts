import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { PUBLIC_PATHS } from './src/seo/publicPaths';

/**
 * Preview matches production: public routes are static files, everything else
 * is the empty app shell. Dev still uses index.html and client-side routes.
 */
function previewLikeProduction(): Plugin {
  const publicPaths = new Set<string>(PUBLIC_PATHS);

  return {
    name: 'preview-like-production',
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          next();
          return;
        }

        const [pathname, query = ''] = (req.url ?? '/').split('?');
        if (
          pathname.startsWith('/assets/') ||
          pathname.startsWith('/@') ||
          pathname.includes('.')
        ) {
          next();
          return;
        }

        if (pathname.length > 1 && pathname.endsWith('/')) {
          const target = pathname.replace(/\/+$/, '');
          res.statusCode = 308;
          res.setHeader('Location', query ? `${target}?${query}` : target);
          res.end();
          return;
        }

        const path = pathname.replace(/\/+$/, '') || '/';
        if (path !== '/' && publicPaths.has(path)) {
          // Vercel serves welcome/index.html at /welcome. Vite's fallback would
          // otherwise return the homepage document for that clean URL.
          req.url = query ? `${path}/index.html?${query}` : `${path}/index.html`;
        } else if (!publicPaths.has(path)) {
          req.url = query ? `/spa.html?${query}` : '/spa.html';
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), previewLikeProduction()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

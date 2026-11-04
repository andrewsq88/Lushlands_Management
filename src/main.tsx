import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.tsx';
import { PublicShell } from './PublicShell.tsx';
import { PUBLIC_PATH_SET } from './seo/publicPaths';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element missing');
}

function hasStoredSession(): boolean {
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('sb-') || !key.endsWith('-auth-token')) continue;
      const raw = localStorage.getItem(key);
      if (raw && raw.includes('"access_token"')) return true;
    }
  } catch {
    return false;
  }
  return false;
}

if (window.location.pathname.length > 1 && window.location.pathname.endsWith('/')) {
  const next = window.location.pathname.replace(/\/+$/, '') + window.location.search + window.location.hash;
  window.history.replaceState(null, '', next);
}

const path = window.location.pathname.replace(/\/+$/, '') || '/';
const storedSession = hasStoredSession();
const prerendered = rootEl.dataset.ssg === 'true';
const hydratePublic = prerendered && PUBLIC_PATH_SET.has(path) && !(path === '/' && storedSession);

if (hydratePublic) {
  hydrateRoot(
    rootEl,
    <StrictMode>
      <PublicShell />
    </StrictMode>,
  );
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <App assumeSignedIn={storedSession && path === '/'} />
    </StrictMode>,
  );
}

import { PageMeta } from './PageMeta';
import { PublicPage } from './public/PublicPage';
import { useAuth } from '../hooks/useAuth';
import { getPageHead } from '../seo/pageMeta';

/**
 * Client wrapper for a public route. The first render assumes signed out so it
 * matches the prerendered HTML. Ads stay inside PublicPage and only on / and /welcome.
 */
export function PublicLanding({ path }: { path: string }) {
  const { user, loading } = useAuth();
  const head = getPageHead(path);

  return (
    <>
      <PageMeta {...head} />
      <PublicPage path={path} signedIn={!loading && Boolean(user)} />
    </>
  );
}

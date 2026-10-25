import { usePageMeta } from '../hooks/usePageMeta';
import { PageMetaValues } from '../seo/pageMeta';

/** Route-level document head. Renders nothing. */
export function PageMeta(props: PageMetaValues) {
  usePageMeta(props);
  return null;
}

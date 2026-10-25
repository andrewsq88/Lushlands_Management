import { useLayoutEffect } from 'react';
import { PageMetaValues } from '../seo/pageMeta';

interface MetaSlot {
  attribute: 'name' | 'property';
  key: string;
  content: string;
}

interface MetaSnapshot {
  element: HTMLMetaElement;
  created: boolean;
  previous: string | null;
}

/**
 * Browsers may expose `name="twitter:*"` meta tags as `property` instead.
 * Match either attribute so an existing tag is updated, not duplicated.
 */
function matchingMetas(key: string): HTMLMetaElement[] {
  return Array.from(document.head.querySelectorAll<HTMLMetaElement>('meta')).filter(
    (node) => node.getAttribute('name') === key || node.getAttribute('property') === key,
  );
}

function applyMeta(slot: MetaSlot): MetaSnapshot[] {
  const matches = matchingMetas(slot.key);

  if (matches.length === 0) {
    const element = document.createElement('meta');
    element.setAttribute(slot.attribute, slot.key);
    element.setAttribute('content', slot.content);
    document.head.appendChild(element);
    return [{ element, created: true, previous: null }];
  }

  return matches.map((element) => {
    const previous = element.getAttribute('content');
    element.setAttribute('content', slot.content);
    return { element, created: false, previous };
  });
}

function restoreMeta(snapshot: MetaSnapshot) {
  if (snapshot.created) {
    snapshot.element.remove();
    return;
  }

  if (snapshot.previous === null) {
    snapshot.element.removeAttribute('content');
    return;
  }

  snapshot.element.setAttribute('content', snapshot.previous);
}

/**
 * Sets the document title, description, Open Graph tags, Twitter tags, and
 * canonical for one route. Restores the previous head on cleanup so another
 * route (including the homepage tags from index.html) is left unchanged.
 */
export function usePageMeta({
  title,
  description,
  canonical,
  socialDescription,
}: PageMetaValues) {
  const social = socialDescription ?? description;

  useLayoutEffect(() => {
    const previousTitle = document.title;
    const slots: MetaSlot[] = [
      { attribute: 'name', key: 'description', content: description },
      { attribute: 'property', key: 'og:title', content: title },
      { attribute: 'property', key: 'og:description', content: social },
      { attribute: 'property', key: 'og:url', content: canonical },
      { attribute: 'name', key: 'twitter:title', content: title },
      { attribute: 'name', key: 'twitter:description', content: social },
      { attribute: 'name', key: 'twitter:url', content: canonical },
    ];

    const snapshots = slots.flatMap(applyMeta);

    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const createdCanonical = canonicalLink === null;
    const previousCanonical = canonicalLink?.getAttribute('href') ?? null;

    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);

    document.title = title;

    return () => {
      document.title = previousTitle;
      snapshots.forEach(restoreMeta);

      if (createdCanonical) {
        canonicalLink.remove();
        return;
      }

      if (previousCanonical === null) {
        canonicalLink.removeAttribute('href');
        return;
      }

      canonicalLink.setAttribute('href', previousCanonical);
    };
  }, [title, description, canonical, social]);
}

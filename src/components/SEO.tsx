import { useEffect } from 'react';
import { trackPageViewOnce } from '../utils/analytics';
import { INDEXABLE_ROBOTS, NOINDEX_ROBOTS } from '../utils/seo';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object;
  canonical?: string;
  noindex?: boolean;
}

const defaultMeta = {
  title: 'Comic Collection | comics.banast.as',
  description: 'Browse a personal comic-book collection with cover art, grades, values, variants, artists, and storage details.',
  keywords: 'comic book collection, comic covers, graded comics, slabbed comics, variant covers, comic values',
  image: 'https://comics.banast.as/og-image.jpg',
  url: 'https://comics.banast.as/',
  type: 'website',
};

const upsertMeta = (attribute: 'name' | 'property', key: string, content: string) => {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const upsertCanonical = (href: string) => {
  let element = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

const upsertStructuredData = (structuredJson: string) => {
  const id = 'comics-structured-data';
  const existing = document.getElementById(id);

  if (!structuredJson) {
    existing?.remove();
    return;
  }

  const element = existing || document.createElement('script');
  element.id = id;
  element.setAttribute('type', 'application/ld+json');
  if (element.textContent !== structuredJson) element.textContent = structuredJson;

  if (!existing) {
    document.head.appendChild(element);
  }
};

export function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  structuredData,
  canonical,
  noindex = false,
}: SEOProps) {
  const seo = {
    title: title ? `${title} | comics.banast.as` : defaultMeta.title,
    description: description || defaultMeta.description,
    keywords: keywords || defaultMeta.keywords,
    image: image || defaultMeta.image,
    url: url || defaultMeta.url,
    type: type || defaultMeta.type,
  };

  // Compare by content so callers can build structured data inline without rewriting the head each render.
  const structuredJson = structuredData ? JSON.stringify(structuredData) : '';

  useEffect(() => {
    document.title = seo.title;

    upsertMeta('name', 'title', seo.title);
    upsertMeta('name', 'description', seo.description);
    upsertMeta('name', 'keywords', seo.keywords);
    upsertMeta('name', 'robots', noindex ? NOINDEX_ROBOTS : INDEXABLE_ROBOTS);
    if (noindex) document.querySelector('link[rel="canonical"]')?.remove();
    else upsertCanonical(canonical || seo.url);

    upsertMeta('property', 'og:type', seo.type);
    upsertMeta('property', 'og:url', seo.url);
    upsertMeta('property', 'og:title', seo.title);
    upsertMeta('property', 'og:description', seo.description);
    upsertMeta('property', 'og:image', seo.image);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:url', seo.url);
    upsertMeta('name', 'twitter:title', seo.title);
    upsertMeta('name', 'twitter:description', seo.description);
    upsertMeta('name', 'twitter:image', seo.image);

    upsertStructuredData(structuredJson);
  }, [noindex, canonical, seo.description, seo.image, seo.keywords, seo.title, seo.type, seo.url, structuredJson]);

  // Runs after every render (declared after the metadata effect) so client-side navigations that
  // keep the same title, such as a new search, are still recorded once.
  useEffect(() => {
    trackPageViewOnce(`${window.location.pathname}${window.location.search}`, document.title);
  });

  return null;
}

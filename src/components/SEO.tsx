import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object;
  canonical?: string;
}

const defaultMeta = {
  title: 'comics.banast.as - Track, Organize & Value Your Comics',
  description: 'Professional comic book collection management system. Track your comics, monitor values, organize by series, artists, and storage locations. Discover variant covers, slabbed comics, and signed editions in your personal collection.',
  keywords: 'comic book collection, comic tracker, comic book manager, comic book database, comic book organizer, comic valuation, comic grading, variant covers, slabbed comics, comic storage',
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

const upsertStructuredData = (structuredData?: object) => {
  const id = 'comics-structured-data';
  const existing = document.getElementById(id);

  if (!structuredData) {
    existing?.remove();
    return;
  }

  const element = existing || document.createElement('script');
  element.id = id;
  element.setAttribute('type', 'application/ld+json');
  element.textContent = JSON.stringify(structuredData);

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
}: SEOProps) {
  const seo = {
    title: title ? `${title} | comics.banast.as` : defaultMeta.title,
    description: description || defaultMeta.description,
    keywords: keywords || defaultMeta.keywords,
    image: image || defaultMeta.image,
    url: url || defaultMeta.url,
    type: type || defaultMeta.type,
  };

  useEffect(() => {
    document.title = seo.title;

    upsertMeta('name', 'title', seo.title);
    upsertMeta('name', 'description', seo.description);
    upsertMeta('name', 'keywords', seo.keywords);
    upsertCanonical(canonical || seo.url);

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

    upsertStructuredData(structuredData);
  }, [canonical, seo.description, seo.image, seo.keywords, seo.title, seo.type, seo.url, structuredData]);

  return null;
}

import { Helmet } from 'react-helmet-async';

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

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seo.title}</title>
      <meta name="title" content={seo.title} />
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonical || seo.url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={seo.type} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

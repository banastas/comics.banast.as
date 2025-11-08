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
  title: 'Comic Collection Manager - Track, Organize & Value Your Comics',
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
    title: title ? `${title} | Comic Collection Manager` : defaultMeta.title,
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

// Helper function to create SEO-friendly comic slug
function createComicSlug(comic: { id: string; seriesName: string; issueNumber: string | number; isVariant?: boolean }): string {
  const seriesSlug = comic.seriesName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const issueSlug = `issue-${comic.issueNumber}`;
  const variantSlug = comic.isVariant ? '-variant' : '';

  // Extract the numeric ID from comic.id (e.g., "comic-728" -> "728")
  const idMatch = comic.id.match(/\d+$/);
  const idSuffix = idMatch ? `-${idMatch[0]}` : '';

  return `${seriesSlug}-${issueSlug}${variantSlug}${idSuffix}`;
}

// Helper function to generate comic book structured data
export function generateComicStructuredData(comic: {
  id: string;
  title: string;
  seriesName: string;
  issueNumber: string | number;
  releaseDate: string;
  coverImageUrl: string;
  coverArtist?: string;
  currentValue?: number;
  grade?: string;
  signedBy?: string[];
  isVariant?: boolean;
}) {
  const slug = createComicSlug(comic);
  return {
    '@context': 'https://schema.org',
    '@type': 'ComicIssue',
    name: comic.title,
    issueNumber: comic.issueNumber,
    datePublished: comic.releaseDate,
    image: comic.coverImageUrl,
    url: `https://comics.banast.as/#/comic/${slug}`,
    ...(comic.coverArtist && {
      artist: {
        '@type': 'Person',
        name: comic.coverArtist,
      },
    }),
    ...(comic.currentValue && {
      offers: {
        '@type': 'Offer',
        price: comic.currentValue,
        priceCurrency: 'USD',
      },
    }),
    ...(comic.signedBy && comic.signedBy.length > 0 && {
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'signedBy',
        value: comic.signedBy.join(', '),
      },
    }),
  };
}

// Helper function to generate series structured data
export function generateSeriesStructuredData(series: {
  name: string;
  comics: any[];
  totalValue: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ComicSeries',
    name: series.name,
    numberOfItems: series.comics.length,
    ...(series.totalValue && {
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: Math.min(...series.comics.map((c) => c.currentValue || 0)),
        highPrice: Math.max(...series.comics.map((c) => c.currentValue || 0)),
        priceCurrency: 'USD',
      },
    }),
  };
}

// Helper function to generate collection structured data
export function generateCollectionStructuredData(stats: {
  totalComics: number;
  totalValue: number;
  uniqueSeries: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Collection',
    name: 'Comic Book Collection',
    description: 'Personal comic book collection with tracking and valuation',
    numberOfItems: stats.totalComics,
    ...(stats.totalValue && {
      offers: {
        '@type': 'AggregateOffer',
        price: stats.totalValue,
        priceCurrency: 'USD',
      },
    }),
  };
}

// Helper function to generate breadcrumb structured data
export function generateBreadcrumbStructuredData(items: Array<{
  name: string;
  url: string;
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

import { createComicSlug } from './routing';
import type { Comic } from '../types/Comic';

export function generateComicStructuredData(comic: {
  id: string;
  title: string;
  seriesName: string;
  issueNumber: string | number;
  releaseDate: string;
  coverImageUrl: string;
  coverArtist?: string;
  currentValue?: number;
  grade?: number;
  signedBy?: string;
  isVariant: boolean;
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
    ...(comic.signedBy && comic.signedBy.trim() !== '' && {
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'signedBy',
        value: comic.signedBy,
      },
    }),
  };
}

export function generateSeriesStructuredData(series: {
  name: string;
  comics: Comic[];
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

export function generateCollectionStructuredData(stats: {
  totalComics: number;
  totalValue: number;
  uniqueSeries: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Collection',
    name: 'comics.banast.as',
    description: 'Personal comic book collection with tracking and valuation',
    author: { '@id': 'https://banast.as/#person' },
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

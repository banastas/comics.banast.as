import { createComicSlug } from './routing';
import type { Comic } from '../types/Comic';

// Client JSON-LD. scripts/structured-data.mjs produces the same shapes for the
// static entry pages; scripts/structured-data.test.ts keeps the two equivalent.
// This is a personal collection, so no Offer/AggregateOffer data is emitted.

const SITE_ORIGIN = 'https://comics.banast.as';
const MAX_LISTED_COMICS = 25;

// Mirrors scripts/cover-placeholders.mjs: the source app's "image coming soon"
// graphic (noCover.jpg) and bare directory URLs are not real cover images.
const PLACEHOLDER_COVER_PATTERNS = [
  /\/no[-_ ]?cover\.(?:jpe?g|png|webp|gif)$/i,
  /^https?:\/\/[^/]+\/?$/i,
];

const isPlaceholderCover = (url: string | undefined) => (
  !url || url.trim() === '' || PLACEHOLDER_COVER_PATTERNS.some((pattern) => pattern.test(url.trim()))
);

type ListedComic = Pick<Comic, 'id' | 'seriesName' | 'issueNumber' | 'isVariant'>;

const compareText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

// A stable order keeps the first 25 listed comics identical regardless of how
// the caller sorted the page.
const sortComics = <T extends ListedComic>(comics: T[]) => [...comics].sort((a, b) => (
  compareText(a.seriesName, b.seriesName)
  || a.issueNumber - b.issueNumber
  || Number(a.isVariant) - Number(b.isVariant)
  || compareText(a.id, b.id)
));

const comicDisplayName = (comic: { seriesName: string; issueNumber: string | number; isVariant: boolean }) => (
  `${comic.seriesName} #${comic.issueNumber}${comic.isVariant ? ' (Variant)' : ''}`
);

const comicUrl = (comic: Parameters<typeof createComicSlug>[0]) => (
  `${SITE_ORIGIN}/comic/${createComicSlug(comic)}`
);

const seriesUrl = (seriesName: string) => `${SITE_ORIGIN}/series/${encodeURIComponent(seriesName)}`;

const copyDescription = (comic: { grade?: number; signedBy?: string }) => {
  const parts: string[] = [];
  if (typeof comic.grade === 'number') parts.push(`Grade ${comic.grade}`);
  const signedBy = comic.signedBy?.trim();
  if (signedBy) parts.push(`Signed by ${signedBy}`);
  return parts.length > 0 ? `${parts.join('. ')}.` : undefined;
};

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
  const coverArtist = comic.coverArtist?.trim();
  const description = copyDescription(comic);

  return {
    '@context': 'https://schema.org',
    '@type': 'ComicIssue',
    name: comicDisplayName(comic),
    issueNumber: comic.issueNumber,
    datePublished: comic.releaseDate,
    ...(!isPlaceholderCover(comic.coverImageUrl) && { image: comic.coverImageUrl }),
    url: comicUrl(comic),
    isPartOf: {
      '@type': 'ComicSeries',
      name: comic.seriesName,
      url: seriesUrl(comic.seriesName),
    },
    ...(coverArtist && {
      artist: {
        '@type': 'Person',
        name: coverArtist,
      },
    }),
    ...(comic.isVariant && {
      variantCover: coverArtist ? `${coverArtist} Variant Cover` : 'Variant Cover',
    }),
    ...(description && { description }),
  };
}

export function generateSeriesStructuredData(series: {
  name: string;
  comics: Comic[];
  totalValue?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ComicSeries',
    name: series.name,
    url: seriesUrl(series.name),
    hasPart: sortComics(series.comics).slice(0, MAX_LISTED_COMICS).map((comic) => ({
      '@type': 'ComicIssue',
      name: comicDisplayName(comic),
      issueNumber: comic.issueNumber,
      url: comicUrl(comic),
    })),
  };
}

export function generateCollectionStructuredData(stats: {
  totalComics: number;
  totalValue?: number;
  uniqueSeries?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Collection',
    name: 'comics.banast.as',
    description: 'Personal comic book collection with tracking and valuation',
    url: `${SITE_ORIGIN}/`,
    author: { '@id': 'https://banast.as/#person' },
    collectionSize: stats.totalComics,
  };
}

export function generateCollectionPageStructuredData(page: {
  name: string;
  url: string;
  comics: Comic[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: page.name,
    url: page.url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: page.comics.length,
      itemListElement: sortComics(page.comics).slice(0, MAX_LISTED_COMICS).map((comic, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: comicUrl(comic),
        name: comicDisplayName(comic),
      })),
    },
  };
}

export function generateArtistStructuredData(artist: {
  name: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: artist.name,
    jobTitle: 'Comic Book Cover Artist',
    url: artist.url,
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

import type { Comic } from '../types/Comic';
import { hasRealCover } from './covers';
import { formatComicLabel, formatCurrency } from './formatting';
import { issuePhrase } from './comic-slug';
import { absoluteUrl, comicPath } from './paths';
import {
  generateArtistStructuredData,
  generateCollectionPageStructuredData,
  generateCollectionStructuredData,
  generateComicStructuredData,
  generateSeriesStructuredData,
} from './structured-data';
import { collectionStats, seriesDetails, seriesNames, storageLocations } from './site-data';

// Title, description, social image and JSON-LD for every page type. The layout
// renders these into <head>; there is no client-side head rewriting.

export interface PageMeta {
  /** Page title without the site suffix. */
  title: string;
  description: string;
  keywords: string;
  image: string;
  type: 'website' | 'article' | 'profile';
  /** Absolute canonical URL, or null for pages that must not be indexed. */
  canonical: string | null;
  structuredData?: object;
}

export const SITE_NAME = 'comics.banast.as';
export const DEFAULT_IMAGE = absoluteUrl('/og-image.jpg');
export const DEFAULT_DESCRIPTION = 'Browse a personal comic-book collection with cover art, grades, values, variants, artists, and storage details.';
export const DEFAULT_KEYWORDS = 'comic book collection, comic covers, graded comics, slabbed comics, variant covers, comic values';

export const fullTitle = (title: string) => (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`);

const socialImageFor = (pageComics: Comic[]) =>
  pageComics.map((comic) => comic.coverImageUrl).find((url) => hasRealCover(url)) ?? DEFAULT_IMAGE;

const collectionData = () => generateCollectionStructuredData({
  totalComics: collectionStats.totalComics,
  totalValue: collectionStats.totalValue,
  uniqueSeries: seriesNames.length,
});

export const homeMeta = (): PageMeta => ({
  title: 'Comic Collection',
  description: `Browse ${collectionStats.totalComics} comics across ${seriesNames.length} series with cover art, grades, values, variants, artists, and storage details. Current value ${formatCurrency(collectionStats.totalValue)}.`,
  keywords: DEFAULT_KEYWORDS,
  image: DEFAULT_IMAGE,
  type: 'website',
  canonical: absoluteUrl('/'),
  structuredData: collectionData(),
});

export const statsMeta = (): PageMeta => ({
  title: 'Collection Statistics',
  description: `Statistics for ${collectionStats.totalComics} comics across ${seriesNames.length} series: value, returns, grades, series, and acquisitions.`,
  keywords: 'comic collection statistics, comic values, comic analytics',
  image: DEFAULT_IMAGE,
  type: 'website',
  canonical: absoluteUrl('/stats'),
  structuredData: collectionData(),
});

export const comicMeta = (comic: Comic): PageMeta => {
  const signedBy = comic.signedBy.trim();
  return {
    title: formatComicLabel(comic),
    description: `${comic.seriesName} ${issuePhrase(comic)}${comic.coverArtist ? ` - Cover art by ${comic.coverArtist}` : ''}. Grade: ${comic.grade}${comic.isSlabbed ? ' (Slabbed)' : ''}${comic.isVariant ? ' (Variant Cover)' : ''}${signedBy ? ` Signed by ${signedBy}` : ''}`,
    keywords: `${comic.seriesName}, comic book, issue ${comic.issueNumber}, ${comic.coverArtist || 'comic'}, comic collection`,
    image: socialImageFor([comic]),
    type: 'article',
    canonical: absoluteUrl(comicPath(comic)),
    structuredData: generateComicStructuredData(comic, { publisher: seriesDetails[comic.seriesName]?.publisher }),
  };
};

export const seriesMeta = (name: string, seriesComics: Comic[], path: string): PageMeta => ({
  title: `${name} Series`,
  description: `Browse ${seriesComics.length} comics from the ${name} series in the collection.`,
  keywords: `${name}, comic book series, comic collection`,
  image: socialImageFor(seriesComics),
  type: 'website',
  canonical: absoluteUrl(path),
  structuredData: generateSeriesStructuredData({ name, comics: seriesComics, ...seriesDetails[name] }),
});

export const artistMeta = (name: string, artistComics: Comic[], path: string): PageMeta => ({
  title: `${name} - Cover Artist`,
  description: `Browse ${artistComics.length} comics with cover art by ${name}.`,
  keywords: `${name}, comic book cover artist, comic collection`,
  image: socialImageFor(artistComics),
  type: 'profile',
  canonical: absoluteUrl(path),
  structuredData: generateArtistStructuredData({ name, url: absoluteUrl(path) }),
});

const listingMeta = (title: string, description: string, keywords: string, pageComics: Comic[], path: string): PageMeta => ({
  title,
  description,
  keywords,
  image: socialImageFor(pageComics),
  type: 'website',
  canonical: absoluteUrl(path),
  structuredData: generateCollectionPageStructuredData({ name: title, url: absoluteUrl(path), comics: pageComics }),
});

export const storageMeta = (name: string, boxComics: Comic[], path: string) => listingMeta(
  `${name} Storage`, `Browse ${boxComics.length} comics stored in ${name}.`, `${name}, comic storage, comic collection`, boxComics, path,
);

export const tagMeta = (tag: string, tagComics: Comic[], path: string) => listingMeta(
  `${tag} Comics`, `Browse ${tagComics.length} comics tagged ${tag}.`, `${tag}, tagged comics, comic collection`, tagComics, path,
);

export const groupMeta = (title: string, count: number, pageComics: Comic[], path: string) => listingMeta(
  title, `Browse ${count} ${title.toLowerCase()} in the collection.`, `${title}, comic collection`, pageComics, path,
);

export const boxesMeta = (allComics: Comic[]) => groupMeta('Virtual Boxes', storageLocations.length, allComics, '/boxes');

export const notFoundMeta = (): PageMeta => ({
  title: 'Page Not Found',
  description: 'This page is not in the collection.',
  keywords: DEFAULT_KEYWORDS,
  image: DEFAULT_IMAGE,
  type: 'website',
  canonical: null,
});

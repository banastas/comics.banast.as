import { isPlaceholderCover } from './cover-placeholders.mjs';
import { createComicSlug, siteOrigin } from './site-routes.mjs';

// Build-time JSON-LD. src/utils/structured-data.ts produces the same shapes on
// the client; scripts/structured-data.test.ts keeps the two equivalent.
// This is a personal collection, so no Offer/AggregateOffer data is emitted.

const MAX_LISTED_COMICS = 25;
const collectionAuthor = { '@id': 'https://banast.as/#person' };

const compareText = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// A stable order keeps the first 25 listed comics identical regardless of how
// the caller sorted the page.
const sortComics = (comics) => [...comics].sort((a, b) => (
  compareText(a.seriesName, b.seriesName)
  || a.issueNumber - b.issueNumber
  || Number(a.isVariant) - Number(b.isVariant)
  || compareText(a.id, b.id)
));

export const comicDisplayName = (comic) => `${comic.seriesName} #${comic.issueNumber}${comic.isVariant ? ' (Variant)' : ''}`;

const comicUrl = (comic) => `${siteOrigin}/comic/${createComicSlug(comic)}`;
const seriesUrl = (seriesName) => `${siteOrigin}/series/${encodeURIComponent(seriesName)}`;

const copyDescription = (comic) => {
  const parts = [];
  if (typeof comic.grade === 'number') parts.push(`Grade ${comic.grade}`);
  const signedBy = comic.signedBy?.trim();
  if (signedBy) parts.push(`Signed by ${signedBy}`);
  return parts.length > 0 ? `${parts.join('. ')}.` : undefined;
};

export const comicStructuredData = (comic) => {
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
};

export const seriesStructuredData = (seriesName, seriesComics) => ({
  '@context': 'https://schema.org',
  '@type': 'ComicSeries',
  name: seriesName,
  url: seriesUrl(seriesName),
  hasPart: sortComics(seriesComics).slice(0, MAX_LISTED_COMICS).map((comic) => ({
    '@type': 'ComicIssue',
    name: comicDisplayName(comic),
    issueNumber: comic.issueNumber,
    url: comicUrl(comic),
  })),
});

export const collectionStructuredData = (totalComics) => ({
  '@context': 'https://schema.org',
  '@type': 'Collection',
  name: 'comics.banast.as',
  description: 'Personal comic book collection with tracking and valuation',
  url: `${siteOrigin}/`,
  author: collectionAuthor,
  collectionSize: totalComics,
});

export const collectionPageStructuredData = (name, pageComics, url) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name,
  url,
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: pageComics.length,
    itemListElement: sortComics(pageComics).slice(0, MAX_LISTED_COMICS).map((comic, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: comicUrl(comic),
      name: comicDisplayName(comic),
    })),
  },
});

export const artistStructuredData = (artist, url) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: artist,
  jobTitle: 'Comic Book Cover Artist',
  url,
});

import { describe, expect, it } from 'vitest';
import comics from '../src/data/comics.json';
import type { Comic } from '../src/types/Comic';
import {
  generateArtistStructuredData,
  generateCollectionPageStructuredData,
  generateCollectionStructuredData,
  generateComicStructuredData,
  generateSeriesStructuredData,
} from '../src/utils/structured-data';
// @ts-expect-error Build utilities are native ESM shared with Node scripts.
import { isPlaceholderCover } from './cover-placeholders.mjs';
import {
  artistStructuredData,
  collectionPageStructuredData,
  collectionStructuredData,
  comicStructuredData,
  seriesStructuredData,
  // @ts-expect-error Build utilities are native ESM shared with Node scripts.
} from './structured-data.mjs';

const data = comics as Comic[];
const groupBy = (key: (comic: Comic) => string) => {
  const groups = new Map<string, Comic[]>();
  data.forEach((comic) => groups.set(key(comic), [...(groups.get(key(comic)) || []), comic]));
  return groups;
};
const forbiddenKeys = /"(?:offers|additionalProperty|AggregateOffer|Offer)"/;

describe('structured data', () => {
  it('produces the same ComicIssue JSON-LD on static pages and in the client', () => {
    const mismatches = data.filter((comic) => (
      JSON.stringify(comicStructuredData(comic)) !== JSON.stringify(generateComicStructuredData(comic))
    ));

    expect(mismatches.map((comic) => comic.id)).toEqual([]);
  });

  it('names comic issues with their issue number and describes variants with variantCover', () => {
    const variant = data.find((comic) => comic.isVariant && comic.coverArtist.trim())!;
    const json = generateComicStructuredData(variant);

    expect(json.name).toBe(`${variant.seriesName} #${variant.issueNumber} (Variant)`);
    expect(json).toMatchObject({
      '@type': 'ComicIssue',
      issueNumber: variant.issueNumber,
      isPartOf: { '@type': 'ComicSeries', name: variant.seriesName },
      artist: { '@type': 'Person', name: variant.coverArtist },
      variantCover: `${variant.coverArtist} Variant Cover`,
    });
  });

  it('moves the signature into the description and never emits offers', () => {
    const signed = { ...data[0], signedBy: ' Stan Lee ', currentValue: 500 };
    const json = JSON.stringify(comicStructuredData(signed));

    expect(json).not.toMatch(forbiddenKeys);
    expect(comicStructuredData(signed).description).toBe(`Grade ${signed.grade}. Signed by Stan Lee.`);
    expect(generateComicStructuredData(signed)).toEqual(comicStructuredData(signed));
  });

  it('omits placeholder cover images', () => {
    const placeholder = { ...data[0], coverImageUrl: 'https://covers.banast.as/noCover.jpg' };

    expect(isPlaceholderCover(placeholder.coverImageUrl)).toBe(true);
    expect(isPlaceholderCover('https://covers.banast.as/')).toBe(true);
    expect(isPlaceholderCover(data[0].coverImageUrl)).toBe(false);
    expect(comicStructuredData(placeholder)).not.toHaveProperty('image');
    expect(generateComicStructuredData(placeholder)).not.toHaveProperty('image');
  });

  it('produces the same ComicSeries JSON-LD without numberOfItems or offers', () => {
    for (const [name, seriesComics] of groupBy((comic) => comic.seriesName)) {
      const reversed = [...seriesComics].reverse();
      const client = generateSeriesStructuredData({ name, comics: reversed, totalValue: 1 });

      expect(seriesStructuredData(name, seriesComics)).toEqual(client);
      expect(client).not.toHaveProperty('numberOfItems');
      expect(JSON.stringify(client)).not.toMatch(forbiddenKeys);
    }
  });

  it('produces the same Collection JSON-LD without offers', () => {
    const client = generateCollectionStructuredData({ totalComics: data.length, totalValue: 123, uniqueSeries: 4 });

    expect(collectionStructuredData(data.length)).toEqual(client);
    expect(client).toMatchObject({ '@type': 'Collection', collectionSize: data.length });
    expect(client).not.toHaveProperty('numberOfItems');
    expect(JSON.stringify(client)).not.toMatch(forbiddenKeys);
  });

  it('produces the same CollectionPage JSON-LD regardless of caller sort order', () => {
    const url = 'https://comics.banast.as/variants';
    const variants = data.filter((comic) => comic.isVariant);
    const client = generateCollectionPageStructuredData({ name: 'Variant Covers', url, comics: [...variants].reverse() });

    expect(collectionPageStructuredData('Variant Covers', variants, url)).toEqual(client);
    expect(client.mainEntity.numberOfItems).toBe(variants.length);
    expect(client.mainEntity.itemListElement.length).toBeLessThanOrEqual(25);
  });

  it('produces the same Person JSON-LD for cover artists', () => {
    const url = 'https://comics.banast.as/artist/Todd%20McFarlane';

    expect(artistStructuredData('Todd McFarlane', url)).toEqual(generateArtistStructuredData({ name: 'Todd McFarlane', url }));
  });
});

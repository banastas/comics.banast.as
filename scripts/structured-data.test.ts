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

const data = comics as Comic[];
const groupBy = (key: (comic: Comic) => string) => {
  const groups = new Map<string, Comic[]>();
  data.forEach((comic) => groups.set(key(comic), [...(groups.get(key(comic)) || []), comic]));
  return groups;
};
const forbiddenKeys = /"(?:offers|additionalProperty|AggregateOffer|Offer)"/;

describe('structured data', () => {
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
    const json = JSON.stringify(generateComicStructuredData(signed));

    expect(json).not.toMatch(forbiddenKeys);
    expect(generateComicStructuredData(signed).description).toBe(`Grade ${signed.grade}. Signed by Stan Lee.`);
  });

  it('omits placeholder cover images', () => {
    const placeholder = { ...data[0], coverImageUrl: 'https://covers.banast.as/noCover.jpg' };

    expect(isPlaceholderCover(placeholder.coverImageUrl)).toBe(true);
    expect(isPlaceholderCover('https://covers.banast.as/')).toBe(true);
    expect(isPlaceholderCover(data[0].coverImageUrl)).toBe(false);
    expect(generateComicStructuredData(placeholder)).not.toHaveProperty('image');
  });

  it('produces ComicSeries JSON-LD independent of order, without numberOfItems or offers', () => {
    for (const [name, seriesComics] of groupBy((comic) => comic.seriesName)) {
      const reversed = [...seriesComics].reverse();
      const client = generateSeriesStructuredData({ name, comics: reversed, totalValue: 1 });

      expect(generateSeriesStructuredData({ name, comics: seriesComics })).toEqual(client);
      expect(client).not.toHaveProperty('numberOfItems');
      expect(JSON.stringify(client)).not.toMatch(forbiddenKeys);
    }
  });

  it('produces Collection JSON-LD without offers', () => {
    const client = generateCollectionStructuredData({ totalComics: data.length, totalValue: 123, uniqueSeries: 4 });

    expect(client).toMatchObject({ '@type': 'Collection', collectionSize: data.length });
    expect(client).not.toHaveProperty('numberOfItems');
    expect(JSON.stringify(client)).not.toMatch(forbiddenKeys);
  });

  it('produces CollectionPage JSON-LD regardless of caller sort order', () => {
    const url = 'https://comics.banast.as/variants';
    const variants = data.filter((comic) => comic.isVariant);
    const client = generateCollectionPageStructuredData({ name: 'Variant Covers', url, comics: [...variants].reverse() });

    expect(generateCollectionPageStructuredData({ name: 'Variant Covers', url, comics: variants })).toEqual(client);
    expect(client.mainEntity.numberOfItems).toBe(variants.length);
    expect(client.mainEntity.itemListElement.length).toBeLessThanOrEqual(25);
  });

  it('describes cover artists as a Person', () => {
    const url = 'https://comics.banast.as/artist/Todd%20McFarlane';

    expect(generateArtistStructuredData({ name: 'Todd McFarlane', url })).toMatchObject({ '@type': 'Person', name: 'Todd McFarlane', url });
  });

  it('adds the publisher and start year from series details when known', () => {
    const comic = data[0];
    expect(generateComicStructuredData(comic, { publisher: 'Marvel' })).toMatchObject({ publisher: { '@type': 'Organization', name: 'Marvel' } });
    expect(generateComicStructuredData(comic)).not.toHaveProperty('publisher');

    const series = generateSeriesStructuredData({ name: comic.seriesName, comics: [comic], publisher: 'Marvel', startYear: 2021 });
    expect(series).toMatchObject({ publisher: { '@type': 'Organization', name: 'Marvel' }, startDate: '2021' });
    expect(generateSeriesStructuredData({ name: comic.seriesName, comics: [comic] })).not.toHaveProperty('startDate');
  });
});


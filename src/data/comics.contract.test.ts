import { describe, expect, it } from 'vitest';
import comics from './comics.json';
import type { Comic } from '../types/Comic';
import { COMIC_SLUG_PATTERN } from '../utils/comic-slug';
import { seriesMetadataSchema } from '../validation/comic-schema';
import series from './series.json';

const dateFields = ['releaseDate', 'purchaseDate', 'createdAt', 'updatedAt'] as const;

describe('nightly comics data contract', () => {
  it('keeps IDs, cover URLs, tags, and dates valid for n8n imports and static builds', () => {
    const data = comics as Comic[];
    const ids = new Set(data.map((comic) => comic.id));

    expect(ids.size).toBe(data.length);
    expect(data.every((comic) => comic.coverImageUrl.length > 0)).toBe(true);
    expect(data.every((comic) => Array.isArray(comic.tags))).toBe(true);
    expect(
      data.flatMap((comic) =>
        dateFields.map((field) => Number.isNaN(new Date(comic[field]).getTime()))
      ).some(Boolean)
    ).toBe(false);
  });

  it('stores a unique permalink slug ending with the ID number on every comic', () => {
    const data = comics as Comic[];
    const slugs = data.map((comic) => comic.slug);

    expect(slugs.every((slug) => typeof slug === 'string' && COMIC_SLUG_PATTERN.test(slug))).toBe(true);
    expect(new Set(slugs).size).toBe(data.length);
    expect(data.filter((comic) => !comic.slug?.endsWith(`-${comic.id.match(/\d+$/)?.[0]}`)).map((comic) => comic.id)).toEqual([]);
  });

  it('keeps series.json valid and keyed by series that exist in the collection', () => {
    const names = new Set((comics as Comic[]).map((comic) => comic.seriesName));
    const metadata = seriesMetadataSchema.parse(series);

    expect(Object.keys(metadata).filter((name) => !names.has(name))).toEqual([]);
  });
});

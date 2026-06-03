import { describe, expect, it } from 'vitest';
import comics from './comics.json';
import type { Comic } from '../types/Comic';

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
});

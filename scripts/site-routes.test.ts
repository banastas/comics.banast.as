import { describe, expect, it } from 'vitest';
import comics from '../src/data/comics.json';
import type { Comic } from '../src/types/Comic';
import { computeTagsForComic as computeClientTags } from '../src/utils/computed-tags';
// @ts-expect-error Build utilities are native ESM shared with Node scripts.
import { computeTagsForComic as computeBuildTags } from './site-routes.mjs';

const base = (comics as Comic[])[0];

describe('build-time computed tags', () => {
  it('match the client rules for every collection record', () => {
    const mismatches = (comics as Comic[])
      .filter((comic) => JSON.stringify(computeBuildTags(comic)) !== JSON.stringify(computeClientTags(comic)))
      .map((comic) => comic.id);

    expect(mismatches).toEqual([]);
  });

  it.each([
    { currentValue: 0, purchasePrice: 10 },
    { currentValue: 30, purchasePrice: 10 },
    { currentValue: undefined, purchasePrice: 10 },
    { currentValue: 10, purchasePrice: undefined },
    { currentValue: 10, purchasePrice: 0 },
    { currentValue: 50, purchasePrice: undefined },
  ])('treats a zero current value as a known value (%o)', (values) => {
    const comic = { ...base, ...values } as Comic;

    expect(computeBuildTags(comic)).toEqual(computeClientTags(comic));
  });

  it('marks a comic whose value fell to zero as depreciating', () => {
    expect(computeBuildTags({ ...base, currentValue: 0, purchasePrice: 10 })).toContain('Depreciating');
  });
});

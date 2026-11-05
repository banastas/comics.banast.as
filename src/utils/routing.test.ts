// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import comics from '../data/comics.json';
import type { Comic } from '../types/Comic';
import { computeComicSlug } from './comic-slug';
import { buildQueryString, createComicSlug } from './routing';
import { readViewState } from '../islands/CollectionApp';

describe('comic routing slugs', () => {
  it('creates unique slugs for the synced collection data', () => {
    const slugs = new Set((comics as Comic[]).map(createComicSlug));

    expect(slugs.size).toBe(comics.length);
  });

  it('preserves the numeric comic id suffix for duplicate issue disambiguation', () => {
    const comic = (comics as Comic[]).find((item) => item.id === 'comic-803');

    expect(comic).toBeDefined();
    expect(createComicSlug(comic!)).toBe('predator-versus-planet-of-the-apes-issue-2-803');
  });

  it('prefers the stored slug over the computed one', () => {
    const comic = { ...(comics as Comic[])[0], seriesName: 'Renamed Series' };

    expect(createComicSlug(comic)).toBe(comic.slug);
    expect(computeComicSlug(comic)).toMatch(/^renamed-series-issue-/);
  });
});

describe('collection URL state', () => {
  it('omits defaults and round-trips non-default values', () => {
    expect(buildQueryString({ viewMode: 'grid', sortField: 'releaseDate', sortDirection: 'desc', page: 0 })).toBe('');
    const query = buildQueryString({ viewMode: 'list', searchTerm: 'What If?', computedTag: 'Gem Mint', sortField: 'grade', sortDirection: 'asc', page: 2 });

    expect(readViewState(`?${query}`)).toEqual({
      searchTerm: 'What If?', tag: 'Gem Mint', sortField: 'grade', sortDirection: 'asc', viewMode: 'list', page: 2,
    });
  });

  it('preserves question marks in search queries', () => {
    expect(readViewState('?search=What%20If%3F').searchTerm).toBe('What If?');
  });
});

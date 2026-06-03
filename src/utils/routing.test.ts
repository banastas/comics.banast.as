// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import comics from '../data/comics.json';
import type { Comic } from '../types/Comic';
import { createComicSlug, parseComicSlug, parseCurrentUrl } from './routing';

describe('comic routing slugs', () => {
  it('creates unique slugs for the synced collection data', () => {
    const slugs = new Set((comics as Comic[]).map(createComicSlug));

    expect(slugs.size).toBe(comics.length);
  });

  it('preserves the numeric comic id suffix for duplicate issue disambiguation', () => {
    const comic = (comics as Comic[]).find((item) => item.id === 'comic-803');

    expect(comic).toBeDefined();

    const slug = createComicSlug(comic!);
    const parsed = parseComicSlug(slug);

    expect(slug).toBe('predator-versus-planet-of-the-apes-issue-2-803');
    expect(parsed).toEqual({
      seriesSlug: 'predator-versus-planet-of-the-apes',
      issueNumber: '2',
      isVariant: false,
      comicId: 'comic-803',
    });
  });

  it('parses clean URLs as the canonical routing surface', () => {
    window.history.replaceState(null, '', '/comic/2010-issue-1-23?tab=collection');

    expect(parseCurrentUrl()).toEqual({
      route: '/comic/2010-issue-1-23',
      params: { tab: 'collection' },
    });
  });

  it('keeps legacy hash URLs readable for old bookmarks', () => {
    window.history.replaceState(null, '', '/#/comic/2010-issue-1-23?tab=collection');

    expect(parseCurrentUrl()).toEqual({
      route: '/comic/2010-issue-1-23',
      params: { tab: 'collection' },
    });
  });
});

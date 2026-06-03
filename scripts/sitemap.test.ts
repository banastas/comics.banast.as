import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import comics from '../src/data/comics.json';
import type { Comic } from '../src/types/Comic';
import { computeTagsForComic } from '../src/utils/computed-tags';
import { createComicSlug } from '../src/utils/routing';

const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

describe('sitemap', () => {
  it('stays in sync with the nightly collection data', () => {
    const data = comics as Comic[];
    const series = new Set(data.map((comic) => comic.seriesName));
    const storageLocations = new Set(data.map((comic) => comic.storageLocation).filter(Boolean));
    const coverArtists = new Set(data.map((comic) => comic.coverArtist).filter(Boolean));
    const userTags = new Set(data.flatMap((comic) => comic.tags || []));
    const computedTagCounts = new Map<string, number>();

    data.forEach((comic) => {
      computeTagsForComic(comic).forEach((tag) => {
        computedTagCounts.set(tag, (computedTagCounts.get(tag) || 0) + 1);
      });
    });

    const computedTags = [...computedTagCounts.entries()].filter(([, count]) => count >= 5);
    const expectedCount = 7 + data.length + series.size + storageLocations.size + coverArtists.size + userTags.size + computedTags.length;

    expect(urls).toHaveLength(expectedCount);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain('https://comics.banast.as/');
    expect(urls.every((url) => !url.includes('/#/'))).toBe(true);
    expect(urls).toContain(`https://comics.banast.as/comic/${createComicSlug(data[data.length - 1])}`);
  });
});

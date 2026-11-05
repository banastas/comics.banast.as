import { describe, expect, it } from 'vitest';
import comics from '../src/data/comics.json';
import type { Comic } from '../src/types/Comic';
import { computeTagsForComic } from '../src/utils/computed-tags';
import { comicSlug } from '../src/utils/comic-slug';
import { buildSitemapXml, computedTags, sitemapEntries } from '../src/utils/site-data';

const sitemap = buildSitemapXml();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc.replace(/&amp;/g, '&').replace(/&apos;/g, "'"));
const data = comics as Comic[];

describe('sitemap', () => {
  it('lists every page in the collection exactly once', () => {
    const series = new Set(data.map((comic) => comic.seriesName));
    const storageLocations = new Set(data.map((comic) => comic.storageLocation).filter(Boolean));
    const coverArtists = new Set(data.map((comic) => comic.coverArtist).filter(Boolean));
    const userTags = new Set(data.flatMap((comic) => comic.tags));
    const tagCounts = new Map<string, number>();
    data.forEach((comic) => computeTagsForComic(comic).forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)));
    const tagPages = [...tagCounts.values()].filter((count) => count >= 5).length;
    // Home, stats, raw, slabbed, variants and boxes. /collection is not listed.
    const staticPages = 6;

    expect(urls).toHaveLength(staticPages + data.length + series.size + storageLocations.size + coverArtists.size + userTags.size + tagPages);
    expect(new Set(urls).size).toBe(urls.length);
    expect(computedTags).toHaveLength(tagPages);
    expect(urls).toContain('https://comics.banast.as/');
    expect(urls.every((url) => !url.includes('/#/'))).toBe(true);
    expect(urls).toContain(`https://comics.banast.as/comic/${comicSlug(data[data.length - 1])}`);
  });

  it('omits lastmod because record timestamps do not reflect page changes', () => {
    expect(sitemap).not.toContain('<lastmod>');
  });

  it('lists /collection only through its canonical home page', () => {
    expect(urls).not.toContain('https://comics.banast.as/collection');
  });

  it('escapes XML entities and keeps URLs encoded', () => {
    expect(sitemap).not.toMatch(/<loc>[^<]*'[^<]*<\/loc>/);
    expect(sitemapEntries().every((entry) => entry.path === '/' || !/[ ?#]/.test(entry.path))).toBe(true);
  });
});

describe('computed tags', () => {
  const base = data[0];
  it.each([
    [{ currentValue: 0, purchasePrice: 10 }, 'Depreciating'],
    [{ currentValue: 30, purchasePrice: 10 }, 'Appreciating'],
    [{ currentValue: 50, purchasePrice: undefined }, 'High Value'],
  ])('treats a recorded value of zero or more as known (%o → %s)', (values, tag) => {
    expect(computeTagsForComic({ ...base, ...values } as Comic)).toContain(tag);
  });

  it.each([
    { currentValue: undefined, purchasePrice: 10 },
    { currentValue: 10, purchasePrice: undefined },
    { currentValue: 10, purchasePrice: 0 },
  ])('does not compute a return without both values (%o)', (values) => {
    const tags = computeTagsForComic({ ...base, ...values } as Comic);
    expect(tags).not.toContain('Appreciating');
    expect(tags).not.toContain('Depreciating');
  });
});

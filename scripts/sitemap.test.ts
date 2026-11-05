import { describe, expect, it } from 'vitest';
import comics from '../src/data/comics.json';
import seriesData from '../src/data/series.json';
import type { Comic } from '../src/types/Comic';
import { computeTagsForComic } from '../src/utils/computed-tags';
import { comicSlug } from '../src/utils/comic-slug';
import { buildSitemapXml, comicsByPublisher, computedTags, publishers, sitemapEntries } from '../src/utils/site-data';
import { matchesSource } from '../src/utils/comic-index';

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
    const details = seriesData as Record<string, { publisher?: string }>;
    const publisherPages = new Set([...series].map((name) => details[name]?.publisher).filter(Boolean)).size;
    // Home, stats, raw, slabbed, variants and boxes. /collection is not listed.
    const staticPages = 6;

    expect(urls).toHaveLength(staticPages + data.length + series.size + storageLocations.size + coverArtists.size + publisherPages + userTags.size + tagPages);
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

describe('publisher pages', () => {
  it('list every comic whose series has a publisher, once', () => {
    const listed = publishers.flatMap((name) => comicsByPublisher(name).map((comic) => comic.id));
    const details = seriesData as Record<string, { publisher?: string }>;
    const withPublisher = data.filter((comic) => details[comic.seriesName]?.publisher);

    expect(new Set(listed).size).toBe(listed.length);
    expect(listed.length).toBe(withPublisher.length);
    expect(sitemapEntries().some((entry) => entry.path === '/publisher/Dark%20Horse')).toBe(publishers.includes('Dark Horse'));
  });

  it('let the browser find the same comics through the series list', () => {
    const details = seriesData as Record<string, { publisher?: string }>;
    publishers.forEach((name) => {
      const series = Object.keys(details).filter((key) => details[key].publisher === name);
      const matched = data.filter((comic) => matchesSource(comic, { kind: 'publisher', value: name, series }));
      expect(matched.map((comic) => comic.id).sort()).toEqual(comicsByPublisher(name).map((comic) => comic.id).sort());
    });
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

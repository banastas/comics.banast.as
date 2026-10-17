import { describe, expect, it } from 'vitest';
import comics from '../src/data/comics.json';
import type { Comic } from '../src/types/Comic';
import { computeTagsForComic } from '../src/utils/computed-tags';
import { createComicSlug } from '../src/utils/routing';
// @ts-expect-error Build utilities are native ESM shared with Node scripts.
import { buildSitemapXml, getRouteEntries, parseSitemapLocs } from './site-routes.mjs';

// public/sitemap.xml is untracked derived output, so build it in memory from the
// same route inventory `npm run generate:sitemap` uses.
const { entries } = getRouteEntries(comics);
const sitemap: string = buildSitemapXml(entries);
const urls: string[] = parseSitemapLocs(sitemap);

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
    // Home, stats, raw, slabbed, variants and boxes. /collection is not listed.
    const staticPages = 6;
    const expectedCount = staticPages + data.length + series.size + storageLocations.size + coverArtists.size + userTags.size + computedTags.length;

    expect(urls).toHaveLength(expectedCount);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain('https://comics.banast.as/');
    expect(urls.every((url) => !url.includes('/#/'))).toBe(true);
    expect(urls).toContain(`https://comics.banast.as/comic/${createComicSlug(data[data.length - 1])}`);
  });

  it('omits lastmod because sync timestamps do not reflect page changes', () => {
    expect(sitemap).not.toContain('<lastmod>');
  });

  it('lists /collection only through its canonical home page', () => {
    const collection = entries.find((entry: { route: string }) => entry.route === '/collection');

    expect(collection).toMatchObject({ inSitemap: false, canonical: 'https://comics.banast.as/' });
    expect(urls).not.toContain('https://comics.banast.as/collection');
  });

  it('lists only self-canonical URLs', () => {
    const listed = entries.filter((entry: { inSitemap: boolean }) => entry.inSitemap);

    expect(listed.every((entry: { loc: string; canonical: string }) => entry.loc === entry.canonical)).toBe(true);
  });

  it('escapes XML entities and round-trips URLs', () => {
    expect(sitemap).not.toMatch(/<loc>[^<]*'[^<]*<\/loc>/);
    expect(urls).toEqual(entries.filter((entry: { inSitemap: boolean }) => entry.inSitemap).map((entry: { loc: string }) => entry.loc));
  });
});

import data from '../data/comics.json';
import type { Comic } from '../types/Comic';
import { parseComics } from '../validation/comic-schema';
import { calculateComicStats } from './stats';
import { comicSlug } from './comic-slug';
import { computeTagsForComic } from './computed-tags';
import { SITE_ORIGIN } from './paths';

// Build-time view of the collection: every page, the sitemap and the API read
// the routes and groupings from here, so they cannot drift apart.

/** A computed tag gets its own page once this many comics carry it. */
export const MIN_COMICS_PER_TAG_PAGE = 5;

export const comics: Comic[] = parseComics(data);

const uniqueSorted = (values: string[]) =>
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

export const seriesNames = uniqueSorted(comics.map((comic) => comic.seriesName));
export const storageLocations = uniqueSorted(comics.map((comic) => comic.storageLocation));
export const coverArtists = uniqueSorted(comics.map((comic) => comic.coverArtist));
export const userTags = uniqueSorted(comics.flatMap((comic) => comic.tags));

const computedTagCounts = new Map<string, number>();
comics.forEach((comic) => computeTagsForComic(comic).forEach((tag) => {
  computedTagCounts.set(tag, (computedTagCounts.get(tag) ?? 0) + 1);
}));

/** Computed tags with a page, most common first. */
export const computedTags = [...computedTagCounts.entries()]
  .filter(([, count]) => count >= MIN_COMICS_PER_TAG_PAGE)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([tag]) => tag);

export const collectionStats = calculateComicStats(comics);

export const lastUpdated = comics.reduce<string | undefined>(
  (latest, comic) => (!latest || comic.updatedAt > latest ? comic.updatedAt : latest),
  undefined,
);

export const comicsInSeries = (name: string) => comics.filter((comic) => comic.seriesName === name);
export const comicsInStorage = (name: string) => comics.filter((comic) => comic.storageLocation === name);
export const comicsByArtist = (name: string) => comics.filter((comic) => comic.coverArtist === name);
export const comicsWithTag = (tag: string) =>
  comics.filter((comic) => comic.tags.includes(tag) || computeTagsForComic(comic).includes(tag));

export interface SitemapEntry {
  path: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
}

const encoded = (base: string, value: string) => `${base}/${encodeURIComponent(value)}`;

/** Every indexable URL. `/collection` renders the home page and canonicalizes to it, so it is not listed. */
export const sitemapEntries = (): SitemapEntry[] => [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/stats', changefreq: 'weekly', priority: '0.8' },
  { path: '/raw', changefreq: 'weekly', priority: '0.7' },
  { path: '/slabbed', changefreq: 'weekly', priority: '0.7' },
  { path: '/variants', changefreq: 'weekly', priority: '0.7' },
  { path: '/boxes', changefreq: 'weekly', priority: '0.6' },
  ...comics.map((comic): SitemapEntry => ({ path: `/comic/${comicSlug(comic)}`, changefreq: 'monthly', priority: '0.6' })),
  ...seriesNames.map((name): SitemapEntry => ({ path: encoded('/series', name), changefreq: 'weekly', priority: '0.7' })),
  ...storageLocations.map((name): SitemapEntry => ({ path: encoded('/storage', name), changefreq: 'weekly', priority: '0.5' })),
  ...coverArtists.map((name): SitemapEntry => ({ path: encoded('/artist', name), changefreq: 'monthly', priority: '0.5' })),
  ...userTags.map((tag): SitemapEntry => ({ path: encoded('/tag', tag), changefreq: 'monthly', priority: '0.5' })),
  ...computedTags.map((tag): SitemapEntry => ({ path: encoded('/tag', tag), changefreq: 'monthly', priority: '0.5' })),
];

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

// No <lastmod>: record timestamps describe data edits, not page changes, and
// search engines ignore lastmod values that are not accurate.
export const buildSitemapXml = (entries = sitemapEntries()) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((entry) => `  <url>
    <loc>${escapeXml(`${SITE_ORIGIN}${entry.path}`)}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

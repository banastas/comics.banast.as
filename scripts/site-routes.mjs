import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const comicsPath = path.join(rootDir, 'src/data/comics.json');

export const siteOrigin = 'https://comics.banast.as';

export const readComics = () => JSON.parse(fs.readFileSync(comicsPath, 'utf8'));

export const createComicSlug = (comic) => {
  const seriesSlug = comic.seriesName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const issueSlug = `issue-${comic.issueNumber}`;
  const variantSlug = comic.isVariant ? '-variant' : '';
  const idMatch = comic.id.match(/\d+$/);
  const idSuffix = idMatch ? `-${idMatch[0]}` : '';

  return `${seriesSlug}-${issueSlug}${variantSlug}${idSuffix}`;
};

const hasNumber = (value) => value !== undefined && value !== null;

// Mirrors src/utils/computed-tags.ts. scripts/site-routes.test.ts compares both
// implementations across the collection so generated tag routes match the client.
export const computeTagsForComic = (comic) => {
  const computed = [];
  const year = new Date(comic.releaseDate).getUTCFullYear();

  if (year >= 1940 && year < 1950) computed.push('Golden Age');
  else if (year >= 1950 && year < 1970) computed.push('Silver Age');
  else if (year >= 1970 && year < 1985) computed.push('Bronze Age');
  else if (year >= 1985 && year < 1992) computed.push('Copper Age');
  else if (year >= 1992 && year < 2000) computed.push('90s');
  else if (year >= 2000 && year < 2010) computed.push('2000s');
  else if (year >= 2010 && year < 2020) computed.push('2010s');
  else if (year >= 2020) computed.push('Modern');

  if (comic.grade >= 9.8) computed.push('Gem Mint');
  else if (comic.grade >= 9.6) computed.push('High Grade');

  if (comic.issueNumber === 1) computed.push('First Issue');
  if (hasNumber(comic.currentValue) && comic.currentValue >= 50) computed.push('High Value');

  if (hasNumber(comic.currentValue) && hasNumber(comic.purchasePrice) && comic.purchasePrice > 0) {
    const change = ((comic.currentValue - comic.purchasePrice) / comic.purchasePrice) * 100;
    if (change >= 50) computed.push('Appreciating');
    else if (change <= -20) computed.push('Depreciating');
  }

  if (comic.signedBy && String(comic.signedBy).trim() !== '') computed.push('Signed');

  return computed;
};

const uniqueSorted = (values) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

export const getCollectionInventory = (comics = readComics()) => {
  const computedTagCounts = new Map();

  comics.forEach((comic) => {
    computeTagsForComic(comic).forEach((tag) => {
      computedTagCounts.set(tag, (computedTagCounts.get(tag) || 0) + 1);
    });
  });

  const computedTags = [...computedTagCounts.entries()]
    .filter(([, count]) => count >= 5)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);

  return {
    comics,
    seriesNames: uniqueSorted(comics.map((comic) => comic.seriesName)),
    storageLocations: uniqueSorted(comics.map((comic) => comic.storageLocation)),
    coverArtists: uniqueSorted(comics.map((comic) => comic.coverArtist)),
    userTags: uniqueSorted(comics.flatMap((comic) => comic.tags || [])),
    computedTags,
  };
};

export const cleanRoute = (route) => {
  if (route === '/') return '/';
  return route.replace(/\/+$/, '');
};

export const absoluteUrl = (route) => `${siteOrigin}${cleanRoute(route) === '/' ? '/' : cleanRoute(route)}`;

export const encodedRoute = (base, value) => `${base}/${encodeURIComponent(value)}`;

// Every entry gets a static HTML page. `canonical` is the URL the page declares
// as canonical, and only entries with `inSitemap` are listed in the sitemap.
// `/collection` renders the same view as `/`, so it canonicalizes to the home
// page and stays out of the sitemap while its URL keeps working.
export const getRouteEntries = (comics = readComics()) => {
  const inventory = getCollectionInventory(comics);
  const entries = [];

  const add = (route, { canonicalRoute = route, inSitemap = true, ...options }) => {
    entries.push({
      route: cleanRoute(route),
      loc: absoluteUrl(route),
      canonical: absoluteUrl(canonicalRoute),
      inSitemap,
      ...options,
    });
  };

  add('/', { changefreq: 'daily', priority: '1.0', type: 'home' });
  add('/collection', { canonicalRoute: '/', inSitemap: false, type: 'collection' });
  add('/stats', { changefreq: 'weekly', priority: '0.8', type: 'stats' });
  add('/raw', { changefreq: 'weekly', priority: '0.7', type: 'raw' });
  add('/slabbed', { changefreq: 'weekly', priority: '0.7', type: 'slabbed' });
  add('/variants', { changefreq: 'weekly', priority: '0.7', type: 'variants' });
  add('/boxes', { changefreq: 'weekly', priority: '0.6', type: 'boxes' });

  comics.forEach((comic) => {
    add(`/comic/${createComicSlug(comic)}`, {
      changefreq: 'monthly',
      priority: '0.6',
      type: 'comic',
      comic,
    });
  });

  inventory.seriesNames.forEach((series) => {
    add(encodedRoute('/series', series), {
      changefreq: 'weekly',
      priority: '0.7',
      type: 'series',
      value: series,
      comics: comics.filter((comic) => comic.seriesName === series),
    });
  });

  inventory.storageLocations.forEach((location) => {
    add(encodedRoute('/storage', location), {
      changefreq: 'weekly',
      priority: '0.5',
      type: 'storage',
      value: location,
      comics: comics.filter((comic) => comic.storageLocation === location),
    });
  });

  inventory.coverArtists.forEach((artist) => {
    add(encodedRoute('/artist', artist), {
      changefreq: 'monthly',
      priority: '0.5',
      type: 'artist',
      value: artist,
      comics: comics.filter((comic) => comic.coverArtist === artist),
    });
  });

  inventory.userTags.forEach((tag) => {
    add(encodedRoute('/tag', tag), {
      changefreq: 'monthly',
      priority: '0.5',
      type: 'tag',
      value: tag,
      comics: comics.filter((comic) => (comic.tags || []).includes(tag)),
    });
  });

  inventory.computedTags.forEach((tag) => {
    add(encodedRoute('/tag', tag), {
      changefreq: 'monthly',
      priority: '0.5',
      type: 'tag',
      value: tag,
      comics: comics.filter((comic) => computeTagsForComic(comic).includes(tag)),
    });
  });

  return { ...inventory, entries };
};

export const getSitemapEntries = (entries) => entries.filter((entry) => entry.inSitemap);

const escapeXml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

// No <lastmod>: the collection sync rewrites every record's updatedAt (and many
// createdAt values) on each run, so record timestamps do not describe page
// changes. Search engines ignore lastmod values that are not accurate.
export const buildSitemapXml = (entries) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${getSitemapEntries(entries).map((entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

const unescapeXml = (value) => value
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'")
  .replace(/&amp;/g, '&');

export const parseSitemapLocs = (xml) => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => unescapeXml(match[1]));

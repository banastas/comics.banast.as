import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const comicsPath = path.join(rootDir, 'src/data/comics.json');

export const siteOrigin = 'https://comics.banast.as';

export const readComics = () => JSON.parse(fs.readFileSync(comicsPath, 'utf8'));

export const toDateOnly = (date) => new Date(date).toISOString().split('T')[0];

export const maxDate = (dates) => {
  const validDates = dates
    .filter(Boolean)
    .map((date) => new Date(date).getTime())
    .filter((timestamp) => !Number.isNaN(timestamp));

  if (validDates.length === 0) {
    return toDateOnly(new Date());
  }

  return toDateOnly(Math.max(...validDates));
};

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

export const computeTagsForComic = (comic) => {
  const computed = [];
  const year = new Date(comic.releaseDate).getFullYear();

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
  if (comic.currentValue && comic.currentValue >= 50) computed.push('High Value');

  if (comic.currentValue && comic.purchasePrice && comic.purchasePrice > 0) {
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

export const getRouteEntries = (comics = readComics()) => {
  const inventory = getCollectionInventory(comics);
  const siteLastModified = maxDate(comics.map((comic) => comic.updatedAt));
  const lastModifiedFor = (predicate) => maxDate(comics.filter(predicate).map((comic) => comic.updatedAt));
  const entries = [];

  const add = (route, options) => {
    entries.push({
      route: cleanRoute(route),
      loc: absoluteUrl(route),
      ...options,
    });
  };

  add('/', {
    lastmod: siteLastModified,
    changefreq: 'daily',
    priority: '1.0',
    type: 'home',
  });
  add('/collection', {
    lastmod: siteLastModified,
    changefreq: 'daily',
    priority: '0.9',
    type: 'collection',
  });
  add('/stats', {
    lastmod: siteLastModified,
    changefreq: 'weekly',
    priority: '0.8',
    type: 'stats',
  });
  add('/raw', {
    lastmod: lastModifiedFor((comic) => !comic.isSlabbed),
    changefreq: 'weekly',
    priority: '0.7',
    type: 'raw',
  });
  add('/slabbed', {
    lastmod: lastModifiedFor((comic) => comic.isSlabbed),
    changefreq: 'weekly',
    priority: '0.7',
    type: 'slabbed',
  });
  add('/variants', {
    lastmod: lastModifiedFor((comic) => comic.isVariant),
    changefreq: 'weekly',
    priority: '0.7',
    type: 'variants',
  });
  add('/boxes', {
    lastmod: siteLastModified,
    changefreq: 'weekly',
    priority: '0.6',
    type: 'boxes',
  });

  comics.forEach((comic) => {
    add(`/comic/${createComicSlug(comic)}`, {
      lastmod: comic.updatedAt ? toDateOnly(comic.updatedAt) : siteLastModified,
      changefreq: 'monthly',
      priority: '0.6',
      type: 'comic',
      comic,
    });
  });

  inventory.seriesNames.forEach((series) => {
    add(encodedRoute('/series', series), {
      lastmod: lastModifiedFor((comic) => comic.seriesName === series),
      changefreq: 'weekly',
      priority: '0.7',
      type: 'series',
      value: series,
      comics: comics.filter((comic) => comic.seriesName === series),
    });
  });

  inventory.storageLocations.forEach((location) => {
    add(encodedRoute('/storage', location), {
      lastmod: lastModifiedFor((comic) => comic.storageLocation === location),
      changefreq: 'weekly',
      priority: '0.5',
      type: 'storage',
      value: location,
      comics: comics.filter((comic) => comic.storageLocation === location),
    });
  });

  inventory.coverArtists.forEach((artist) => {
    add(encodedRoute('/artist', artist), {
      lastmod: lastModifiedFor((comic) => comic.coverArtist === artist),
      changefreq: 'monthly',
      priority: '0.5',
      type: 'artist',
      value: artist,
      comics: comics.filter((comic) => comic.coverArtist === artist),
    });
  });

  inventory.userTags.forEach((tag) => {
    add(encodedRoute('/tag', tag), {
      lastmod: lastModifiedFor((comic) => (comic.tags || []).includes(tag)),
      changefreq: 'monthly',
      priority: '0.5',
      type: 'tag',
      value: tag,
      comics: comics.filter((comic) => (comic.tags || []).includes(tag)),
    });
  });

  inventory.computedTags.forEach((tag) => {
    add(encodedRoute('/tag', tag), {
      lastmod: lastModifiedFor((comic) => computeTagsForComic(comic).includes(tag)),
      changefreq: 'monthly',
      priority: '0.5',
      type: 'tag',
      value: tag,
      comics: comics.filter((comic) => computeTagsForComic(comic).includes(tag)),
    });
  });

  return { ...inventory, entries };
};

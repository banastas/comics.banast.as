import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read comics data
const comicsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/comics.json'), 'utf-8')
);

// Get unique series names
const seriesNames = [...new Set(comicsData.map(comic => comic.seriesName))];

// Get unique storage locations
const storageLocations = [...new Set(comicsData.map(comic => comic.storageLocation).filter(Boolean))];

// Get unique cover artists
const coverArtists = [...new Set(comicsData.map(comic => comic.coverArtist).filter(Boolean))];

// Get unique user tags
const tags = [...new Set(comicsData.flatMap(comic => comic.tags || []))];

const toDateOnly = (date) => new Date(date).toISOString().split('T')[0];
const maxDate = (dates) => {
  const validDates = dates
    .filter(Boolean)
    .map((date) => new Date(date).getTime())
    .filter((timestamp) => !Number.isNaN(timestamp));

  if (validDates.length === 0) {
    return toDateOnly(new Date());
  }

  return toDateOnly(Math.max(...validDates));
};

const siteLastModified = maxDate(comicsData.map(comic => comic.updatedAt));
const lastModifiedFor = (predicate) => {
  return maxDate(comicsData.filter(predicate).map(comic => comic.updatedAt));
};

// Compute smart tags for a comic (mirrors src/stores/comicStore.ts)
const computeTagsForComic = (comic) => {
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

// Count computed tags, include only those with >= 5 comics
const computedTagCounts = new Map();
comicsData.forEach(comic => {
  computeTagsForComic(comic).forEach(tag => {
    computedTagCounts.set(tag, (computedTagCounts.get(tag) || 0) + 1);
  });
});
const computedTags = Array.from(computedTagCounts.entries())
  .filter(([, count]) => count >= 5)
  .map(([tag]) => tag);

// Generate sitemap URLs
const urls = [];

// Homepage
urls.push({
  loc: 'https://comics.banast.as/',
  lastmod: siteLastModified,
  changefreq: 'daily',
  priority: '1.0'
});

// Collection page
urls.push({
  loc: 'https://comics.banast.as/#/collection',
  lastmod: siteLastModified,
  changefreq: 'daily',
  priority: '0.9'
});

// Statistics page
urls.push({
  loc: 'https://comics.banast.as/#/stats',
  lastmod: siteLastModified,
  changefreq: 'weekly',
  priority: '0.8'
});

// Raw comics page
urls.push({
  loc: 'https://comics.banast.as/#/raw',
  lastmod: lastModifiedFor(comic => !comic.isSlabbed),
  changefreq: 'weekly',
  priority: '0.7'
});

// Slabbed comics page
urls.push({
  loc: 'https://comics.banast.as/#/slabbed',
  lastmod: lastModifiedFor(comic => comic.isSlabbed),
  changefreq: 'weekly',
  priority: '0.7'
});

// Variants page
urls.push({
  loc: 'https://comics.banast.as/#/variants',
  lastmod: lastModifiedFor(comic => comic.isVariant),
  changefreq: 'weekly',
  priority: '0.7'
});

// Virtual boxes page
urls.push({
  loc: 'https://comics.banast.as/#/boxes',
  lastmod: siteLastModified,
  changefreq: 'weekly',
  priority: '0.6'
});

// Helper function to create SEO-friendly comic slug
const createComicSlug = (comic) => {
  const seriesSlug = comic.seriesName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const issueSlug = `issue-${comic.issueNumber}`;
  const variantSlug = comic.isVariant ? '-variant' : '';

  // Extract the numeric ID from comic.id (e.g., "comic-728" -> "728")
  const idMatch = comic.id.match(/\d+$/);
  const idSuffix = idMatch ? `-${idMatch[0]}` : '';

  return `${seriesSlug}-${issueSlug}${variantSlug}${idSuffix}`;
};

// Individual comic pages
comicsData.forEach(comic => {
  const slug = createComicSlug(comic);
  urls.push({
    loc: `https://comics.banast.as/#/comic/${slug}`,
    lastmod: comic.updatedAt ? toDateOnly(comic.updatedAt) : siteLastModified,
    changefreq: 'monthly',
    priority: '0.6'
  });
});

// Series pages
seriesNames.forEach(series => {
  urls.push({
    loc: `https://comics.banast.as/#/series/${encodeURIComponent(series)}`,
    lastmod: lastModifiedFor(comic => comic.seriesName === series),
    changefreq: 'weekly',
    priority: '0.7'
  });
});

// Storage location pages
storageLocations.forEach(location => {
  urls.push({
    loc: `https://comics.banast.as/#/storage/${encodeURIComponent(location)}`,
    lastmod: lastModifiedFor(comic => comic.storageLocation === location),
    changefreq: 'weekly',
    priority: '0.5'
  });
});

// Cover artist pages
coverArtists.forEach(artist => {
  urls.push({
    loc: `https://comics.banast.as/#/artist/${encodeURIComponent(artist)}`,
    lastmod: lastModifiedFor(comic => comic.coverArtist === artist),
    changefreq: 'monthly',
    priority: '0.5'
  });
});

// Tag pages (user-defined)
tags.forEach(tag => {
  urls.push({
    loc: `https://comics.banast.as/#/tag/${encodeURIComponent(tag)}`,
    lastmod: lastModifiedFor(comic => (comic.tags || []).includes(tag)),
    changefreq: 'monthly',
    priority: '0.5'
  });
});

// Computed tag pages (Golden Age, First Issue, etc.) — only tags with >= 5 comics
computedTags.forEach(tag => {
  urls.push({
    loc: `https://comics.banast.as/#/tag/${encodeURIComponent(tag)}`,
    lastmod: lastModifiedFor(comic => computeTagsForComic(comic).includes(tag)),
    changefreq: 'monthly',
    priority: '0.5'
  });
});

// Generate XML
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

// Write sitemap
fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);

console.log(`✅ Sitemap generated with ${urls.length} URLs`);
console.log(`   - ${comicsData.length} comics`);
console.log(`   - ${seriesNames.length} series`);
console.log(`   - ${storageLocations.length} storage locations`);
console.log(`   - ${coverArtists.length} cover artists`);
console.log(`   - ${tags.length} user tags`);
console.log(`   - ${computedTags.length} computed tags`);
console.log(`   - 7 static pages`);

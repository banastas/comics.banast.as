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

// Get unique tags
const tags = [...new Set(comicsData.flatMap(comic => comic.tags || []))];

// Generate sitemap URLs
const urls = [];

// Homepage
urls.push({
  loc: 'https://comics.banast.as/',
  lastmod: new Date().toISOString().split('T')[0],
  changefreq: 'daily',
  priority: '1.0'
});

// Collection page
urls.push({
  loc: 'https://comics.banast.as/#/collection',
  lastmod: new Date().toISOString().split('T')[0],
  changefreq: 'daily',
  priority: '0.9'
});

// Statistics page
urls.push({
  loc: 'https://comics.banast.as/#/stats',
  lastmod: new Date().toISOString().split('T')[0],
  changefreq: 'weekly',
  priority: '0.8'
});

// Raw comics page
urls.push({
  loc: 'https://comics.banast.as/#/raw',
  lastmod: new Date().toISOString().split('T')[0],
  changefreq: 'weekly',
  priority: '0.7'
});

// Slabbed comics page
urls.push({
  loc: 'https://comics.banast.as/#/slabbed',
  lastmod: new Date().toISOString().split('T')[0],
  changefreq: 'weekly',
  priority: '0.7'
});

// Variants page
urls.push({
  loc: 'https://comics.banast.as/#/variants',
  lastmod: new Date().toISOString().split('T')[0],
  changefreq: 'weekly',
  priority: '0.7'
});

// Virtual boxes page
urls.push({
  loc: 'https://comics.banast.as/#/boxes',
  lastmod: new Date().toISOString().split('T')[0],
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

  return `${seriesSlug}-${issueSlug}${variantSlug}`;
};

// Individual comic pages
comicsData.forEach(comic => {
  const slug = createComicSlug(comic);
  urls.push({
    loc: `https://comics.banast.as/#/comic/${slug}`,
    lastmod: comic.updatedAt ? new Date(comic.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.6'
  });
});

// Series pages
seriesNames.forEach(series => {
  urls.push({
    loc: `https://comics.banast.as/#/series/${encodeURIComponent(series)}`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: '0.7'
  });
});

// Storage location pages
storageLocations.forEach(location => {
  urls.push({
    loc: `https://comics.banast.as/#/storage/${encodeURIComponent(location)}`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: '0.5'
  });
});

// Cover artist pages
coverArtists.forEach(artist => {
  urls.push({
    loc: `https://comics.banast.as/#/artist/${encodeURIComponent(artist)}`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.5'
  });
});

// Tag pages
tags.forEach(tag => {
  urls.push({
    loc: `https://comics.banast.as/#/tag/${encodeURIComponent(tag)}`,
    lastmod: new Date().toISOString().split('T')[0],
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
console.log(`   - ${tags.length} tags`);
console.log(`   - 7 static pages`);

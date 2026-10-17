import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSitemapXml, getRouteEntries, getSitemapEntries } from './site-routes.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// public/sitemap.xml is derived output and is not tracked in git. `npm run build`
// regenerates it before Vite copies public/ into dist/.
const { comics, seriesNames, storageLocations, coverArtists, userTags, computedTags, entries } = getRouteEntries();
const sitemapEntries = getSitemapEntries(entries);
const staticPageCount = sitemapEntries.filter((entry) => !['comic', 'series', 'storage', 'artist', 'tag'].includes(entry.type)).length;

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), buildSitemapXml(entries));

console.log(`✅ Sitemap generated with ${sitemapEntries.length} URLs`);
console.log(`   - ${comics.length} comics`);
console.log(`   - ${seriesNames.length} series`);
console.log(`   - ${storageLocations.length} storage locations`);
console.log(`   - ${coverArtists.length} cover artists`);
console.log(`   - ${userTags.length} user tags`);
console.log(`   - ${computedTags.length} computed tags`);
console.log(`   - ${staticPageCount} static pages`);

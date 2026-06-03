import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getRouteEntries } from './site-routes.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { comics, seriesNames, storageLocations, coverArtists, userTags, computedTags, entries } = getRouteEntries();

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);

console.log(`✅ Sitemap generated with ${entries.length} URLs`);
console.log(`   - ${comics.length} comics`);
console.log(`   - ${seriesNames.length} series`);
console.log(`   - ${storageLocations.length} storage locations`);
console.log(`   - ${coverArtists.length} cover artists`);
console.log(`   - ${userTags.length} user tags`);
console.log(`   - ${computedTags.length} computed tags`);
console.log('   - 7 static pages');

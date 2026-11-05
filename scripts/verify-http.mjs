import assert from 'node:assert/strict';
import fs from 'node:fs';

// Crawls a running site: `wrangler pages dev dist`, a Cloudflare preview, or
// production. Every URL from a sitemap must answer 200 with the canonical URL
// the sitemap lists, unknown paths must 404, and the API must match the data.
//
//   node scripts/verify-http.mjs <origin> [sitemap file or URL]
//
// Pass the production sitemap to prove a new deployment serves every URL the
// live site already publishes.

const [origin, sitemapSource = 'dist/sitemap.xml'] = process.argv.slice(2);
assert(origin, 'Usage: node scripts/verify-http.mjs <origin> [sitemap file or URL]');

const unescapeEntities = (value) => value
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;|&#x27;|&apos;/g, "'").replace(/&amp;/g, '&');

const sitemap = /^https?:/.test(sitemapSource)
  ? await (await fetch(sitemapSource)).text()
  : fs.readFileSync(sitemapSource, 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => unescapeEntities(loc));
assert(locs.length > 0, `No URLs in ${sitemapSource}`);
const comics = JSON.parse(fs.readFileSync('src/data/comics.json', 'utf8'));

const failures = [];
let cursor = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (cursor < locs.length) {
    const loc = locs[cursor++];
    const url = new URL(loc);
    try {
      const response = await fetch(new URL(`${url.pathname}${url.search}`, origin), { signal: AbortSignal.timeout(15000) });
      assert.equal(response.status, 200, `HTTP ${response.status}`);
      const html = await response.text();
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
      assert.equal(canonical && unescapeEntities(canonical), loc, 'canonical');
      assert(html.includes('application/ld+json'), 'missing structured data');
    } catch (error) {
      failures.push(`${loc}: ${error.message}`);
    }
  }
}));

const missing = await fetch(new URL('/qa-route-does-not-exist', origin));
assert.equal(missing.status, 404, 'Unknown routes must return HTTP 404');
assert((await missing.text()).includes('noindex'), '404 pages must not be indexed');

const api = await (await fetch(new URL('/api/comics', origin))).json();
assert.equal(api.count, comics.length);
assert.deepEqual(api.comics.map((comic) => comic.id), comics.map((comic) => comic.id));
const stats = await (await fetch(new URL('/api/comics/stats', origin))).json();
assert.equal(stats.totalCount, comics.length);
assert.equal(stats.totalValue, Math.round(comics.reduce((sum, comic) => sum + (comic.currentValue ?? 0), 0) * 100) / 100);

assert.deepEqual(failures, [], `${failures.length} failed URLs:\n${failures.slice(0, 40).join('\n')}`);
console.log(`HTTP verification passed: ${locs.length} URLs from ${sitemapSource}, 404 response, API records and statistics`);

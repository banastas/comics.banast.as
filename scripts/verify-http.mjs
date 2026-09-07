import assert from 'node:assert/strict';
import { getRouteEntries } from './site-routes.mjs';

// Run against `wrangler pages dev dist` or an explicitly chosen live origin.
// This verifies HTTP behavior independently of the generator's file lookup.
const origin = process.argv[2];
assert(origin, 'Usage: node scripts/verify-http.mjs http://127.0.0.1:5198');
const { entries, comics } = getRouteEntries();
const failures = [];
let cursor = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (cursor < entries.length) {
    const entry = entries[cursor++];
    try {
      const response = await fetch(new URL(entry.route, origin), { signal: AbortSignal.timeout(15000) });
      assert.equal(response.status, 200, `HTTP ${response.status}`);
      const html = await response.text();
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
      assert.equal(canonical, entry.loc.replaceAll('&', '&amp;').replaceAll("'", '&#39;'));
      assert(html.includes('comics-structured-data'), 'Missing structured data');
    } catch (error) { failures.push(`${entry.route}: ${error.message}`); }
  }
}));
const missing = await fetch(new URL('/qa-route-does-not-exist', origin));
assert.equal(missing.status, 404, 'Unknown routes must return HTTP 404');
assert((await missing.text()).includes('noindex'), '404 pages must not be indexed');
const api = await (await fetch(new URL('/api/comics', origin))).json();
assert.equal(api.count, comics.length);
assert.deepEqual(api.comics.map(c => c.id), comics.map(c => c.id));
const stats = await (await fetch(new URL('/api/comics/stats', origin))).json();
assert.equal(stats.totalCount, comics.length);
assert.equal(stats.totalValue, Math.round(comics.reduce((sum, c) => sum + (c.currentValue ?? 0), 0) * 100) / 100);
assert.deepEqual(failures, [], `${failures.length} failed routes:\n${failures.join('\n')}`);
console.log(`HTTP verification passed: ${entries.length} routes, canonical metadata, 404 response, API records and statistics`);

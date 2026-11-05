import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// Checks the built site in dist/ the way Cloudflare Pages will serve it. It
// reads the sitemap rather than the route code, so it independently confirms
// that every listed URL has a page with matching metadata.

const SITE = 'https://comics.banast.as';
const distDir = path.resolve('dist');
const comics = JSON.parse(fs.readFileSync('src/data/comics.json', 'utf8'));

const unescapeEntities = (value) => value
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;|&#x27;|&apos;/g, "'").replace(/&amp;/g, '&');

/** The file Cloudflare serves for a URL path: decoded, flat `<path>.html`. */
export const fileForPath = (urlPath) => {
  const decoded = decodeURIComponent(urlPath);
  const file = decoded === '/' ? path.join(distDir, 'index.html') : path.resolve(distDir, `.${decoded}.html`);
  assert(file.startsWith(`${distDir}${path.sep}`), `Route escapes dist/: ${urlPath}`);
  return file;
};

const metaContent = (html, attribute, key) => {
  const match = html.match(new RegExp(`<meta ${attribute}="${key}" content="([^"]*)"`));
  return match ? unescapeEntities(match[1]) : undefined;
};

const sitemap = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => unescapeEntities(loc));
assert(locs.length > comics.length, `Sitemap lists ${locs.length} URLs for ${comics.length} comics`);
assert.equal(new Set(locs).size, locs.length, 'Sitemap contains duplicate URLs');
assert(!sitemap.includes('<lastmod>'), 'Sitemap must not emit lastmod');

const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

for (const loc of locs) {
  const url = new URL(loc);
  check(url.origin === SITE && !url.hash, `Unexpected sitemap URL ${loc}`);
  const file = fileForPath(url.pathname);
  if (!fs.existsSync(file)) { failures.push(`Missing page for ${loc}`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  check(canonical && unescapeEntities(canonical) === loc, `${loc}: canonical is ${canonical}`);
  check(metaContent(html, 'property', 'og:url') === loc, `${loc}: og:url mismatch`);
  check(metaContent(html, 'name', 'twitter:url') === loc, `${loc}: twitter:url mismatch`);
  check(metaContent(html, 'name', 'robots')?.includes('max-image-preview:large'), `${loc}: robots must be indexable`);
  check(/<title>[^<]+<\/title>/.test(html), `${loc}: missing title`);
  check(Boolean(metaContent(html, 'name', 'description')), `${loc}: missing description`);
  check(/<h1[\s>]/.test(html), `${loc}: missing rendered <h1>`);
  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  if (!jsonLd) failures.push(`${loc}: missing JSON-LD`);
  else {
    try { JSON.parse(jsonLd); } catch { failures.push(`${loc}: invalid JSON-LD`); }
    check(!/"(?:offers|AggregateOffer|Offer|additionalProperty)"/.test(jsonLd), `${loc}: JSON-LD must not describe offers`);
  }
  for (const [, ref] of html.matchAll(/(?:src|href)="(\/[^"#?]+\.(?:js|css|woff2|png|svg|ico|json|jpg))"/g)) {
    check(fs.existsSync(path.join(distDir, decodeURIComponent(ref).slice(1))), `${loc}: missing asset ${ref}`);
  }
  for (const key of ['og:image', 'twitter:image']) {
    const image = metaContent(html, key.startsWith('og') ? 'property' : 'name', key);
    if (image?.startsWith(SITE)) check(fs.existsSync(path.join(distDir, new URL(image).pathname.slice(1))), `${loc}: missing ${image}`);
  }
}

const collection = fs.readFileSync(fileForPath('/collection'), 'utf8');
check(collection.includes(`<link rel="canonical" href="${SITE}/"`), '/collection must canonicalize to /');
check(!locs.includes(`${SITE}/collection`), '/collection must stay out of the sitemap');

const notFound = fs.readFileSync(path.join(distDir, '404.html'), 'utf8');
check(notFound.includes('noindex'), '404 page must be noindex');
check(!notFound.includes('rel="canonical"'), '404 page must not declare a canonical URL');

const data = JSON.parse(fs.readFileSync(path.join(distDir, 'data/comics.json'), 'utf8'));
check(data.length === comics.length, `/data/comics.json has ${data.length} comics, expected ${comics.length}`);

// Every inline script must be allowed by hash in the CSP, and the placeholder must be gone.
const headers = fs.readFileSync(path.join(distDir, '_headers'), 'utf8');
check(!headers.includes('__INLINE_SCRIPT_HASHES__'), '_headers still contains the CSP placeholder');
const scriptSrc = headers.match(/Content-Security-Policy:[^\n]*?script-src ([^;]+)/)?.[1] ?? '';
const htmlFiles = fs.readdirSync(distDir, { recursive: true }).filter((file) => String(file).endsWith('.html'));
const inline = new Set();
htmlFiles.forEach((file) => {
  const html = fs.readFileSync(path.join(distDir, String(file)), 'utf8');
  for (const [, body] of html.matchAll(/<script(?![^>]*\ssrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g)) {
    if (body.trim()) inline.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  }
});
inline.forEach((hash) => check(scriptSrc.includes(hash), `CSP is missing inline script hash ${hash}`));
check(!/'unsafe-inline'|'unsafe-eval'/.test(scriptSrc), 'script-src must not allow unsafe-inline or unsafe-eval');

check(htmlFiles.every((file) => !String(file).includes('%')), 'Built file names must be decoded');
check(fs.readdirSync(distDir).every((file) => !/\.test\.[cm]?[jt]sx?$/.test(file)), 'Test files leaked into dist/');

assert.deepEqual(failures, [], `${failures.length} problem(s):\n${failures.slice(0, 40).join('\n')}`);
console.log(`Build verification passed: ${locs.length} sitemap URLs, ${htmlFiles.length} pages, ${inline.size} inline script hashes`);

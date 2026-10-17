import { staticRoutePath } from './static-route-path.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { getRouteEntries, getSitemapEntries, createComicSlug, parseSitemapLocs, siteOrigin } from './site-routes.mjs';

const distDir = path.resolve('dist');
const { comics, entries } = getRouteEntries();

const routeToFile = (route) => staticRoutePath(distDir, route);

const readPage = (route) => fs.readFileSync(routeToFile(route), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};
const escapeHtml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// public/sitemap.xml is untracked derived output; check the copy the build shipped.
const sitemapPath = path.join(distDir, 'sitemap.xml');
assert(fs.existsSync(sitemapPath), 'Missing dist/sitemap.xml; run `npm run build`, which regenerates the sitemap');
const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const sitemapUrls = parseSitemapLocs(sitemap);
const sitemapEntries = getSitemapEntries(entries);

assert(sitemapUrls.length === sitemapEntries.length, `Expected ${sitemapEntries.length} sitemap URLs, found ${sitemapUrls.length}`);
assert(new Set(sitemapUrls).size === sitemapUrls.length, 'Sitemap contains duplicate URLs');
assert(sitemapUrls.every((url) => !url.includes('/#/')), 'Sitemap still contains hash URLs');
assert(!sitemap.includes('<lastmod>'), 'Sitemap must not emit lastmod derived from sync timestamps');

const sourceShell = fs.readFileSync('index.html', 'utf8');
const indexRobots = sourceShell.match(/<meta name="robots" content="([^"]+)"/)?.[1];
assert(indexRobots?.includes('max-image-preview:large'), 'index.html robots meta must allow large image previews');

for (const entry of entries) {
  const filePath = routeToFile(entry.route);
  assert(fs.existsSync(filePath), `Missing static page for ${entry.route}`);
  if (entry.inSitemap) {
    assert(entry.canonical === entry.loc, `Sitemap route ${entry.route} must be self-canonical`);
    assert(sitemapUrls.includes(entry.loc), `Missing sitemap URL for ${entry.loc}`);
  } else {
    assert(!sitemapUrls.includes(entry.loc), `Non-canonical route ${entry.route} must not be listed in the sitemap`);
    assert(sitemapUrls.includes(entry.canonical), `Canonical target ${entry.canonical} for ${entry.route} is missing from the sitemap`);
  }

  const page = fs.readFileSync(filePath, 'utf8');
  const escapedCanonical = escapeHtml(entry.canonical);
  assert(page.includes(`<link rel="canonical" href="${escapedCanonical}" />`), `Missing canonical URL for ${entry.route}`);
  assert(page.includes(`<meta property="og:url" content="${escapedCanonical}" />`), `Missing Open Graph URL for ${entry.route}`);
  assert(page.includes(`<meta name="twitter:url" content="${escapedCanonical}" />`), `Missing Twitter URL for ${entry.route}`);
  assert(page.includes(`<meta name="robots" content="${indexRobots}" />`), `Robots meta for ${entry.route} must match index.html`);
  assert(/<title>[^<]+<\/title>/.test(page), `Missing title for ${entry.route}`);
  assert(/<meta name="description" content="[^"]+"\s*\/>/.test(page), `Missing description for ${entry.route}`);
  assert(page.includes('<div id="root">'), `Missing prerendered root content for ${entry.route}`);
  assert(!page.includes(`${siteOrigin}/#/`), `Static metadata still contains a hash URL for ${entry.route}`);

  const structuredData = page.match(/<script id="comics-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert(structuredData, `Missing JSON-LD for ${entry.route}`);
  let jsonLd;
  try {
    jsonLd = JSON.parse(structuredData);
  } catch {
    throw new Error(`Invalid JSON-LD for ${entry.route}`);
  }
  assert(!/"(?:offers|AggregateOffer|Offer|additionalProperty)"/.test(structuredData), `JSON-LD for ${entry.route} must not describe offers or additionalProperty`);
  assert(!(jsonLd['@type'] === 'Collection' || jsonLd['@type'] === 'ComicSeries') || !('numberOfItems' in jsonLd), `JSON-LD for ${entry.route} uses numberOfItems outside an ItemList`);

  for (const match of page.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
    assert(fs.existsSync(path.join(distDir, match[1].slice(1))), `Missing built asset ${match[1]} referenced by ${entry.route}`);
  }

  for (const match of page.matchAll(/<meta (?:property="og:image"|name="twitter:image") content="([^"]+)"/g)) {
    const imageUrl = new URL(match[1]);
    if (imageUrl.origin === siteOrigin) {
      assert(fs.existsSync(path.join(distDir, imageUrl.pathname.slice(1))), `Missing same-origin social image ${imageUrl.pathname}`);
    }
  }
}

assert(fs.existsSync(path.join(distDir, '404.html')), 'Missing custom 404 page; unknown Cloudflare Pages routes would fall back to the SPA shell');
assert(fs.existsSync(path.join(distDir, '_headers')), 'Missing Cloudflare Pages security headers');
assert(
  fs.readdirSync(distDir).every((file) => !/\.test\.[cm]?[jt]sx?$/.test(file)),
  'Test source files leaked into the deployment root',
);

const sampleComic = comics.find((comic) => comic.id === 'comic-803') || comics[comics.length - 1];
const sampleRoute = `/comic/${createComicSlug(sampleComic)}`;
const samplePage = readPage(sampleRoute);

assert(samplePage.includes(`<link rel="canonical" href="${siteOrigin}${sampleRoute}" />`), 'Sample comic page is missing clean canonical URL');
assert(samplePage.includes('"@type":"ComicIssue"'), 'Sample comic page is missing ComicIssue JSON-LD');
assert(samplePage.includes(`${sampleComic.seriesName} #${sampleComic.issueNumber}`), 'Sample comic fallback content is missing comic title');
assert(samplePage.includes(`"name":${JSON.stringify(`${sampleComic.seriesName} #${sampleComic.issueNumber}`).slice(0, -1)}`), 'Sample comic JSON-LD name must include the issue number');
assert(!samplePage.includes(`${siteOrigin}/#/comic/`), 'Sample comic page still points structured metadata at hash URLs');

const homePage = readPage('/');
assert(homePage.includes('"@type":"Collection"'), 'Home page is missing Collection JSON-LD');
assert(homePage.includes(`${comics.length} comics`), 'Home page fallback content is missing collection count');

const collectionPage = readPage('/collection');
assert(collectionPage.includes(`<link rel="canonical" href="${siteOrigin}/" />`), '/collection must canonicalize to the home page');

console.log(`✅ Static page verification passed: ${entries.length} static pages, ${sitemapEntries.length} sitemap URLs`);

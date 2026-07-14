import fs from 'node:fs';
import path from 'node:path';
import { getRouteEntries, createComicSlug, siteOrigin } from './site-routes.mjs';

const distDir = path.resolve('dist');
const { comics, entries } = getRouteEntries();

const routeToFile = (route) => {
  if (route === '/') return path.join(distDir, 'index.html');
  return path.join(distDir, ...route.slice(1).split('/'), 'index.html');
};

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

const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

assert(sitemapUrls.length === entries.length, `Expected ${entries.length} sitemap URLs, found ${sitemapUrls.length}`);
assert(sitemapUrls.every((url) => !url.includes('/#/')), 'Sitemap still contains hash URLs');

for (const entry of entries) {
  const filePath = routeToFile(entry.route);
  assert(fs.existsSync(filePath), `Missing static page for ${entry.route}`);
  assert(sitemapUrls.includes(entry.loc), `Missing sitemap URL for ${entry.loc}`);

  const page = fs.readFileSync(filePath, 'utf8');
  const escapedLoc = escapeHtml(entry.loc);
  assert(page.includes(`<link rel="canonical" href="${escapedLoc}" />`), `Missing canonical URL for ${entry.route}`);
  assert(page.includes(`<meta property="og:url" content="${escapedLoc}" />`), `Missing Open Graph URL for ${entry.route}`);
  assert(page.includes(`<meta name="twitter:url" content="${escapedLoc}" />`), `Missing Twitter URL for ${entry.route}`);
  assert(/<title>[^<]+<\/title>/.test(page), `Missing title for ${entry.route}`);
  assert(/<meta name="description" content="[^"]+"\s*\/>/.test(page), `Missing description for ${entry.route}`);
  assert(page.includes('<div id="root">'), `Missing prerendered root content for ${entry.route}`);
  assert(!page.includes(`${siteOrigin}/#/`), `Static metadata still contains a hash URL for ${entry.route}`);

  const structuredData = page.match(/<script id="comics-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert(structuredData, `Missing JSON-LD for ${entry.route}`);
  try {
    JSON.parse(structuredData);
  } catch {
    throw new Error(`Invalid JSON-LD for ${entry.route}`);
  }

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
assert(!samplePage.includes(`${siteOrigin}/#/comic/`), 'Sample comic page still points structured metadata at hash URLs');

const homePage = readPage('/');
assert(homePage.includes('"@type":"Collection"'), 'Home page is missing Collection JSON-LD');
assert(homePage.includes(`${comics.length} comics`), 'Home page fallback content is missing collection count');

console.log(`✅ Static page verification passed: ${entries.length} clean URLs`);

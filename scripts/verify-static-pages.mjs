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

const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

assert(sitemapUrls.length === entries.length, `Expected ${entries.length} sitemap URLs, found ${sitemapUrls.length}`);
assert(sitemapUrls.every((url) => !url.includes('/#/')), 'Sitemap still contains hash URLs');

for (const entry of entries) {
  assert(fs.existsSync(routeToFile(entry.route)), `Missing static page for ${entry.route}`);
  assert(sitemapUrls.includes(entry.loc), `Missing sitemap URL for ${entry.loc}`);
}

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

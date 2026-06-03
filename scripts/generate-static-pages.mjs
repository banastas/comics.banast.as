import fs from 'node:fs';
import path from 'node:path';
import { getRouteEntries, siteOrigin, createComicSlug } from './site-routes.mjs';

const distDir = path.resolve('dist');
const indexPath = path.join(distDir, 'index.html');

const html = fs.readFileSync(indexPath, 'utf8');
const { comics, seriesNames, storageLocations, coverArtists, computedTags, entries } = getRouteEntries();

const collectionStats = {
  totalComics: comics.length,
  totalValue: comics.reduce((sum, comic) => sum + (comic.currentValue ?? 0), 0),
  uniqueSeries: seriesNames.length,
  slabbedCount: comics.filter((comic) => comic.isSlabbed).length,
  rawCount: comics.filter((comic) => !comic.isSlabbed).length,
  variantCount: comics.filter((comic) => comic.isVariant).length,
};

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const escapeScriptJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

const formatCurrency = (value = 0) => value.toLocaleString('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const titleWithSuffix = (title) => title.includes('comics.banast.as') ? title : `${title} | comics.banast.as`;

const collectionStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Collection',
  name: 'comics.banast.as',
  description: 'Personal comic book collection with tracking and valuation',
  author: { '@id': 'https://banast.as/#person' },
  numberOfItems: collectionStats.totalComics,
  offers: {
    '@type': 'AggregateOffer',
    price: Math.round(collectionStats.totalValue * 100) / 100,
    priceCurrency: 'USD',
  },
};

const itemListStructuredData = (name, itemComics, url) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name,
  url,
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: itemComics.length,
    itemListElement: itemComics.slice(0, 25).map((comic, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteOrigin}/comic/${createComicSlug(comic)}`,
      name: `${comic.seriesName} #${comic.issueNumber}`,
    })),
  },
});

const comicStructuredData = (comic, url) => ({
  '@context': 'https://schema.org',
  '@type': 'ComicIssue',
  name: comic.title || `${comic.seriesName} #${comic.issueNumber}`,
  issueNumber: comic.issueNumber,
  datePublished: comic.releaseDate,
  image: comic.coverImageUrl,
  url,
  ...(comic.coverArtist && {
    artist: {
      '@type': 'Person',
      name: comic.coverArtist,
    },
  }),
  ...(comic.currentValue && {
    offers: {
      '@type': 'Offer',
      price: comic.currentValue,
      priceCurrency: 'USD',
    },
  }),
  ...(comic.signedBy && comic.signedBy.trim() !== '' && {
    additionalProperty: {
      '@type': 'PropertyValue',
      name: 'signedBy',
      value: comic.signedBy,
    },
  }),
});

const seriesStructuredData = (seriesName, seriesComics) => ({
  '@context': 'https://schema.org',
  '@type': 'ComicSeries',
  name: seriesName,
  numberOfItems: seriesComics.length,
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: Math.min(...seriesComics.map((comic) => comic.currentValue || 0)),
    highPrice: Math.max(...seriesComics.map((comic) => comic.currentValue || 0)),
    priceCurrency: 'USD',
  },
});

const previewShell = ({ title, description, eyebrow = 'comics.banast.as', coverImageUrl, details = [] }) => `
      <main style="min-height:100vh;background:#0d1117;color:#f8fafc;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:32px;">
        <section style="max-width:960px;margin:0 auto;display:grid;gap:24px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));align-items:start;">
          ${coverImageUrl ? `<img src="${escapeHtml(coverImageUrl)}" alt="" width="320" height="480" style="width:100%;max-width:320px;border-radius:8px;border:1px solid #334155;background:#111827;" />` : ''}
          <div>
            <p style="margin:0 0 8px;color:#60a5fa;font-size:14px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">${escapeHtml(eyebrow)}</p>
            <h1 style="margin:0 0 16px;font-size:clamp(32px,6vw,56px);line-height:1.05;">${escapeHtml(title)}</h1>
            <p style="margin:0 0 24px;color:#cbd5e1;font-size:18px;line-height:1.6;">${escapeHtml(description)}</p>
            ${details.length > 0 ? `<dl style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:0;">${details.map(([label, value]) => `
              <div style="padding:12px;border:1px solid #1e293b;border-radius:8px;background:#111827;">
                <dt style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.04em;">${escapeHtml(label)}</dt>
                <dd style="margin:4px 0 0;font-size:18px;font-weight:700;">${escapeHtml(value)}</dd>
              </div>`).join('')}
            </dl>` : ''}
          </div>
        </section>
      </main>`;

const pageMeta = (entry) => {
  const url = entry.loc;

  switch (entry.type) {
    case 'comic': {
      const comic = entry.comic;
      const title = `${comic.seriesName} #${comic.issueNumber}${comic.isVariant ? ' (Variant)' : ''}`;
      const description = `${comic.seriesName} Issue #${comic.issueNumber}${comic.coverArtist ? ` - Cover art by ${comic.coverArtist}` : ''}. Grade: ${comic.grade}${comic.isSlabbed ? ' (Slabbed)' : ''}${comic.isVariant ? ' (Variant Cover)' : ''}${comic.signedBy?.trim() ? ` Signed by ${comic.signedBy}` : ''}`;

      return {
        title,
        description,
        keywords: `${comic.seriesName}, comic book, issue ${comic.issueNumber}, ${comic.coverArtist || 'comic'}, comic collection`,
        image: comic.coverImageUrl || `${siteOrigin}/og-image.jpg`,
        type: 'article',
        url,
        structuredData: comicStructuredData(comic, url),
        fallback: previewShell({
          title,
          description,
          coverImageUrl: comic.coverImageUrl,
          details: [
            ['Grade', comic.grade],
            ['Current Value', formatCurrency(comic.currentValue ?? 0)],
            ['Condition', comic.isSlabbed ? 'Slabbed' : 'Raw'],
            ['Storage', comic.storageLocation || 'Unassigned'],
          ],
        }),
      };
    }
    case 'series':
      return {
        title: `${entry.value} Series`,
        description: `Browse ${entry.comics.length} comics from the ${entry.value} series in Bill's collection.`,
        keywords: `${entry.value}, comic book series, comic collection`,
        image: entry.comics.find((comic) => comic.coverImageUrl)?.coverImageUrl || `${siteOrigin}/og-image.jpg`,
        type: 'website',
        url,
        structuredData: seriesStructuredData(entry.value, entry.comics),
        fallback: previewShell({
          title: entry.value,
          description: `Series page for ${entry.comics.length} comics in the collection.`,
          details: [
            ['Issues', entry.comics.length],
            ['Total Value', formatCurrency(entry.comics.reduce((sum, comic) => sum + (comic.currentValue ?? 0), 0))],
          ],
        }),
      };
    case 'artist':
      return {
        title: `${entry.value} - Cover Artist`,
        description: `Browse ${entry.comics.length} comics with cover art by ${entry.value}.`,
        keywords: `${entry.value}, comic book cover artist, comic collection`,
        image: entry.comics.find((comic) => comic.coverImageUrl)?.coverImageUrl || `${siteOrigin}/og-image.jpg`,
        type: 'profile',
        url,
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: entry.value,
          jobTitle: 'Comic Book Cover Artist',
          url,
        },
        fallback: previewShell({
          title: entry.value,
          description: `${entry.comics.length} comics with cover art by ${entry.value}.`,
          details: [['Comics', entry.comics.length]],
        }),
      };
    case 'storage':
      return {
        title: `${entry.value} Storage`,
        description: `Browse ${entry.comics.length} comics stored in ${entry.value}.`,
        keywords: `${entry.value}, comic storage, comic collection`,
        image: `${siteOrigin}/og-image.jpg`,
        type: 'website',
        url,
        structuredData: itemListStructuredData(`${entry.value} Storage`, entry.comics, url),
        fallback: previewShell({
          title: entry.value,
          description: `${entry.comics.length} comics stored in this virtual box.`,
          details: [['Comics', entry.comics.length]],
        }),
      };
    case 'tag':
      return {
        title: `${entry.value} Comics`,
        description: `Browse ${entry.comics.length} comics tagged ${entry.value}.`,
        keywords: `${entry.value}, tagged comics, comic collection`,
        image: entry.comics.find((comic) => comic.coverImageUrl)?.coverImageUrl || `${siteOrigin}/og-image.jpg`,
        type: 'website',
        url,
        structuredData: itemListStructuredData(`${entry.value} Comics`, entry.comics, url),
        fallback: previewShell({
          title: `${entry.value} Comics`,
          description: `${entry.comics.length} comics matching this tag.`,
          details: [['Comics', entry.comics.length]],
        }),
      };
    case 'stats':
      return {
        title: 'Collection Statistics',
        description: `Collection analytics for ${collectionStats.totalComics} comics across ${collectionStats.uniqueSeries} series.`,
        keywords: 'comic collection statistics, comic values, comic analytics',
        image: `${siteOrigin}/og-image.jpg`,
        type: 'website',
        url,
        structuredData: collectionStructuredData,
        fallback: previewShell({
          title: 'Collection Statistics',
          description: `Analytics for ${collectionStats.totalComics} comics across ${collectionStats.uniqueSeries} series.`,
          details: [
            ['Current Value', formatCurrency(collectionStats.totalValue)],
            ['Series', collectionStats.uniqueSeries],
            ['Slabbed', collectionStats.slabbedCount],
            ['Variants', collectionStats.variantCount],
          ],
        }),
      };
    case 'raw':
    case 'slabbed':
    case 'variants':
    case 'boxes': {
      const labels = {
        raw: ['Raw Comics', collectionStats.rawCount, comics.filter((comic) => !comic.isSlabbed)],
        slabbed: ['Slabbed Comics', collectionStats.slabbedCount, comics.filter((comic) => comic.isSlabbed)],
        variants: ['Variant Covers', collectionStats.variantCount, comics.filter((comic) => comic.isVariant)],
        boxes: ['Virtual Boxes', storageLocations.length, comics],
      };
      const [title, count, pageComics] = labels[entry.type];
      return {
        title,
        description: `Browse ${count} ${String(title).toLowerCase()} in the collection.`,
        keywords: `${title}, comic collection`,
        image: `${siteOrigin}/og-image.jpg`,
        type: 'website',
        url,
        structuredData: itemListStructuredData(title, pageComics, url),
        fallback: previewShell({
          title,
          description: `Browse ${count} ${String(title).toLowerCase()} in the collection.`,
          details: [['Count', count]],
        }),
      };
    }
    case 'collection':
    case 'home':
    default:
      return {
        title: 'My Collection',
        description: `View and manage Bill's comic book collection. ${collectionStats.totalComics} comics across ${collectionStats.uniqueSeries} series, total value: ${formatCurrency(collectionStats.totalValue)}.`,
        keywords: 'comic book collection, comic tracker, comic book manager, comic book database, comic book organizer, comic valuation',
        image: `${siteOrigin}/og-image.jpg`,
        type: 'website',
        url,
        structuredData: collectionStructuredData,
        fallback: previewShell({
          title: 'comics.banast.as',
          description: `${collectionStats.totalComics} comics across ${collectionStats.uniqueSeries} series, with current value tracking, storage, cover artists, variants, and slabbed/raw breakdowns.`,
          details: [
            ['Comics', collectionStats.totalComics],
            ['Series', collectionStats.uniqueSeries],
            ['Current Value', formatCurrency(collectionStats.totalValue)],
            ['Computed Tags', computedTags.length],
          ],
        }),
      };
  }
};

const replaceTag = (source, pattern, replacement) => (
  pattern.test(source) ? source.replace(pattern, replacement) : source.replace('</head>', `${replacement}\n  </head>`)
);

const replaceMeta = (source, attribute, key, content) => {
  const pattern = new RegExp(`<meta ${attribute}="${key}" content="[^"]*"\\s*/?>`);
  const replacement = `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
  return replaceTag(source, pattern, replacement);
};

const renderPage = (entry) => {
  const meta = pageMeta(entry);
  const title = titleWithSuffix(meta.title);
  let output = html
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace('<div id="root"></div>', `<div id="root">${meta.fallback}</div>`);

  output = replaceMeta(output, 'name', 'description', meta.description);
  output = replaceMeta(output, 'name', 'keywords', meta.keywords);
  output = replaceMeta(output, 'name', 'twitter:url', meta.url);
  output = replaceMeta(output, 'name', 'twitter:title', title);
  output = replaceMeta(output, 'name', 'twitter:description', meta.description);
  output = replaceMeta(output, 'name', 'twitter:image', meta.image);
  output = replaceMeta(output, 'property', 'og:type', meta.type);
  output = replaceMeta(output, 'property', 'og:url', meta.url);
  output = replaceMeta(output, 'property', 'og:title', title);
  output = replaceMeta(output, 'property', 'og:description', meta.description);
  output = replaceMeta(output, 'property', 'og:image', meta.image);

  output = output
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>\n?/g, '')
    .replace(/<script id="comics-structured-data" type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, '')
    .replace(
      '</head>',
      `    <link rel="canonical" href="${escapeHtml(meta.url)}" />\n    <script id="comics-structured-data" type="application/ld+json">${escapeScriptJson(meta.structuredData)}</script>\n  </head>`
    );

  return output;
};

const routeToFile = (route) => {
  if (route === '/') return indexPath;
  return path.join(distDir, ...route.slice(1).split('/'), 'index.html');
};

for (const entry of entries) {
  const filePath = routeToFile(entry.route);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, renderPage(entry));
}

console.log(`✅ Static clean-url pages generated: ${entries.length}`);
console.log(`   - ${comics.length} comic pages`);
console.log(`   - ${seriesNames.length} series pages`);
console.log(`   - ${coverArtists.length} artist pages`);

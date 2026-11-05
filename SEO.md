# Search and sharing contract

This document describes the SEO surface that the repository build produces. Astro renders every page to complete HTML at build time; React hydrates only interactive regions.

## Public URL model

Canonical routes use clean paths:

- `/`
- `/stats`
- `/comic/:slug`
- `/series/:slug`
- `/artist/:slug`
- `/publisher/:slug`
- `/tag/:slug`
- `/storage/:slug` and `/boxes`
- `/raw`, `/slabbed`, and `/variants`

`/collection` still works and has its own page, but it renders the same view as `/`, so it declares `https://comics.banast.as/` as its canonical URL and is not listed in the sitemap.

Old `/#/...` bookmarks remain compatible. A small inline script in `src/layouts/BaseLayout.astro` sends a legacy hash route to its clean path.

Routes come from `src/pages/` and `src/utils/site-data.ts`; permalinks from `src/utils/comic-slug.ts`, where each comic's stored `slug` keeps its URL stable across renames. Tests protect uniqueness and compatibility.

## Static pages

`npm run build` (`astro build`) writes one decoded `.html` file per public route, with `dist/index.html` for the root. Public URLs stay extensionless (`build.format: 'file'`, `trailingSlash: 'never'`). Filesystem paths use decoded names, such as `dist/series/Action Comics.html`; `integrations/static-output.mjs` decodes the `?` and `#` that Astro would otherwise leave percent-encoded. Flat HTML files avoid directory redirects that can corrupt `?`, `#`, or Unicode names.

Every page includes:

- A unique document title and description
- A canonical URL
- The robots directive `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`
- Matching Open Graph and Twitter URLs
- Open Graph and Twitter image metadata
- JSON-LD appropriate to the route
- The real page content, including the first screen of comics

## Social previews

The default collection preview is `public/og-image.jpg` at 1200 by 630 pixels. It is referenced as `https://comics.banast.as/og-image.jpg` by the collection-level pages.

Comic and grouped collection pages prefer a relevant cover image when one is available. Placeholder covers (`noCover.jpg`, or a bare `https://covers.banast.as/` directory URL) fall back to the default preview image. `npm run verify:dist` ensures that any same-origin preview asset exists in the built output.

## Structured data

The site emits these Schema.org types where appropriate:

- `Collection` (with `collectionSize`) for the collection root and statistics
- `CollectionPage` with an `ItemList` (`numberOfItems` plus up to 25 `ListItem`s) for grouped views
- `ComicIssue` for individual comics: `name` includes the issue number, plus `issueNumber`, `datePublished`, `image`, `isPartOf` (`ComicSeries`), `artist` (`Person`), `variantCover` for variants, and a `description` with the grade and signature
- `ComicSeries` with `hasPart` issues for series pages
- `Person` for cover artist pages
- `BreadcrumbList` for navigational context

The collection is personal and nothing is for sale, so no `Offer` or `AggregateOffer` data is emitted.

`src/utils/structured-data.ts` builds the JSON-LD and `src/utils/page-meta.ts` chooses it per page; the layout renders it into the HTML, so crawlers never wait for JavaScript. `scripts/structured-data.test.ts` covers the shapes.

## Sitemap and crawler policy

`src/pages/sitemap.xml.ts` renders the sitemap at build time from the same route inventory as the pages (`src/utils/site-data.ts`). Entries carry no `<lastmod>`, because record timestamps describe data edits, not page changes. `scripts/sitemap.test.ts` builds the sitemap in memory and checks the count, uniqueness, clean URL format, XML escaping, and current collection coverage.

`public/robots.txt` allows public pages, points to the sitemap, and excludes API, JSON, source, and dependency paths from crawling.

## Sharing, app, and browser assets

The public asset set includes:

- SVG and PNG favicons
- A 180 by 180 Apple touch icon
- 192 by 192 and 512 by 512 install icons
- A 1200 by 630 social and PWA preview image
- A web app manifest with clean-path shortcuts

`scripts/public-surface.test.ts` rejects missing manifest and sharing assets.

## Analytics

Google Analytics is loaded in `src/layouts/BaseLayout.astro` and records a page view on every page load. On the collection page, in-place URL changes (search, filters, paging) are reported through `src/utils/analytics.ts`.

## Security and error behavior

`public/_headers` configures content, frame, referrer, permissions, and transport protections along with immutable caching for hashed assets. Inline scripts are allowed only by hash; the build writes the hashes into the policy.

`src/pages/404.astro` renders a real, noindex error document. It prevents unknown Cloudflare Pages paths and missing files from falling back to a misleading HTTP 200 application shell.

## Verification

Run the complete release gate:

```bash
npm run check
```

The gate validates data, typechecks, lints, tests, builds, and verifies the build. `scripts/verify-dist.mjs` reads `dist/sitemap.xml` and checks every listed page's canonical URL, robots, social metadata, rendered heading, JSON-LD validity and allowed properties, and assets, plus `/collection`, the custom 404, `/data/comics.json`, and that every inline script hash is in the CSP.

Run `npm run verify:http -- <origin> [sitemap]` against a Cloudflare Pages local preview to check every sitemap URL, canonical metadata, a real HTTP 404, and collection/API agreement. Pass `https://comics.banast.as/sitemap.xml` as the sitemap to prove the build serves every URL production already publishes. Run it again against production after an authorized deployment.

For a deployed release, also verify:

- The homepage and representative detail routes return successful HTML.
- `/sitemap.xml`, `/robots.txt`, `/manifest.json`, and `/og-image.jpg` resolve.
- An unknown path returns the custom 404 behavior.
- `/api/comics/stats` reflects the same deployed collection.
- Search Console and social-card debuggers can fetch the public site.

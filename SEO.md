# Search and sharing contract

This document describes the SEO surface that the repository build produces. The implementation is a Vite and React application with generated static entry pages, not a server-rendered framework.

## Public URL model

Canonical routes use clean paths:

- `/`
- `/stats`
- `/comic/:slug`
- `/series/:slug`
- `/artist/:slug`
- `/tag/:slug`
- `/storage/:slug` and `/boxes`
- `/raw`, `/slabbed`, and `/variants`

`/collection` still works and gets a static entry page, but it renders the same view as `/`, so it declares `https://comics.banast.as/` as its canonical URL and is not listed in the sitemap.

Old `/#/...` bookmarks remain compatible. A small script in `index.html` converts a legacy hash route to its clean path before the app reads the location.

Route creation and slug behavior live in `scripts/site-routes.mjs` and `src/utils/routing.ts`. Their tests protect uniqueness and compatibility.

## Static entry pages

`npm run build` performs four relevant steps:

1. Typecheck the app, Cloudflare Functions, and Node scripts.
2. Regenerate `public/sitemap.xml` from `src/data/comics.json`. The file is derived output and is not tracked in git.
3. Build the Vite application.
4. Generate a decoded `.html` asset per public route, with `dist/index.html` for the root.

Public URLs stay unchanged and extensionless. Filesystem paths use decoded names, such as `dist/series/Action Comics.html`. Flat HTML assets avoid directory redirects that can corrupt `?`, `#`, or Unicode names. `scripts/static-route-path.mjs` owns the safe URL-to-file mapping.

`scripts/generate-static-pages.mjs` replaces the generic shell with route-specific metadata and crawlable fallback content. React then hydrates the page in the browser.

Every generated entry page includes:

- A unique document title and description
- A canonical URL
- The base document's robots directive (`index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`)
- Matching Open Graph and Twitter URLs
- Open Graph and Twitter image metadata
- JSON-LD appropriate to the route
- Human-readable fallback content inside `#root`

## Social previews

The default collection preview is `public/og-image.jpg` at 1200 by 630 pixels. It is referenced as `https://comics.banast.as/og-image.jpg` by the base document and collection-level generated pages.

Comic and grouped collection pages prefer a relevant cover image when one is available. Placeholder covers (`noCover.jpg`, or a bare `https://covers.banast.as/` directory URL) fall back to the default preview image. The static-page verifier ensures that any same-origin preview asset exists in the built output.

## Structured data

The site emits these Schema.org types where appropriate:

- `Collection` (with `collectionSize`) for the collection root and statistics
- `CollectionPage` with an `ItemList` (`numberOfItems` plus up to 25 `ListItem`s) for grouped views
- `ComicIssue` for individual comics: `name` includes the issue number, plus `issueNumber`, `datePublished`, `image`, `isPartOf` (`ComicSeries`), `artist` (`Person`), `variantCover` for variants, and a `description` with the grade and signature
- `ComicSeries` with `hasPart` issues for series pages
- `Person` for cover artist pages
- `BreadcrumbList` for navigational context

The collection is personal and nothing is for sale, so no `Offer` or `AggregateOffer` data is emitted.

The client implementation lives in `src/components/SEO.tsx` and `src/utils/structured-data.ts`. Static equivalents come from `scripts/structured-data.mjs` through `scripts/generate-static-pages.mjs`, so crawlers do not need to wait for client-side metadata updates. `scripts/structured-data.test.ts` keeps both implementations equivalent.

## Sitemap and crawler policy

`scripts/generate-sitemap.js` writes `public/sitemap.xml` from the same collection data and route inventory used by the application. The file is untracked derived output; `npm run build` regenerates it and Vite copies it into `dist/`. Entries carry no `<lastmod>`, because the collection sync rewrites every record's timestamps and they do not describe page changes. `scripts/sitemap.test.ts` builds the sitemap in memory and checks the count, uniqueness, clean URL format, XML escaping, and current collection coverage.

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

Google Analytics is loaded in `index.html`. Automatic page views are disabled there so the app can report clean-route navigation through `src/utils/analytics.ts` without double-counting the initial view.

## Security and error behavior

`public/_headers` configures content, frame, referrer, permissions, and transport protections along with immutable caching for hashed assets.

`public/404.html` is a real, noindex error document. It prevents unknown Cloudflare Pages paths and missing files from falling back to a misleading HTTP 200 application shell.

## Verification

Run the complete release gate:

```bash
npm run check
```

The gate validates data, refreshes the sitemap, typechecks, lints, tests, builds, and verifies every generated page. `scripts/verify-static-pages.mjs` checks canonical URLs, robots metadata, social metadata, JSON-LD validity and allowed properties, built assets, sitemap coverage in `dist/sitemap.xml`, fallback content, security files, and the custom 404.

Run `npm run verify:http -- <origin>` against a Cloudflare Pages local preview to check all public routes, canonical metadata, a real HTTP 404, and collection/API agreement. Run it again against production after an authorized deployment.

For a deployed release, also verify:

- The homepage and representative detail routes return successful HTML.
- `/sitemap.xml`, `/robots.txt`, `/manifest.json`, and `/og-image.jpg` resolve.
- An unknown path returns the custom 404 behavior.
- `/api/comics/stats` reflects the same deployed collection.
- Search Console and social-card debuggers can fetch the public site.

## Current limitation

Generated routes ship complete metadata and crawlable fallback content, but the interactive UI still hydrates as a React SPA. A full framework migration could consolidate static generation and client routing later. The decision record and acceptance criteria are in [docs/ssr-migration-prd.md](docs/ssr-migration-prd.md).

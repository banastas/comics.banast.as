# comics.banast.as

[![Live Site](https://img.shields.io/badge/Live-comics.banast.as-00d9ff?style=for-the-badge)](https://comics.banast.as)
[![Built with React](https://img.shields.io/badge/Built%20with-React%2018-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%203.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev/)

<img src="https://github.com/banastas/comics.banast.as/blob/main/comic.banast.as.png?raw=true">

A personal comic book collection tracker with financial analytics, multi-view browsing, and comprehensive organization. Currently tracking **811 comics** across **178 series**. Built with React 18, TypeScript, and Tailwind CSS.

**Live Site**: [comics.banast.as](https://comics.banast.as)

## Latest Build Snapshot

The current production build is still a hydrated React/Vite app, but the routing and SEO surface have been upgraded so the site now ships real static entry pages for the collection.

- **Clean URLs are canonical**: `/comic/...`, `/series/...`, `/artist/...`, `/tag/...`, `/storage/...`, `/raw`, `/slabbed`, `/variants`, `/boxes`, `/collection`, and `/stats`
- **Legacy hash URLs still work**: old `/#/...` links are bridged to the clean path before React reads the route
- **Static prerender output**: `npm run build` generates sitemap-driven HTML entry pages in `dist/` with route-specific title, description, canonical, Open Graph, Twitter Card, and JSON-LD metadata
- **External automation preserved**: n8n/nightly sync, `src/data/comics.json`, and the Cloudflare Pages API remain the compatibility contract
- **Regression gate added**: `npm run check` now validates data, typechecks app/API/node scripts, lints, runs Vitest, builds, and verifies the generated static pages

## What It Does

- Track comics with full metadata: title, series, issue, grade, value, cover artist, storage location, tags, signatures, and more
- Monitor financial performance with purchase vs. current value, gain/loss calculations, and top gainers/losers
- Browse the collection multiple ways: grid view, list view, by series, by artist, by tag, by storage location, or by condition (raw/slabbed/variant)
- Search across titles, series, artists, notes, and signatures with sorting by any field
- View analytics on a dashboard with collection stats, value breakdowns, and highlighted comics

## Tech Stack

- **React 18** + **TypeScript 5.5** + **Vite 7**
- **Tailwind CSS 3.4** for styling
- **Zustand 5** for state management
- **Zod 4** for data validation
- **Lucide React** for icons
- **First-party SEO component** for dynamic meta tags

## Quick Start

```bash
git clone https://github.com/banastas/comics.banast.as.git
cd comics.banast.as
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Project Structure

```
src/
├── components/              # React components (35 runtime files)
│   ├── AppRouteRenderer.tsx # Route switchboard for hydrated views
│   ├── CollectionTab.tsx    # Main collection tab
│   ├── StatsTab.tsx         # Stats/analytics tab
│   ├── Dashboard.tsx        # Analytics dashboard with stats cards
│   ├── ComicCard.tsx        # Grid view card (keyboard accessible)
│   ├── ComicListView.tsx    # List view layout (keyboard accessible)
│   ├── ComicDetail.tsx      # Individual comic page
│   ├── ComicForm.tsx        # Add/edit comic form
│   ├── DetailPageLayout.tsx # Shared layout for all detail views
│   ├── DetailPageHeader.tsx # Header component for detail pages
│   ├── Breadcrumb.tsx       # Navigation breadcrumbs
│   ├── SeriesDetail.tsx     # Series drill-down view
│   ├── CoverArtistDetail.tsx
│   ├── TagDetail.tsx
│   ├── StorageLocationDetail.tsx
│   ├── StorageLocationsListing.tsx
│   ├── RawComicsDetail.tsx
│   ├── SlabbedComicsDetail.tsx
│   ├── VariantsDetail.tsx
│   ├── FilterControls.tsx
│   ├── SEO.tsx              # Dynamic meta tags + structured data
│   ├── ResponsiveImage.tsx
│   ├── ErrorBoundary.tsx
│   ├── LoadingSkeleton.tsx  # Loading states with ARIA
│   ├── Toast.tsx            # Toast notifications
│   └── ...                  # Dashboard sub-components, mobile controls
├── stores/
│   └── comicStore.ts        # Zustand state store
├── hooks/                   # useRouting, useScrollToTop, useResponsiveBreakpoint
├── types/
│   └── Comic.ts             # TypeScript interfaces
├── utils/                   # formatting, stats, sorting, analytics, routing
├── data/
│   └── comics.json          # Collection data (811 comics)
└── styles/
    └── responsive.css
functions/
└── api/                     # Cloudflare Pages API endpoints for external automation
scripts/
├── generate-sitemap.js      # Sitemap generation from synced collection data
├── generate-static-pages.mjs # Static clean-url HTML page generation
├── site-routes.mjs          # Shared route inventory for sitemap/static pages
├── verify-static-pages.mjs  # Static output and sitemap verification
└── validate-data.mjs        # Nightly/import data contract validation
```

## Features

### Dashboard
Total comics, collection value, average grade, raw vs. slabbed breakdown, variant count, signed comics count, biggest gainer/loser, most valuable slabbed and raw comics. All cards are clickable and navigate to their respective detail views.

### Collection Views
- **Grid view** with cover art, grade badges, and value info
- **List view** for compact browsing
- **Detail pages** for individual comics with related issues from the same series

### Organization
- **By series** (178 series) with per-series stats
- **By cover artist** with artist-specific collection views
- **By tag** for custom grouping
- **By storage location** (7 archive boxes + CGC + Loose)
- **By condition**: raw comics, slabbed/graded comics, variant covers

### Search & Filter
Full-text search across multiple fields. Sort by title, series, issue number, release date, grade, purchase date, purchase price, or current value. Ascending/descending toggle.
Drill-down pages such as virtual boxes, series, artists, tags, raw comics, slabbed comics, and variants also support release date sorting in both newest-first and oldest-first order.

### Data Management
- JSON-based storage (`src/data/comics.json`)
- n8n/nightly sync writes the collection JSON used by the app, API, sitemap, and build
- Built-in CSV to JSON converter for bulk imports/manual fallback
- Automatic timestamps on creation and updates
- Zod/runtime validation plus standalone data validation guard against malformed sync/import payloads

### SEO
- Dynamic meta tags with the first-party SEO component
- Schema.org structured data (ComicIssue, ComicSeries, Collection, Breadcrumb)
- Auto-generated clean-url sitemap (1,234 URLs in the current build)
- Static clean-url HTML entry pages generated at build time for comics, series, artists, tags, storage, and collection views
- Open Graph and Twitter Card support
- SEO-friendly slugs (e.g., `/comic/batman-issue-1-variant`)
- Legacy hash URLs (e.g., `/#/comic/batman-issue-1-variant`) are still supported and bridged to clean paths

### Performance
- Lazy-loaded detail views with code splitting
- Manual Vite chunks (react-vendor, icons, data, utils, components)
- Terser minification with console/debugger stripping
- Native lazy loading and async decoding for images
- Skeleton loading states
- Granular Zustand selectors to minimize re-renders
- Stable debounce refs to prevent unnecessary recreations

### Accessibility
- Keyboard-navigable comic cards (Enter/Space to activate)
- ARIA labels on all interactive elements and form controls
- `aria-current="page"` on breadcrumbs
- Loading skeletons with `role="status"` and `aria-busy`
- `focus-visible` ring indicators for keyboard users
- Error boundaries on all lazy-loaded routes

### Responsive Design
Mobile-first layout from 320px to 4K. 44px minimum touch targets. Fluid typography. Works on desktop, tablet, and phone.

## Scripts

```bash
npm run dev              # Start dev server
npm run check            # Full gate: validate data, typecheck app/API/node, lint, test, build, verify static pages
npm run validate:data    # Validate synced src/data/comics.json contract
npm run typecheck        # Typecheck app, Cloudflare Functions, and node scripts
npm run test:run         # Run Vitest regression tests
npm run build            # Validate types, generate sitemap, build, generate static pages
npm run verify:static-pages # Verify clean-url static pages and sitemap output
npm run preview          # Preview production build
npm run lint             # ESLint
npm run generate:sitemap # Regenerate sitemap only
npm run generate:static-pages # Generate clean-url pages from dist/index.html
```

## Adding Comics

### CSV Import
1. Click the file upload icon in the header
2. Upload a CSV with columns: title, seriesName, issueNumber, releaseDate, coverImageUrl, coverArtist, grade, purchasePrice, purchaseDate, currentValue, notes, signedBy, storageLocation, tags, isSlabbed, isVariant, isGraphicNovel
3. Download the converted JSON
4. Replace `src/data/comics.json` and restart the dev server

### Manual Edit
Add entries directly to `src/data/comics.json` following the Comic interface in `src/types/Comic.ts`.

### Nightly Sync / n8n
The production data source is still `src/data/comics.json`. Any n8n or scheduled sync should preserve that JSON array shape and then run:

```bash
npm run check
```

`npm run check` includes data validation, typechecking, linting, API tests, sitemap tests, static page generation, and static output verification. For a faster preflight during sync development, use `npm run validate:data`.

The compatibility tests intentionally cover the synced data shape, unique IDs, unique route slugs, API responses, CORS headers, and sitemap freshness. Keep the Cloudflare Pages API endpoints in `functions/api/` available during future rendering/routing migrations.

## API

Cloudflare Pages Functions expose read-only JSON endpoints for automation and external consumers:

- `GET /api/comics`
- `GET /api/comics?series=Alien`
- `GET /api/comics?artist=Jock`
- `GET /api/comics?q=signature`
- `GET /api/comics/stats`

Both endpoints allow CORS for read-only clients and respond to `OPTIONS` preflight requests. They import the same `src/data/comics.json` file as the app, so nightly sync updates the UI, static pages, sitemap, and API together.

## Deployment

```bash
npm run build
```

Deploy the `dist/` folder to Cloudflare Pages. Cloudflare Pages Functions in `functions/api/` should be deployed with it so the public API remains available for n8n and other read-only clients. No environment variables are required for the current build.

Cloudflare may redirect generated directory-style routes from `/stats` to `/stats/`; the generated canonical and sitemap URLs intentionally use the clean no-trailing-slash form.

## Limitations

- JSON file storage (no database)
- Single-user (no authentication)
- Cover images hosted externally (covers.banast.as)
- The interactive app still hydrates as a React SPA after the static entry page loads
- Static pages are generated at build time, so data changes require a rebuild/deploy
- This is not a full SSR/Astro migration yet; `docs/ssr-migration-prd.md` tracks that possible next step

## License

MIT

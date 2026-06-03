# comics.banast.as SSR Migration — Product Requirements Document

## Metadata

- **Version:** 1.0
- **Date:** 2026-04-17
- **Author:** Bill Anastas (@banastas)
- **Status:** In progress — guardrails and clean-url static entry pages implemented

## Executive Summary

Migrate comics.banast.as from a hash-routed React SPA to a server-rendered (or prerendered) architecture deployed on Cloudflare Pages. The first migration step now ships clean static entry pages from the existing Vite app; a future Astro + React islands migration can still consolidate stack and improve body rendering. The former `#/comic/...` hash URLs blocked organic discovery of the 805-comic collection and its 177 series, 216 cover artists, and 10 computed tag pages. After this migration, every detail page is a real indexable URL (`/comic/batman-1`), served as pre-rendered HTML with full meta tags, structured data, and social preview support — unlocking Google indexing, proper Twitter/Facebook link previews, and ~1,200 new entry points into the site.

This is SEO/infrastructure work, not a feature addition. The user-facing product stays identical: same dashboard, same filters, same detail layouts, same dark theme. The change is invisible to visitors but transforms the site from "unindexable SPA" to "normal web app."

## Problem Statement

### Current state

- Internal navigation now uses clean paths such as `/comic/predator-versus-planet-of-the-apes-issue-2-803`, `/series/Alien%20(Vol%201)`, and `/tag/Modern`
- Legacy hash URLs such as `/#/comic/...` are still accepted and rewritten to clean paths before React reads the route
- Sitemap lists 1,224 clean URLs and `npm run build` generates 1,224 static HTML entry pages in `dist/`
- Static entry pages include route-specific title, description, canonical, Open Graph/Twitter tags, JSON-LD, and no-JS fallback body content
- The hydrated UI is still the existing React SPA; Astro remains useful for future stack consolidation and cleaner server-rendered body markup

### Why now

- Collection has grown to 805 comics with rich per-item data (cover art, grades, values, signed-by, variant info) that deserves to rank
- Recent SEO improvements (dynamic meta tags, expanded sitemap, CLS fixes, clean static entry pages) have removed the biggest hash-routing ceiling while keeping the current UI stable
- Bill's other personal sites already use Astro patterns (blog, photo, yautja-wiki, dev) — moving comics to the same stack consolidates tooling and tracks his stated preference for Astro for static/content sites
- Cloudflare Pages is already the deployment target; no new infrastructure needed

### What search engines need (that we don't currently provide)

1. Real, crawlable URLs without fragments
2. Fully rendered HTML with meta tags, structured data, and content *in the initial response* (not after JS hydration)
3. Proper `Link: <url>; rel="canonical"` and sitemap references that match the served URLs
4. Stable HTTP status codes (200 for valid pages, 404 for unknown)

## Target Users

**Primary: Bill (collector / site owner)** — wants the collection to show up when people Google a comic he owns, wants shared links to preview correctly, wants to consolidate stack on Astro.

**Secondary: Comic collectors searching Google** — people looking up "Alien King Killer #3 variant" or "Predator Bloodshed first issue" should be able to find Bill's listing.

**Tertiary: People Bill shares links with** — friends, social followers, X posts linking to specific comics should show rich previews with cover art, grade, and value.

## Goals & Success Metrics

1. **Indexability**: Google Search Console shows all 1,200+ detail pages indexed within 60 days of launch (vs. ~1 today)
2. **Link previews**: Sharing any comic/series/tag URL to Slack, Twitter, iMessage shows the correct cover image, title, and description — not the generic default
3. **Performance parity**: LCP ≤ current SPA, CLS ≤ 0.05 on detail pages (already fixed via width/height), TTI comparable or better
4. **Zero visual/UX regression**: filter controls, dashboard, detail pages all behave identically
5. **Stack consolidation**: project uses same Astro + Tailwind + Cloudflare Pages patterns as blog/photo/dev

Non-goals:

- Adding new features (save for a v2 PRD)
- Changing the data model or storage approach (`comics.json` stays as the source of truth)
- Adding authentication or multi-user support
- Server-rendering anything that requires dynamic data (everything is prerenderable)
- Breaking n8n/nightly data sync, `src/data/comics.json`, or the existing Cloudflare Pages API

## Core Features (v1.0)

### F1. Clean URL routing

**What**: Replace every `/#/route` with `/route`. Specifically:

| Current | New |
|---|---|
| `/#/comic/batman-1` | `/comic/batman-1` |
| `/#/series/Alien` | `/series/alien` |
| `/#/tag/Modern` | `/tag/modern` |
| `/#/artist/Jock` | `/artist/jock` |
| `/#/storage/Box%201` | `/storage/box-1` |
| `/#/raw`, `/#/slabbed`, `/#/variants`, `/#/boxes` | unchanged (no hash) |
| `/#/stats` | `/stats` |

**Acceptance criteria**:
- Internal navigation uses clean paths through the existing router
- Server returns 200 for every URL in sitemap.xml
- Legacy hash URLs bridge to clean paths
- Remaining future work: explicit 404 handling for unknown clean routes and slug normalization for non-comic grouping routes

### F2. Prerender at build time

Every page in the sitemap is rendered to static HTML at build time. No server runtime needed. Build produces ~1,200 HTML files; Cloudflare Pages serves them directly.

**Acceptance criteria**:
- `npm run build` generates one `index.html` file per sitemap URL
- Each HTML file contains:
  - Correct `<title>`, `<meta name="description">`, canonical link
  - Full Open Graph and Twitter Card meta tags
  - JSON-LD structured data (ComicIssue / ComicSeries / Person / Collection / BreadcrumbList as applicable)
  - Fully-rendered page content (no blank shell waiting for JS)
- Build time under 60 seconds on a typical dev machine
- Can still deploy via `wrangler pages deploy dist/`

### F3. Backwards compatibility for old hash URLs

Anyone who bookmarked or shared a `#/...` URL must still land on the right page.

**Acceptance criteria**:
- A small client-side script on every page detects `window.location.hash` matching the old pattern and rewrites history to the clean path — converting `/#/comic/batman-1` → `/comic/batman-1` before React reads the route
- Handles all old route types: `comic`, `series`, `storage`, `artist`, `tag`, `raw`, `slabbed`, `variants`, `boxes`, `stats`

### F4. Interactive features preserved

The collection view needs client-side interactivity for:
- Search (debounced filter of 792 comics)
- Sort (by title/series/issue/release/grade/price/date)
- View mode toggle (grid/list)
- Pagination
- Mobile filter sheet
- Computed-tag quick filters
- `itemsPerPage` localStorage persistence

**Acceptance criteria**:
- Collection and Stats pages hydrate the existing React components as Astro islands using `client:load`
- Detail pages (single comic, series, tag, etc.) are static HTML with minimal islands (just navigation + any interactive widget, e.g. related-issues carousel)
- Zustand store continues managing client-side state on pages that need it
- First-load time on the home page is equal to or better than current (reality check: removing the SPA shell + async data chunk should net a small win)

### F5. Sitemap + robots updates

**Acceptance criteria**:
- `scripts/generate-sitemap.js` emits clean URLs (no `#/`)
- `robots.txt` references the new sitemap
- A client script handles legacy URLs (F3)
- Submit new sitemap to Google Search Console on launch

### F6. Sync and API compatibility

The import/sync pipeline is a permanent compatibility surface. n8n/nightly sync must continue writing `src/data/comics.json`, and that file must remain the single source consumed by the app, static page generation, sitemap generation, and Cloudflare Pages API endpoints.

**Acceptance criteria**:
- `npm run validate:data` passes after every sync and before every deploy
- `GET /api/comics`, query filters (`series`, `artist`, `q`), CORS headers, and `GET /api/comics/stats` keep working after the rendering migration
- API Functions continue importing from the same synced collection source or from a generated equivalent with the same response shape
- Static/prerender work does not move data behind a browser-only import that would break Pages Functions
- `npm run check` covers data validation, API response tests, sitemap freshness, typecheck, lint, and build

## User Interface & Design

**Zero UI changes.** Same Tailwind classes, same component tree, same dark theme (#0d1117 background, blue-500 accent), same responsive breakpoints. Typography stays Inter. All existing components (`Dashboard`, `ComicCard`, `ComicListView`, `DetailPageLayout`, filter controls, mobile bottom sheet) port over as Astro-rendered islands with identical markup.

## Technical Architecture

### Stack

- **Framework**: Astro 5.x with `@astrojs/react` integration
- **Runtime on interactive pages**: React 18 islands via `client:load` or `client:visible`
- **State**: Zustand 5.x (preserved, imported into islands that need it)
- **Styling**: Tailwind CSS 3.x via `@tailwindcss/vite` (matches other Astro projects)
- **Data**: `src/data/comics.json` imported at build time (no runtime fetch needed)
- **Validation**: Zod schemas (preserved from current project)
- **Deployment**: Cloudflare Pages via `wrangler pages deploy dist/`
- **Output mode**: `output: 'static'` in `astro.config.mjs`
- **Sitemap**: `@astrojs/sitemap` (replaces custom script) OR keep the existing script — decision in Open Questions

### Directory structure (proposed)

```
comics.banast.as/
├── astro.config.mjs
├── src/
│   ├── pages/                     # Astro file-based routing
│   │   ├── index.astro            # / — collection dashboard (island)
│   │   ├── stats.astro            # /stats
│   │   ├── raw.astro              # /raw
│   │   ├── slabbed.astro
│   │   ├── variants.astro
│   │   ├── boxes.astro
│   │   ├── comic/[slug].astro     # /comic/batman-1  (prerendered)
│   │   ├── series/[name].astro    # /series/alien
│   │   ├── tag/[name].astro       # /tag/modern
│   │   ├── artist/[name].astro
│   │   └── storage/[name].astro
│   ├── layouts/
│   │   └── Base.astro             # shared <head>, header, theme
│   ├── components/                # EXISTING React components, ported
│   │   ├── islands/               # Components used as Astro islands
│   │   │   ├── CollectionView.tsx # The filter/sort/paginate surface
│   │   │   ├── StatsView.tsx
│   │   │   └── RelatedIssues.tsx  # Used on comic detail
│   │   └── static/                # Rendered server-side only
│   │       ├── ComicCard.astro
│   │       ├── DashboardStats.astro
│   │       └── Breadcrumb.astro
│   ├── stores/
│   │   └── comicStore.ts          # preserved
│   ├── utils/
│   │   ├── slug.ts                # normalize → kebab-case helpers
│   │   ├── stats.ts
│   │   └── formatting.ts
│   ├── data/
│   │   └── comics.json
│   └── styles/
│       └── global.css
├── public/                        # robots.txt, manifest.json, icons
├── scripts/                       # may be obsoleted by Astro sitemap integration
└── wrangler.toml                  # Cloudflare Pages config
```

### Routing approach

Astro static routes use `getStaticPaths()` to enumerate every detail URL at build time:

```typescript
// src/pages/comic/[slug].astro
---
import comics from '../../data/comics.json';
import { createComicSlug } from '../../utils/slug';
import Base from '../../layouts/Base.astro';
import type { Comic } from '../../types/Comic';

export async function getStaticPaths() {
  return (comics as Comic[]).map((comic) => ({
    params: { slug: createComicSlug(comic) },
    props: { comic },
  }));
}

const { comic } = Astro.props;
const canonicalUrl = new URL(`/comic/${createComicSlug(comic)}`, Astro.site).toString();
---
<Base
  title={`${comic.seriesName} #${comic.issueNumber}`}
  description={`Grade ${comic.grade} ${comic.seriesName} #${comic.issueNumber}${comic.isVariant ? ' variant' : ''}`}
  canonical={canonicalUrl}
  ogImage={comic.coverImageUrl}
  structuredData={generateComicStructuredData(comic)}
>
  <ComicDetailContent comic={comic} allComics={comics} />
</Base>
```

### Data loading

Current: `comics.json` is 490KB, imported at module load, then lazy-chunked.

New: At build time, every page gets exactly the data it needs inlined into its HTML. The client-side bundle still includes `comics.json` for the interactive CollectionView island (filter/sort need all 792 comics), but:
- Detail pages don't ship `comics.json` at all — only the one comic's data is inlined
- Home/stats pages still need the full dataset for the Zustand store — ships as an async chunk
- Total initial bundle on a detail page: ~30KB gzip (Astro runtime + React island for related-issues) vs. current ~40KB + 29KB data
- Total initial bundle on home: roughly same as today

### Structured data

Keep existing helpers from `src/utils/structured-data.ts` (`generateComicStructuredData`, `generateSeriesStructuredData`, etc.) and inline the JSON-LD into the Astro `<head>` at build time. This replaces the current runtime-injected `<script type="application/ld+json">`, making the structured data visible to crawlers on first request.

### Analytics

GA4 script (`G-ZDMFMRZTBZ`) remains in the document head. `page_path` now uses `window.location.pathname + window.location.search + window.location.hash` so clean paths are reported correctly while legacy hash hits remain distinguishable during the bridge period.

## Data Model

Unchanged. `Comic` type stays identical:

```typescript
interface Comic {
  id: string;
  title: string;
  seriesName: string;
  issueNumber: number;
  releaseDate: string;
  coverImageUrl: string;
  coverArtist: string;
  grade: number;
  purchasePrice?: number;
  purchaseDate: string;
  currentValue?: number;
  notes: string;
  signedBy: string;
  storageLocation: string;
  tags: string[];
  isSlabbed: boolean;
  isVariant: boolean;
  isGraphicNovel: boolean;
  createdAt: string;
  updatedAt: string;
}
```

Slug format (keep current): `{series-slug}-issue-{number}[-variant][-{id-suffix}]`.

## Implementation Plan

### Phase 1: Foundation (MVP — Week 1)

0. Preserve current behavior with guardrails: `validate:data`, API tests, data contract tests, routing slug tests, sitemap tests, function typecheck, and `npm run check`
1. Scaffold Astro project alongside existing code (`astro-poc/` subdirectory or new branch `feat/ssr-migration`)
2. Set up Tailwind, `@astrojs/react`, `@astrojs/sitemap`
3. Port `types/Comic.ts`, `utils/formatting.ts`, `utils/stats.ts`, `utils/slug.ts`
4. Create `Base.astro` layout with head tags, analytics, theme setup
5. Build `/index.astro` (collection homepage) as first vertical slice
6. Port `CollectionView` as a `client:load` React island
7. Verify Zustand store works inside an island with data imported server-side

**Exit criteria**: Homepage renders identically, all filters/sorts/pagination work, no regressions vs. current SPA on home.

### Phase 2: Detail pages (Week 2)

8. Build `/comic/[slug].astro` with `getStaticPaths()` enumerating all 792 comics
9. Port `ComicDetail` component markup as server-rendered Astro (no hydration)
10. Port `RelatedIssues` as a small `client:visible` island (interactive navigation between issues)
11. Build `/series/[name].astro`, `/tag/[name].astro`, `/artist/[name].astro`, `/storage/[name].astro`
12. Build `/raw.astro`, `/slabbed.astro`, `/variants.astro`, `/boxes.astro`, `/stats.astro`
13. Per-page structured data: ComicIssue / ComicSeries / Person / CollectionPage / BreadcrumbList

**Exit criteria**: Every sitemap URL returns a 200 with complete HTML, correct meta tags, and correct structured data. Manual QA pass: navigate to each route type, verify visual parity.

### Phase 3: Polish + backwards compat (Week 3)

14. Add hash-URL redirect script to `Base.astro` (F3)
15. Update `generate-sitemap.js` to emit clean URLs, OR replace with `@astrojs/sitemap` auto-generation
16. Configure `_redirects` on Cloudflare Pages for any edge cases (legacy old-old-ID format, etc.)
17. Create missing social preview assets: `og-image.jpg` (1200×630), `twitter-image.jpg` (1200×630), favicons — currently TODO per `public/ICONS-TODO.md`
18. Update `CLAUDE.md` to reflect new stack and patterns
19. Performance testing: compare LCP/CLS/TTI against current site using Lighthouse
20. Cross-browser smoke test: Chrome, Safari, Firefox, mobile Safari

**Exit criteria**: Lighthouse performance score ≥ current site, no regressions, old URLs redirect correctly.

### Phase 4: Launch (Week 3-4)

21. Deploy to a preview URL for final review
22. Switch DNS / Cloudflare Pages to new deployment
23. Submit new sitemap to Google Search Console
24. Monitor 404 rates in Cloudflare Analytics for the first week
25. Monitor indexing progress in GSC over 60 days

**Exit criteria**: Live on `comics.banast.as`, sitemap submitted, no spike in 404s.

### Phase 5 (future, not v1): Expansion

- CMS-lite: a minimal admin route to add/edit comics (currently manual JSON editing)
- Image optimization via Cloudflare Image Resizing or `astro:assets`
- ISR-style rebuilds on data changes (GitHub Action → Pages deploy)
- Full SSR with D1 database (if dataset grows beyond what's practical to bundle)

## Security & Privacy

- No user authentication, no user data — purely static content
- No PII in `comics.json` (purchase prices are Bill's own; not sensitive)
- Analytics via GA4 (existing, unchanged)
- `robots.txt` continues to allow indexing
- No API keys or secrets in frontend code
- Cloudflare Pages handles TLS, DDoS protection, edge caching

## Future Considerations

- **Image optimization via Cloudflare**: serve AVIF/WebP variants of cover art
- **OG image generation**: per-comic OG images with cover + title + grade, generated at build time via Satori or similar
- **Incremental builds**: only rebuild changed pages on data updates
- **Search via client-side index**: lunr.js / MiniSearch for instant search (only matters if collection exceeds ~3,000 items)
- **Admin UI**: a password-gated `/admin` page for adding comics without editing JSON
- **RSS feed**: `/rss.xml` for recently added comics — low priority

## Open Questions

1. **Sitemap generation**: keep the custom `scripts/generate-sitemap.js` (since it's already aware of computed tags) or switch to `@astrojs/sitemap` and extend it with computed-tag routes via config?
   - *Recommendation*: keep the custom script — it already handles computed tags correctly.

2. **URL casing**: lowercase all slugs (e.g. `/series/alien` not `/series/Alien`) for SEO canonicalization and to avoid case-sensitivity bugs?
   - *Recommendation*: yes, always lowercase. Add a slug-normalize helper and update the redirect script to handle mixed-case legacy URLs.

3. **Stats page**: fully static (snapshot of current values at build time) or hydrated island with live recalculation?
   - *Recommendation*: fully static. Data changes only at build time anyway; recalculating on every client load is wasted work. Re-deploys happen on each data update.

4. **Collection page filter state**: should filter state sync to URL query params (`?sort=grade&view=list`) so they're shareable and bookmarkable?
   - *Recommendation*: yes — current SPA already does this via the `useRouting` hook. Port that behavior.

5. **Migration timeline overlap**: run old SPA and new Astro in parallel on different subdomains for a week (e.g. `v2.comics.banast.as`) before cutover, or cutover in one move?
   - *Recommendation*: one move after thorough staging on a `*.pages.dev` preview URL. Site has no users other than Bill, so minimal risk.

6. **Repository**: same repo (branch + merge) or new repo?
   - *Recommendation*: same repo, new branch `feat/ssr-migration`. Keeps history and commit conventions intact.

---

**Estimated effort**: 40–60 hours over ~3 weeks of part-time work.

**Blocker check before starting**: none. All dependencies exist, stack is familiar, deployment target is unchanged.

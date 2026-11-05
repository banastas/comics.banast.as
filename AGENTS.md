# Repository instructions

Complete scoped work fully. Search before building, preserve collection data, add tests for behavior changes, and run the complete release gate before handing work back.

## Project

comics.banast.as is a public comic collection browser built with Astro and deployed to Cloudflare Pages.

- Astro renders every page to static HTML at build time.
- React components hydrate only where pages are interactive (`client:*` islands).
- Tailwind CSS 4 provides styling.
- Zod validates collection records.
- Vitest covers data contracts, islands, routing, structured data, the API, and the public surface.
- Cloudflare Pages Functions in `functions/api/` expose read-only collection endpoints.

## Source of truth

`src/data/comics.json` is canonical for the UI, API, sitemap, and generated pages. Preserve record IDs, public slugs, and the collection schema. Never replace or reorder collection data as part of unrelated refactoring.

`scripts/sync/` writes `src/data/comics.json` from the collection's Google Sheet (see README, "Collection sync"); data commits come from that workflow, so fix data in the sheet rather than by hand.

`example-comic-collection.json` is a small self-hosting example. It is not production data.

## Architecture

- `src/pages/` holds one route per page type; `src/layouts/BaseLayout.astro` renders the document head from `src/utils/page-meta.ts`.
- `src/utils/site-data.ts` is the build-time route inventory (series, artists, boxes, tags) and builds the sitemap.
- `src/islands/CollectionApp.tsx` owns the collection page's interactive state, kept in the URL.
- `src/components/DetailPageLayout.tsx` is the shared detail-list island; it loads `/data/comics.json` only when a reader sorts or pages.
- `src/utils/comic-slug.ts` builds permalinks; a stored `slug` always wins.
- `integrations/static-output.mjs` decodes "?" and "#" in output file names and writes inline script hashes into the CSP.
- `scripts/validate-data.mjs` fails on contract errors and prints non-failing data quality warnings from `scripts/data-warnings.mjs`.
- `scripts/verify-dist.mjs` verifies the built public surface.

Keep page routes, the sitemap, metadata and API behavior synchronized when a public URL changes; `npm run verify:http` with the production sitemap proves no published URL breaks.

## Validation

Run the full gate for completed work:

```bash
npm run check
```

The gate validates data, typechecks (`astro check`, Functions, sync script), lints, runs Vitest, builds, and verifies the built site.

Use focused commands during development, but do not substitute them for the full gate before completion.

## Public repository rules

- Do not commit secrets, credentials, private collection data, or unlicensed local cover files.
- Keep README claims aligned with actual scripts and production behavior.
- Put repository documentation in the root or `docs/`, not in `public/`.
- Ensure every manifest, favicon, social image, or metadata reference points to an existing public asset.
- Preserve keyboard behavior, visible focus, reduced-motion support, labels, and semantic controls.
- Avoid generated churn. `dist/` and `.astro/` are derived and ignored; only source files belong in commits.

## Deployment

A request to inspect or improve the repository does not authorize a production deploy. When deployment is explicitly requested, run `npm run check`, deploy the Astro output together with `functions/`, and verify the live HTML, assets, API, sitemap, headers, routes, and responsive behavior.

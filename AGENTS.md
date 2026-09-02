# Repository instructions

Complete scoped work fully. Search before building, preserve collection data, add tests for behavior changes, and run the complete release gate before handing work back.

## Project

comics.banast.as is a public React and TypeScript collection browser deployed to Cloudflare Pages.

- Vite builds the hydrated application.
- Tailwind CSS provides styling.
- Zustand owns application state.
- Zod validates collection records.
- Vitest covers application, API, accessibility, and public-surface contracts.
- Cloudflare Pages Functions in `functions/api/` expose read-only collection endpoints.
- Build scripts generate clean static entry pages and the sitemap.

## Source of truth

`src/data/comics.json` is canonical for the UI, API, sitemap, and generated pages. Preserve record IDs, public slugs, and the collection schema. Never replace or reorder collection data as part of unrelated refactoring.

`example-comic-collection.json` is a small self-hosting example. It is not production data.

## Architecture

- `src/App.tsx` and `src/components/AppRouteRenderer.tsx` coordinate the application shell and route views.
- `src/stores/comicStore.ts` is the central data and UI store.
- `src/utils/routing.ts` owns client route parsing and URL helpers.
- `scripts/site-routes.mjs` owns the build-time route inventory.
- `scripts/generate-sitemap.js` writes `public/sitemap.xml`.
- `scripts/generate-static-pages.mjs` writes route-specific HTML into `dist/`.
- `scripts/verify-static-pages.mjs` verifies the built public surface.

Keep client routing, generated routes, sitemap entries, metadata, and API behavior synchronized when a public URL changes.

## Validation

Run the full gate for completed work:

```bash
npm run check
```

The gate validates data, regenerates the sitemap, typechecks all TypeScript targets, lints, runs Vitest, builds, and verifies the generated static pages.

Use focused commands during development, but do not substitute them for the full gate before completion.

## Public repository rules

- Do not commit secrets, credentials, private collection data, or unlicensed local cover files.
- Keep README claims aligned with actual scripts and production behavior.
- Put repository documentation in the root or `docs/`, not in `public/`.
- Ensure every manifest, favicon, social image, or metadata reference points to an existing public asset.
- Preserve keyboard behavior, visible focus, reduced-motion support, labels, and semantic controls.
- Avoid generated `dist/` churn. Only source and intentionally tracked derived files such as `public/sitemap.xml` belong in commits.

## Deployment

A request to inspect or improve the repository does not authorize a production deploy. When deployment is explicitly requested, run `npm run check`, deploy the Vite output together with `functions/`, and verify the live HTML, assets, API, sitemap, headers, routes, and responsive behavior.

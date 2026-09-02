# Contributing

Thanks for taking an interest in comics.banast.as.

## Development

1. Install Node.js 20.19 or newer.
2. Run `npm ci`.
3. Start the local app with `npm run dev`.
4. Before opening a pull request, run `npm run check`.

The full check validates the collection data, regenerates the sitemap, typechecks every TypeScript target, lints the repository, runs the test suite, builds the app, and verifies every generated static route.

## Pull requests

- Keep changes focused and explain the user-facing effect.
- Add or update tests when behavior changes.
- Update documentation when public routes, APIs, scripts, or deployment requirements change.
- Do not add private collection data, credentials, personal contact information, or unlicensed cover assets.
- Preserve compatibility with the JSON contract in `src/data/comics.json` and the read-only API in `functions/api/` unless the change explicitly migrates both.

For security reports, follow [.github/SECURITY.md](.github/SECURITY.md).

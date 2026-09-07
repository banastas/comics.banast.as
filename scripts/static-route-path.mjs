import path from 'node:path';

// HTTP servers decode URL paths before resolving static assets. Keep URL
// escaping in links and metadata, but use decoded names on the filesystem.
export const staticRoutePath = (distDir, route) => {
  const decoded = decodeURIComponent(route);
  const root = path.resolve(distDir);
  // Flat HTML files are served at extensionless URLs without directory
  // redirects that can corrupt reserved or Unicode characters.
  const result = decoded === '/' ? path.join(root, 'index.html') : path.resolve(root, `.${decoded}.html`);
  if (!result.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Static route escapes the build directory: ${route}`);
  }
  return result;
};

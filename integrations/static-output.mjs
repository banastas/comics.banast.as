import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Post-build fixes for Cloudflare Pages:
// 1. Astro writes "?" and "#" in route params percent-encoded into file names
//    (series/Aliens: What If...%3F.html). Cloudflare decodes request paths before
//    looking up files, so those pages must use the decoded name.
// 2. The Content-Security-Policy in _headers allows inline scripts by hash.
//    The hashes of every inline script in the built pages replace the
//    '__INLINE_SCRIPT_HASHES__' placeholder, so a changed snippet can never
//    ship with a stale hash.

const PLACEHOLDER = "'__INLINE_SCRIPT_HASHES__'";
const INLINE_SCRIPT = /<script(?![^>]*\ssrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g;

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});

/** Decodes percent-escapes in file names, except "/" and "%" themselves. */
export const decodeFileName = (name) => name.replace(/%(?!2F|25)[0-9A-F]{2}/gi, (escape) => decodeURIComponent(escape));

export const inlineScriptHashes = (htmlFiles) => {
  const hashes = new Set();
  htmlFiles.forEach((file) => {
    for (const [, body] of fs.readFileSync(file, 'utf8').matchAll(INLINE_SCRIPT)) {
      if (body.trim()) hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
    }
  });
  return [...hashes].sort();
};

export const staticOutput = () => ({
  name: 'comics-static-output',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      const outDir = fileURLToPath(dir);
      let renamed = 0;
      walk(outDir).forEach((file) => {
        const decoded = decodeFileName(path.basename(file));
        if (decoded === path.basename(file)) return;
        fs.renameSync(file, path.join(path.dirname(file), decoded));
        renamed += 1;
      });

      const htmlFiles = walk(outDir).filter((file) => file.endsWith('.html'));
      const hashes = inlineScriptHashes(htmlFiles);
      const headersPath = path.join(outDir, '_headers');
      const headers = fs.readFileSync(headersPath, 'utf8');
      if (!headers.includes(PLACEHOLDER)) throw new Error(`_headers is missing the ${PLACEHOLDER} placeholder`);
      fs.writeFileSync(headersPath, headers.replaceAll(PLACEHOLDER, hashes.join(' ')));
      logger.info(`decoded ${renamed} file name(s); ${hashes.length} inline script hash(es) in the CSP`);
    },
  },
});

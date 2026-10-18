import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const headers = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');
const csp = headers.match(/Content-Security-Policy: (.+)/)?.[1] ?? '';
const sha256 = (source: string) => `'sha256-${createHash('sha256').update(source).digest('base64')}'`;

describe('content security policy', () => {
  it('allows every inline script and handler in index.html by hash, without unsafe-inline scripts', () => {
    const scriptSrc = csp.match(/script-src ([^;]+)/)?.[1] ?? '';
    const inlineScripts = [...indexHtml.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    const handlers = [...indexHtml.matchAll(/\son[a-z]+="([^"]*)"/g)].map((m) => m[1]);

    expect(inlineScripts.length).toBeGreaterThan(0);
    for (const source of [...inlineScripts, ...handlers]) {
      expect(scriptSrc, `missing hash for: ${source.trim().slice(0, 60)}`).toContain(sha256(source));
    }
    if (handlers.length > 0) expect(scriptSrc).toContain("'unsafe-hashes'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
  });

  it('allows the analytics Cloudflare and Google inject on production', () => {
    expect(csp).toMatch(/script-src [^;]*https:\/\/static\.cloudflareinsights\.com/);
    expect(csp).toMatch(/connect-src [^;]*https:\/\/cloudflareinsights\.com/);
    expect(csp).toMatch(/script-src [^;]*https:\/\/\*\.googletagmanager\.com/);
  });

  it('permits cover images and blocks plugins and framing', () => {
    expect(csp).toMatch(/img-src [^;]*https:\/\/covers\.banast\.as/);
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
  });
});

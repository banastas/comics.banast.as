import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { decodeFileName, inlineScriptHashes } from '../integrations/static-output.mjs';

const headers = fs.readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');
const csp = headers.match(/Content-Security-Policy: (.+)/)?.[1] ?? '';

describe('content security policy', () => {
  it('allows inline scripts only by hashes the build fills in, never unsafe-inline', () => {
    const scriptSrc = csp.match(/script-src ([^;]+)/)?.[1] ?? '';
    expect(scriptSrc).toContain("'__INLINE_SCRIPT_HASHES__'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
    expect(scriptSrc).not.toContain("'unsafe-hashes'");
  });

  it('allows the analytics Cloudflare and Google inject on production', () => {
    expect(csp).toMatch(/script-src [^;]*https:\/\/static\.cloudflareinsights\.com/);
    expect(csp).toMatch(/connect-src [^;]*https:\/\/cloudflareinsights\.com/);
    expect(csp).toMatch(/script-src [^;]*https:\/\/\*\.googletagmanager\.com/);
  });

  it('permits cover images, self-hosted fonts only, and blocks plugins and framing', () => {
    expect(csp).toMatch(/img-src [^;]*https:\/\/covers\.banast\.as/);
    expect(csp).toContain("font-src 'self';");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it('hashes inline scripts but not JSON-LD or external scripts', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'csp-'));
    const file = path.join(dir, 'page.html');
    fs.writeFileSync(file, '<script>a()</script><script src="/x.js"></script><script type="application/ld+json">{}</script><script type="module">b()</script>');
    expect(inlineScriptHashes([file])).toEqual([
      "'sha256-qVpDBgj7bpq5hMAcGp3AOc79J3Y1Z4HvySTwKrWDoy4='",
      "'sha256-cf242PFc/kb7xD0Qzhsmd9vvRkc+cWFmbi+k+YvtdKc='",
    ].sort());
    fs.rmSync(dir, { recursive: true });
  });
});

describe('built file names', () => {
  it('decodes "?" and "#" but keeps "/" and "%" escaped', () => {
    expect(decodeFileName('Aliens: What If...%3F.html')).toBe('Aliens: What If...?.html');
    expect(decodeFileName('Special: %23Ashcan.html')).toBe('Special: #Ashcan.html');
    expect(decodeFileName('a%2Fb%25c.html')).toBe('a%2Fb%25c.html');
  });
});

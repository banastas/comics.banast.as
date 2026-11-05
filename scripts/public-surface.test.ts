import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import manifest from '../public/manifest.json';
import { DEFAULT_IMAGE } from '../src/utils/page-meta';
import { sitemapEntries } from '../src/utils/site-data';

const publicFileExists = (src: string) => {
  if (!src.startsWith('/')) return true;
  return fs.existsSync(`public${src}`);
};

describe('public deployment surface', () => {
  it('does not point install surfaces at missing public assets', () => {
    const referenced = [
      ...(manifest.icons || []).map((icon) => icon.src),
      ...(manifest.screenshots || []).map((screenshot) => screenshot.src),
      ...((manifest.shortcuts || []) as { icons?: { src: string }[] }[]).flatMap((shortcut) => (shortcut.icons || []).map((icon) => icon.src)),
    ];

    expect(referenced.filter((src) => !publicFileExists(src))).toEqual([]);
    expect(manifest.icons.map((icon) => icon.sizes)).toEqual(['192x192', '512x512']);
  });

  it('uses clean canonical routes for installed-app shortcuts', () => {
    expect(manifest.shortcuts.map((shortcut) => shortcut.url)).toEqual(['/collection', '/stats']);
  });

  it('ships a real 404 page and no test source files', () => {
    expect(fs.existsSync('src/pages/404.astro')).toBe(true);
    expect(fs.readdirSync('public').filter((file) => /\.test\.[cm]?[jt]sx?$/.test(file))).toEqual([]);
  });

  it('does not advertise missing same-origin social images', () => {
    const html = fs.readFileSync('src/layouts/BaseLayout.astro', 'utf8');
    expect(html).toContain('<meta property="og:image" content={image} />');
    expect(html).toContain('<meta name="twitter:image" content={image} />');
    expect(DEFAULT_IMAGE).toBe('https://comics.banast.as/og-image.jpg');
    expect(publicFileExists(new URL(DEFAULT_IMAGE).pathname)).toBe(true);
  });

  it('ships every browser icon referenced by the base document', () => {
    const html = fs.readFileSync('src/layouts/BaseLayout.astro', 'utf8');
    const icons = [...html.matchAll(/<link rel="(?:icon|apple-touch-icon)"[^>]*href="([^"]+)"/g)]
      .map((match) => match[1]);

    expect(icons).toHaveLength(4);
    expect(icons.filter((src) => !publicFileExists(src))).toEqual([]);
  });

  it('redirects renamed URLs to pages that exist, without shadowing a live page', () => {
    const rules = fs.readFileSync('public/_redirects', 'utf8').split('\n')
      .map((line) => line.trim()).filter((line) => line && !line.startsWith('#'))
      .map((line) => line.split(/\s+/));
    const paths = new Set(sitemapEntries().map((entry) => entry.path));

    expect(rules.length).toBeGreaterThan(0);
    rules.forEach(([from, to, status]) => {
      expect(status).toBe('301');
      expect(paths.has(to), `${to} is a page`).toBe(true);
      expect(paths.has(from), `${from} is not a page`).toBe(false);
    });
  });
});


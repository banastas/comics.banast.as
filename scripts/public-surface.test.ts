import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import manifest from '../public/manifest.json';

const publicFileExists = (src: string) => {
  if (!src.startsWith('/')) return true;
  return fs.existsSync(`public${src}`);
};

describe('public deployment surface', () => {
  it('does not point install surfaces at missing public assets', () => {
    const referenced = [
      ...(manifest.icons || []).map((icon) => icon.src),
      ...(manifest.screenshots || []).map((screenshot) => screenshot.src),
      ...(manifest.shortcuts || []).flatMap((shortcut) => (shortcut.icons || []).map((icon) => icon.src)),
    ];

    expect(referenced.filter((src) => !publicFileExists(src))).toEqual([]);
  });

  it('uses clean canonical routes for installed-app shortcuts', () => {
    expect(manifest.shortcuts.map((shortcut) => shortcut.url)).toEqual(['/collection', '/stats']);
  });

  it('ships a real 404 page and no test source files', () => {
    expect(fs.existsSync('public/404.html')).toBe(true);
    expect(fs.readdirSync('public').filter((file) => /\.test\.[cm]?[jt]sx?$/.test(file))).toEqual([]);
  });

  it('does not advertise missing same-origin social images', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    const images = [...html.matchAll(/<(?:meta property="og:image"|meta name="twitter:image") content="([^"]+)"/g)]
      .map((match) => match[1]);

    expect(images).toHaveLength(2);
    expect(images.every((image) => !image.startsWith('https://comics.banast.as/') || publicFileExists(new URL(image).pathname))).toBe(true);
  });
});

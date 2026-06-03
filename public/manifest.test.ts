import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import manifest from './manifest.json';

const publicFileExists = (src: string) => {
  if (!src.startsWith('/')) return true;
  return fs.existsSync(`public${src}`);
};

describe('web app manifest', () => {
  it('does not point install surfaces at missing public assets', () => {
    const referenced = [
      ...(manifest.icons || []).map((icon) => icon.src),
      ...(manifest.screenshots || []).map((screenshot) => screenshot.src),
      ...(manifest.shortcuts || []).flatMap((shortcut) => (shortcut.icons || []).map((icon) => icon.src)),
    ];

    expect(referenced.filter((src) => !publicFileExists(src))).toEqual([]);
  });
});

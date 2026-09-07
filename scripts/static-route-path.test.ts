import path from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error Build utilities are native ESM shared with Node scripts.
import { staticRoutePath } from './static-route-path.mjs';

describe('HTTP static route resolution', () => {
  it.each([
    ['/', 'index.html'],
    ['/series/Action%20Comics', 'series/Action Comics.html'],
    ['/artist/Peach%20Momoko', 'artist/Peach Momoko.html'],
    ['/tag/First%20Issue', 'tag/First Issue.html'],
    ['/series/Alien%203%20%5BAlien%C2%B3%5D', 'series/Alien 3 [Alien³].html'],
    ['/series/Aliens%20%2F%20Predator%3A%20The%20Deadliest%20of%20the%20Species', 'series/Aliens / Predator: The Deadliest of the Species.html'],
  ])('maps %s to the decoded asset path', (route, file) => {
    expect(staticRoutePath('dist', route)).toBe(path.resolve('dist', file));
  });

  it('rejects traversal outside the build directory', () => {
    expect(() => staticRoutePath('dist', '/%2e%2e/private')).toThrow('escapes');
  });
});

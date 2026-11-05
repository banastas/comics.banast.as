// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { getCoverSource, hasRealCover } from './covers';
import { CoverImage } from '../components/CoverImage';
import data from '../data/comics.json';
import type { Comic } from '../types/Comic';

const url = 'https://covers.banast.as/X-Files_Vol4_01A.jpg';
const resized = (width: number) => `https://covers.banast.as/cdn-cgi/image/width=${width},quality=80,format=auto,fit=scale-down/X-Files_Vol4_01A.jpg`;

describe('getCoverSource', () => {
  it('serves resized covers from covers.banast.as with a 2x srcset', () => {
    expect(getCoverSource(url, 240)).toEqual({ src: resized(480), srcSet: `${resized(240)} 240w, ${resized(480)} 480w` });
    expect(getCoverSource(url, 288)).toEqual({ src: resized(480), srcSet: `${resized(240)} 240w, ${resized(480)} 480w` });
  });

  it('uses the smallest width for thumbnails', () => {
    expect(getCoverSource(url, 32)).toEqual({ src: resized(240), srcSet: undefined });
  });

  it('leaves covers from other hosts alone', () => {
    expect(getCoverSource('https://example.com/cover.jpg', 240)).toEqual({ src: 'https://example.com/cover.jpg' });
  });

  it('treats placeholder covers as missing', () => {
    expect(hasRealCover('https://covers.banast.as/noCover.jpg')).toBe(false);
    expect(hasRealCover(url)).toBe(true);
  });
});

describe('CoverImage', () => {
  it('falls back to the original file, then the placeholder, when images fail', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const comic = { ...(data[0] as Comic), coverImageUrl: url };
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => root.render(<CoverImage comic={comic} displayWidth={240} />));
    const img = () => container.querySelector('img');
    expect(img()?.getAttribute('src')).toBe(resized(480));

    await act(async () => { img()!.dispatchEvent(new Event('error')); });
    expect(img()?.getAttribute('src')).toBe(url);
    expect(img()?.hasAttribute('srcset')).toBe(false);

    await act(async () => { img()!.dispatchEvent(new Event('error')); });
    expect(img()).toBeNull();
    expect(container.textContent).toContain('Cover coming soon');

    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  });
});

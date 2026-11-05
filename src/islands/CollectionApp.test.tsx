// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CollectionApp, { DEFAULT_ITEMS_PER_PAGE, readViewState, type CollectionAppProps } from './CollectionApp';
import data from '../data/comics.json';
import { applyFilters, defaultFilters, matchesSearch, sortCollection } from '../utils/collection-filter';
import { computeTagData, computeTagsForComic } from '../utils/computed-tags';
import { resetComicIndex } from '../utils/comic-index';
import { comicPath } from '../utils/paths';
import { calculateComicStats } from '../utils/stats';
import { resetPageViewTracking } from '../utils/analytics';
import type { Comic } from '../types/Comic';

const comics = data as Comic[];
const total = comics.length;
const tagData = computeTagData(comics);
const gemMintCount = comics.filter((comic) => computeTagsForComic(comic).includes('Gem Mint')).length;
const alienGemMint = comics.filter((comic) => computeTagsForComic(comic).includes('Gem Mint') && matchesSearch(comic, 'Alien'));

// The same props the home page renders at build time.
const props: CollectionAppProps = {
  stats: calculateComicStats(comics),
  variantsCount: comics.filter((comic) => comic.isVariant).length,
  boxesCount: new Set(comics.map((comic) => comic.storageLocation).filter(Boolean)).size,
  computedTags: tagData.allComputedTags,
  tagCounts: Object.fromEntries(tagData.computedTagCounts),
  firstPage: applyFilters(comics, defaultFilters, 'releaseDate', 'desc', null, tagData.computedTagsMap).slice(0, DEFAULT_ITEMS_PER_PAGE),
};

let root: ReturnType<typeof createRoot>;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  fetchMock = vi.fn(async () => new Response(JSON.stringify(comics), { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  resetComicIndex();
  resetPageViewTracking();
  document.body.innerHTML = '<div id="root"></div>';
  root = createRoot(document.getElementById('root')!);
});
afterEach(async () => {
  await act(async () => root.unmount());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/');
  document.body.innerHTML = '';
});

const render = async (url = '/') => {
  window.history.replaceState(null, '', url);
  await act(async () => root.render(<CollectionApp {...props} />));
  // Let the collection request resolve and the filtered view render.
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
};
const control = (name: string) => {
  const found = [...document.querySelectorAll<HTMLElement>('button,a,[role="button"]')]
    .find((el) => el.getAttribute('aria-label') === name || el.textContent?.trim() === name);
  expect(found, `control ${name}`).toBeDefined();
  return found!;
};
const click = async (name: string) => { await act(async () => control(name).click()); };
const resultText = () => document.querySelector('main [role="status"]')?.textContent;

describe('collection page', () => {
  it('renders the build-time first page before the collection loads', async () => {
    fetchMock.mockImplementation(() => new Promise(() => {}));
    window.history.replaceState(null, '', '/');
    await act(async () => root.render(<CollectionApp {...props} />));
    expect(resultText()).toContain(`Showing 1–48 of ${total}`);
    expect(document.querySelector(`main a[href="${comicPath(props.firstPage[0])}"]`)).not.toBeNull();
  });

  it('retains tags when changing view and sort, including reload URLs', async () => {
    await render('/?filter=Gem+Mint');
    expect(resultText()).toContain(`of ${gemMintCount}`);
    await click('List view');
    await click('Sort ascending');
    expect(resultText()).toContain(`of ${gemMintCount}`);
    expect(new URLSearchParams(location.search).get('filter')).toBe('Gem Mint');
    expect(control(`Gem Mint${gemMintCount}`).getAttribute('aria-pressed')).toBe('true');
  });

  it('loads shared search/filter/sort URLs into matching results', async () => {
    await render('/collection?search=Alien&filter=Gem+Mint&view=list&sort=grade&order=asc');
    expect(resultText()).toContain(`of ${alienGemMint.length}`);
    expect((document.querySelector('input[aria-label="Search comics"]') as HTMLInputElement).value).toBe('Alien');
    expect(control('List view').getAttribute('aria-pressed')).toBe('true');
  });

  it('clears both filters in the UI and URL', async () => {
    await render('/?search=Alien&filter=Gem+Mint');
    await click('Clear all filters');
    expect(resultText()).toContain(`of ${total}`);
    expect(location.search).toBe('');
  });

  it('restores URL defaults on browser navigation', async () => {
    await render('/?view=list&sort=title&order=asc');
    await act(async () => {
      window.history.replaceState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(control('Grid view').getAttribute('aria-pressed')).toBe('true');
    expect(readViewState(location.search)).toMatchObject({ sortField: 'releaseDate', sortDirection: 'desc' });
  });

  it('keeps the page in the URL and omits default parameters', async () => {
    await render('/');
    await click('Page 3');
    expect(location.pathname).toBe('/');
    expect(location.search).toBe('?page=3');
    expect(resultText()).toContain('Showing 97–144');
    await act(async () => {
      window.history.replaceState(null, '', '/?page=2');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(resultText()).toContain('Showing 49–96');
  });

  it('renders comics as real links', async () => {
    await render('/');
    const link = document.querySelector<HTMLAnchorElement>('main a[href^="/comic/"]');
    expect(link).not.toBeNull();
    expect(link!.getAttribute('href')).toBe(comicPath(props.firstPage[0]));
  });

  it('does not crash when storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError'); });
    await render();
    expect(resultText()).toContain(`of ${total}`);
  });

  it('explains a failed load for a filtered view instead of showing an empty collection', async () => {
    fetchMock.mockImplementation(async () => new Response('nope', { status: 503 }));
    await render('/?search=Alien');
    expect(document.querySelector('[role="alert"]')?.textContent).toContain('could not be loaded');
    expect(document.body.textContent).not.toContain('No comics match');
  });

  it('keeps showing the prerendered page if the load fails on the default view', async () => {
    fetchMock.mockImplementation(async () => new Response('nope', { status: 503 }));
    await render('/');
    expect(resultText()).toContain(`Showing 1–48 of ${total}`);
    expect(document.querySelector('[role="alert"]')).toBeNull();
  });
});

describe('readViewState', () => {
  it('falls back to defaults for unknown values', () => {
    expect(readViewState('?sort=bogus&order=sideways&view=tiles&page=-3')).toEqual({
      searchTerm: '', tag: null, sortField: 'releaseDate', sortDirection: 'desc', viewMode: 'grid', page: 0,
    });
  });

  it('reads one-based pages', () => {
    expect(readViewState('?page=4').page).toBe(3);
  });
});

describe('collection sorting', () => {
  it('orders by value with unrecorded values last in both directions', () => {
    const desc = sortCollection(comics, 'currentValue', 'desc');
    const valued = comics.filter((c) => c.currentValue !== undefined).map((c) => c.currentValue!);
    expect(desc[0].currentValue).toBe(Math.max(...valued));
    const firstMissing = desc.findIndex((c) => c.currentValue === undefined);
    if (firstMissing >= 0) expect(desc.slice(firstMissing).every((c) => c.currentValue === undefined)).toBe(true);
    const asc = sortCollection(comics, 'currentValue', 'asc');
    expect(asc[0].currentValue).toBe(Math.min(...valued));
    for (let i = 1; i < valued.length; i += 1) {
      expect(asc[i].currentValue!).toBeGreaterThanOrEqual(asc[i - 1].currentValue!);
    }
  });

  it('orders purchase prices correctly when some are missing', () => {
    const desc = sortCollection(comics, 'purchasePrice', 'desc');
    const priced = desc.filter((c) => c.purchasePrice !== undefined);
    expect(desc.slice(0, priced.length)).toEqual(priced);
    for (let i = 1; i < priced.length; i += 1) {
      expect(priced[i].purchasePrice!).toBeLessThanOrEqual(priced[i - 1].purchasePrice!);
    }
  });
});

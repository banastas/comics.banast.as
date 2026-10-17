// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { sortCollection, useComicStore } from './stores/comicStore';
import data from './data/comics.json';
import { createComicSlug } from './utils/routing';
import { computeTagsForComic } from './utils/computed-tags';
import { resetPageViewTracking } from './utils/analytics';
import type { Comic } from './types/Comic';

let root: ReturnType<typeof createRoot>;
const comics = data as Comic[];
const original = useComicStore.getState();
const total = comics.length;
const gemMintCount = comics.filter((comic) => computeTagsForComic(comic).includes('Gem Mint')).length;
const alienGemMint = comics.filter((comic) => computeTagsForComic(comic).includes('Gem Mint') && useComicStoreMatches(comic, 'Alien'));

function useComicStoreMatches(comic: Comic, term: string) {
  const t = term.toLowerCase();
  return [`${comic.seriesName} #${comic.issueNumber}`, comic.title, comic.notes, comic.signedBy, comic.coverArtist]
    .some((field) => field.toLowerCase().includes(t));
}

beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  window.history.replaceState(null, '', '/');
  resetPageViewTracking();
  useComicStore.setState({ ...original, loading: false });
  useComicStore.getState().setComics(comics);
  document.body.innerHTML = '<div id="root"></div>';
  await import('./components/ComicDetail');
  root = createRoot(document.getElementById('root')!);
});
afterEach(async () => {
  await act(async () => root.unmount());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});
const render = async (url = '/') => {
  window.history.replaceState(null, '', url);
  await act(async () => root.render(<App />));
};
const control = (name: string) => {
  const found = [...document.querySelectorAll<HTMLElement>('button,a,[role="button"]')].find(el => el.getAttribute('aria-label') === name || el.textContent?.trim() === name);
  expect(found, `control ${name}`).toBeDefined();
  return found!;
};
const click = async (name: string) => { await act(async () => control(name).click()); };
const resultText = () => document.querySelector('[role="status"]')?.textContent;

describe('collection browsing regressions', () => {
  it('retains tags when changing view and sort, including reload URLs', async () => {
    await render('/collection?filter=Gem+Mint');
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
    await render('/collection?search=Alien&filter=Gem+Mint');
    await click('Clear all filters');
    expect(resultText()).toContain(`of ${total}`);
    expect(location.search).not.toContain('filter=');
    expect(location.search).not.toContain('search=');
  });

  it('restores collection search and tag after opening a comic', async () => {
    await render('/collection?search=Alien&filter=Gem+Mint&view=list');
    const record = useComicStore.getState().filteredComics[0];
    const link = document.querySelector<HTMLAnchorElement>(`a[href="/comic/${createComicSlug(record)}"]`);
    expect(link).not.toBeNull();
    await act(async () => link!.click());
    expect(location.pathname).toContain('/comic/');
    await click('Collection');
    expect(resultText()).toContain(`of ${alienGemMint.length}`);
    expect(control('List view').getAttribute('aria-pressed')).toBe('true');
  });

  it('restores URL defaults on browser navigation', async () => {
    await render('/collection?view=list&sort=title&order=asc');
    await act(async () => {
      window.history.replaceState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(control('Grid view').getAttribute('aria-pressed')).toBe('true');
    expect(useComicStore.getState().sortField).toBe('releaseDate');
    expect(useComicStore.getState().sortDirection).toBe('desc');
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

  it('renders comics as real links that a modified click leaves to the browser', async () => {
    await render('/');
    const link = document.querySelector<HTMLAnchorElement>('main a[href^="/comic/"]');
    expect(link).not.toBeNull();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, metaKey: true });
    await act(async () => { link!.dispatchEvent(event); });
    expect(location.pathname).toBe('/');
  });

  it('does not crash when storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError'); });
    await render();
    expect(resultText()).toContain(`of ${total}`);
  });

  it.each(['/comic/missing', '/series/%E0%A4%A', '/series/NotARealSeries', '/#/comic/missing'])('shows a recoverable not-found view for %s', async (url) => {
    await render(url);
    expect(document.querySelector('h1')?.textContent).toContain('not in this collection');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toContain('noindex');
    await click('Return to the collection');
    expect(resultText()).toContain(`of ${total}`);
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toContain('max-image-preview:large');
  });

  it('never flashes "not found" or noindex for a valid page while data loads', async () => {
    const series = comics[0].seriesName;
    document.title = 'Loading';
    useComicStore.setState({ comics: [], filteredComics: [], loading: true });
    await render(`/series/${encodeURIComponent(series)}`);
    expect(document.title).not.toContain('Page Not Found');
    await act(async () => {
      useComicStore.getState().setComics(comics);
      useComicStore.setState({ loading: false });
    });
    await act(async () => { await import('./components/SeriesDetail'); });
    expect(document.title).toContain(series);
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).not.toContain('noindex');
  });

  it('sends one page view per page with that page\'s own title', async () => {
    const gtag = vi.fn();
    vi.stubGlobal('gtag', gtag);
    await render('/');
    const comic = comics.find((c) => !c.isVariant)!;
    await act(async () => document.querySelector<HTMLAnchorElement>(`a[href="/comic/${createComicSlug(comic)}"]`)?.click()
      ?? window.history.pushState(null, '', `/comic/${createComicSlug(comic)}`));
    const views = gtag.mock.calls.filter(([, name]) => name === 'page_view').map(([, , params]) => params as { page_path: string; page_title: string });
    expect(views[0]).toMatchObject({ page_path: '/', page_title: 'Comic Collection | comics.banast.as' });
    expect(views.filter((view) => view.page_path === '/')).toHaveLength(1);
  });

  it('supports legacy issue slugs without mistaking an issue number for a record ID', async () => {
    const c = comics.find(c => c.seriesName === 'Alien (Vol 2)' && !c.isVariant)!;
    const legacySlug = createComicSlug(c).replace(/-\d+$/, '');
    await render(`/#/comic/${legacySlug}`);
    expect(document.title).toContain(`${c.seriesName} #${c.issueNumber}`);
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

describe('load failure recovery', () => {
  it('shows a retry instead of an editable empty collection when data fails', async () => {
    useComicStore.setState({ loadError: true, loading: false });
    await render();
    expect(document.querySelector('[role="alert"]')?.textContent).toContain('reload');
    expect(control('Reload collection')).toBeDefined();
    expect(document.body.textContent).not.toContain('Add a comic');
  });
});

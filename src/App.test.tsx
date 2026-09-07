// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { useComicStore } from './stores/comicStore';
import data from './data/comics.json';
import { createComicSlug } from './utils/routing';
import type { Comic } from './types/Comic';

let root: ReturnType<typeof createRoot>;
const comics = data as Comic[];
const original = useComicStore.getState();

beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} });
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  window.history.replaceState(null, '', '/');
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
const button = (name: string) => {
  const found = [...document.querySelectorAll<HTMLElement>('button,[role="button"]')].find(el => el.getAttribute('aria-label') === name || el.textContent?.trim() === name);
  expect(found, `button ${name}`).toBeDefined();
  return found!;
};
const click = async (name: string) => { await act(async () => button(name).click()); };
const resultText = () => document.querySelector('[role="status"]')?.textContent;

describe('collection browsing regressions', () => {
  it('retains tags when changing view and sort, including reload URLs', async () => {
    await render('/collection?filter=Gem+Mint');
    expect(resultText()).toContain('of 7');
    await click('List view');
    await click('Sort ascending');
    expect(resultText()).toContain('of 7');
    expect(new URLSearchParams(location.search).get('filter')).toBe('Gem Mint');
    expect(button('Gem Mint7').getAttribute('aria-pressed')).toBe('true');
  });

  it('loads shared search/filter/sort URLs into matching results', async () => {
    await render('/collection?search=Alien&filter=Gem+Mint&view=list&sort=grade&order=asc');
    expect(resultText()).toContain('of 3');
    expect((document.querySelector('input[aria-label="Search comics"]') as HTMLInputElement).value).toBe('Alien');
    expect(button('List view').getAttribute('aria-pressed')).toBe('true');
  });

  it('clears both filters in the UI and URL', async () => {
    await render('/collection?search=Alien&filter=Gem+Mint');
    await click('Clear all filters');
    expect(resultText()).toContain('of 853');
    expect(location.search).not.toContain('filter=');
    expect(location.search).not.toContain('search=');
  });

  it('restores collection search and tag after opening a comic', async () => {
    await render('/collection?search=Alien&filter=Gem+Mint&view=list');
    const record = useComicStore.getState().filteredComics[0];
    await click(`${record.seriesName} #${record.issueNumber}, grade ${record.grade}, value $${record.currentValue!.toFixed(2)}`);
    expect(location.pathname).toContain('/comic/');
    await click('Collection');
    expect(resultText()).toContain('of 3');
    expect(button('List view').getAttribute('aria-pressed')).toBe('true');
  });

  it('restores URL defaults on browser navigation', async () => {
    await render('/collection?view=list&sort=title&order=asc');
    await act(async () => {
      window.history.replaceState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(button('Grid view').getAttribute('aria-pressed')).toBe('true');
    expect(useComicStore.getState().sortField).toBe('releaseDate');
    expect(useComicStore.getState().sortDirection).toBe('desc');
  });

  it('does not crash when storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError'); });
    await render();
    expect(resultText()).toContain('of 853');
  });

  it.each(['/comic/missing', '/series/%E0%A4%A', '/series/NotARealSeries', '/#/comic/missing'])('shows a recoverable not-found view for %s', async (url) => {
    await render(url);
    expect(document.querySelector('h1')?.textContent).toContain('not in this collection');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toContain('noindex');
    await click('Return to the collection');
    expect(resultText()).toContain('of 853');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('index,follow');
  });

  it('supports legacy issue slugs without mistaking an issue number for a record ID', async () => {
    const c = comics.find(c => c.seriesName === 'Alien (Vol 2)' && !c.isVariant)!;
    const legacySlug = createComicSlug(c).replace(/-\d+$/, '');
    await render(`/#/comic/${legacySlug}`);
    expect(document.title).toContain(`${c.seriesName} #${c.issueNumber}`);
  });
});

describe('load failure recovery', () => {
  it('shows a retry instead of an editable empty collection when data fails', async () => {
    useComicStore.setState({ loadError: true, loading: false });
    await render();
    expect(document.querySelector('[role="alert"]')?.textContent).toContain('reload');
    expect(button('Reload collection')).toBeDefined();
    expect(document.body.textContent).not.toContain('Add Your First Comic');
  });
});

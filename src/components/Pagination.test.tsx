// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { DetailPageLayout, firstDetailPage } from './DetailPageLayout';
import data from '../data/comics.json';
import type { Comic } from '../types/Comic';
import { calculateComicStats } from '../utils/stats';
import { resetComicIndex } from '../utils/comic-index';

let root: ReturnType<typeof createRoot>;
afterEach(async () => {
  await act(async () => root?.unmount());
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

it('loads the rest of a long detail list on demand and resets to the first page after sorting', async () => {
  const comics = (data as Comic[]).slice(0, 60).map((comic) => ({ ...comic, isSlabbed: false }));
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(comics), { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { value: vi.fn(), configurable: true });
  resetComicIndex();
  document.body.innerHTML = '<div id="test"></div>';
  window.history.replaceState(null, '', '/raw');
  root = createRoot(document.getElementById('test')!);

  await act(async () => root.render(
    <DetailPageLayout
      source={{ kind: 'raw' }}
      firstPage={firstDetailPage(comics)}
      total={comics.length}
      stats={calculateComicStats(comics)}
      breadcrumbItems={[{ label: 'Collection', href: '/' }, { label: 'Raw Comics' }]}
      title="Raw"
      subtitle="60 comics"
      comicsListTitle="Comics"
    />,
  ));
  const status = () => document.querySelector('[role="status"]')?.textContent;
  expect(status()).toBe('Showing 1–48 of 60');
  expect(fetchMock).not.toHaveBeenCalled();

  const next = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Next')!;
  await act(async () => next.click());
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(status()).toBe('Showing 49–60 of 60');

  const select = document.querySelector('select')!;
  await act(async () => { select.value = 'grade'; select.dispatchEvent(new Event('change', { bubbles: true })); });
  expect(status()).toBe('Showing 1–48 of 60');
});

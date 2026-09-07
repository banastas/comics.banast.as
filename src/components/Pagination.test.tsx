// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { DetailPageLayout } from './DetailPageLayout';
import data from '../data/comics.json';
import type { Comic } from '../types/Comic';
let root: ReturnType<typeof createRoot>;
afterEach(async () => { await act(async () => root?.unmount()); vi.unstubAllGlobals(); vi.restoreAllMocks(); document.body.innerHTML = ''; });
it('paginates long detail lists and resets to the first page after sorting', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { value: vi.fn(), configurable: true });
  document.body.innerHTML='<div id="test"></div>';
  window.history.replaceState(null,'','/raw');
  root=createRoot(document.getElementById('test')!);
  await act(async()=>root.render(<DetailPageLayout comics={(data as Comic[]).slice(0,60)} onBack={()=>{}} onView={()=>{}} icon={null} iconBgColor="" title="Raw" subtitle="60 comics" comicsListTitle="Comics"/>));
  expect(document.querySelector('[role="status"]')?.textContent).toBe('Showing 1 to 48 of 60');
  const next=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Next')!;
  await act(async()=>next.click());
  expect(document.querySelector('[role="status"]')?.textContent).toBe('Showing 49 to 60 of 60');
  const select=document.querySelector('select')!;
  await act(async()=>{select.value='grade';select.dispatchEvent(new Event('change',{bubbles:true}));});
  expect(document.querySelector('[role="status"]')?.textContent).toBe('Showing 1 to 48 of 60');
});

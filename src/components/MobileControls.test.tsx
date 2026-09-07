// @vitest-environment jsdom
import { act, useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { MobileControls } from './MobileControls';
let root: ReturnType<typeof createRoot>;
afterEach(async () => { await act(async () => root?.unmount()); vi.unstubAllGlobals(); document.body.innerHTML = ''; });
function Harness() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const close = useCallback(() => setOpen(false), []);
  return <><button onClick={() => setOpen(true)}>Open controls</button><MobileControls isOpen={open} onClose={close} viewMode={view} onViewModeChange={setView} sortField="title" onSortFieldChange={vi.fn()} sortDirection="asc" onSortDirectionChange={vi.fn()} /></>;
}
it('keeps focus on chosen controls, traps Tab, restores the trigger and scroll on Escape', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  document.body.innerHTML = '<div id="test"></div>';
  root = createRoot(document.getElementById('test')!);
  await act(async () => root.render(<Harness />));
  const trigger = document.querySelector('button')!;
  trigger.focus();
  await act(async () => trigger.click());
  const close = document.querySelector<HTMLButtonElement>('[aria-label="Close view and sort controls"]')!;
  expect(document.activeElement).toBe(close);
  expect(document.body.style.overflow).toBe('hidden');
  const list = [...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')].find(b => b.textContent?.trim() === 'List')!;
  list.focus();
  await act(async () => list.click());
  expect(document.activeElement).toBe(list);
  const last = document.querySelector<HTMLButtonElement>('[aria-label="Sort descending"]')!;
  last.focus();
  await act(async () => last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })));
  expect(document.activeElement).toBe(close);
  await act(async () => close.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
  expect(document.body.style.overflow).toBe('');
});

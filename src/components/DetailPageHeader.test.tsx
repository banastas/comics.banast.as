// @vitest-environment jsdom

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DetailPageHeader } from './DetailPageHeader';

let root: ReturnType<typeof createRoot> | undefined;

afterEach(() => {
  root?.unmount();
  root = undefined;
  document.body.innerHTML = '';
});

describe('DetailPageHeader', () => {
  it('offers newest-first and oldest-first release date sorting by default', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root!.render(
        <DetailPageHeader
          onBack={vi.fn()}
          viewMode="grid"
          onViewModeChange={vi.fn()}
          sortBy="series"
          onSortChange={vi.fn()}
        />
      );
    });

    const sortSelect = document.querySelector<HTMLSelectElement>('select[aria-label="Sort comics"]');
    const options = Array.from(sortSelect?.options ?? []).map((option) => ({
      value: option.value,
      label: option.textContent,
    }));

    expect(options).toEqual(
      expect.arrayContaining([
        { value: 'dateDesc', label: 'Release Date: Newest' },
        { value: 'dateAsc', label: 'Release Date: Oldest' },
      ])
    );
  });
});

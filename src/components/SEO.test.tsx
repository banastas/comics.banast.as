// @vitest-environment jsdom

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { SEO } from './SEO';

let root: ReturnType<typeof createRoot> | undefined;

afterEach(() => {
  root?.unmount();
  root = undefined;
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});

describe('SEO', () => {
  it('updates document metadata and structured data without react-helmet', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root!.render(
        <SEO
          title="Collection Statistics"
          description="Stats description"
          canonical="https://comics.banast.as/stats"
          structuredData={{ '@context': 'https://schema.org', '@type': 'Collection' }}
        />
      );
    });

    expect(document.title).toBe('Collection Statistics | comics.banast.as');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Stats description');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://comics.banast.as/stats');
    expect(document.querySelector('script[type="application/ld+json"]')?.textContent).toContain('"@type":"Collection"');
  });
});

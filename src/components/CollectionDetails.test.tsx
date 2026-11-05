// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { DetailPageLayout } from './DetailPageLayout';
import { ComicDetail, comicSeriesContext } from './ComicDetail';
import { AcquisitionTimeline } from './AcquisitionTimeline';
import { buildAcquisitionTimeline } from '../utils/acquisition-timeline';
import { ComicListItem } from './ComicListView';
import { ComicCard } from './ComicCard';
import { CollectionHealth } from './CollectionHealth';
import { KeyStats } from './Dashboard';
import { describeSeries, seriesSubtitle } from './detailText';
import { calculateComicStats } from '../utils/stats';
import data from '../data/comics.json';
import type { Comic } from '../types/Comic';
// Fixtures vary IDs and series, so they compute their slugs instead of reusing the real record's.
const base = { ...(data[0] as Comic), slug: undefined };
const noop = () => {};
const detail = (comic: Comic, allComics: Comic[] = [comic]) => (
  <ComicDetail comic={comic} {...comicSeriesContext(comic, allComics)} onView={noop} />
);
const layoutProps = (comics: Comic[]) => ({
  source: { kind: 'variants' as const },
  firstPage: comics,
  total: comics.length,
  stats: calculateComicStats(comics),
  breadcrumbItems: [{ label: 'Collection', href: '/' }, { label: 'Variants' }],
  title: 'Variants',
  subtitle: '1 comic',
  comicsListTitle: 'Comics',
});
const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

describe('detail page contracts', () => {
  it('renders comics before aggregate highlights and applies ?view=list after hydration', async () => {
    const comics = [{ ...base, isVariant: true, purchasePrice: 1, currentValue: 3 }];
    const doc = parse(renderToStaticMarkup(<DetailPageLayout {...layoutProps(comics)} />));
    expect(doc.querySelector('main')).not.toBeNull();
    const headings = [...doc.querySelectorAll('h2')].map((h) => h.textContent);
    expect(headings.indexOf('Comics')).toBeLessThan(headings.indexOf('Highlights'));

    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    window.history.replaceState(null, '', '/variants?view=list');
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => root.render(<DetailPageLayout {...layoutProps(comics)} />));
    expect(container.querySelector('[aria-label="List view"]')?.getAttribute('aria-pressed')).toBe('true');
    await act(async () => root.unmount());
    window.history.replaceState(null, '', '/');
    vi.unstubAllGlobals();
  });

  it('does not display an invented free purchase or gain on a comic with unknown cost', () => {
    const html = renderToStaticMarkup(detail({ ...base, purchasePrice: undefined, currentValue: 450 }, []));
    expect(html).toContain('Not recorded');
    expect(html).not.toContain('+$450');
    const row = renderToStaticMarkup(<ComicListItem comic={{ ...base, purchasePrice: undefined, currentValue: 450 }} onView={noop} />);
    expect(row).not.toContain('+$450');
  });

  it('names the comic page after the series and issue, without internal record dates', () => {
    const comic = { ...base, seriesName: 'Spawn', issueNumber: 85, isVariant: false };
    const doc = parse(renderToStaticMarkup(detail(comic)));
    expect(doc.querySelector('h1')?.textContent).toBe('Spawn #85');
    expect(doc.body.textContent).not.toContain('Added to Collection');
    expect(doc.body.textContent).not.toContain('Last Updated');
  });

  it('shows the issue label in place of the issue number when one is set', () => {
    const comic = { ...base, seriesName: 'Spawn', issueNumber: 1, issueLabel: 'Annual 1', isVariant: false };
    const doc = parse(renderToStaticMarkup(detail(comic)));
    expect(doc.querySelector('h1')?.textContent).toBe('Spawn Annual 1');
    expect(doc.body.textContent).not.toContain('#1');
  });

  it('links related issues with real hrefs and shows values rather than an invented $0 cost', () => {
    const series = [1, 2, 3].map((issueNumber) => ({ ...base, id: `comic-${900 + issueNumber}`, seriesName: 'Test Series', issueNumber, purchasePrice: undefined, currentValue: 4 }));
    const doc = parse(renderToStaticMarkup(detail(series[1], series)));
    const hrefs = [...doc.querySelectorAll('a[href^="/comic/"]')].map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/comic/test-series-issue-1-901');
    expect(hrefs).toContain('/comic/test-series-issue-3-903');
    expect(doc.body.textContent).not.toContain('$0.00');
    expect(doc.querySelector('nav[aria-label="Issues in this series"]')).not.toBeNull();
  });

  it('renders cards as links and never shows a trend arrow for an unchanged value', () => {
    const doc = parse(renderToStaticMarkup(<ComicCard comic={{ ...base, purchasePrice: 5, currentValue: 5 }} onView={noop} />));
    const link = doc.querySelector('a');
    expect(link?.getAttribute('href')).toMatch(/^\/comic\//);
    expect(doc.querySelector('.lucide-trending-up, .lucide-trending-down')).toBeNull();
  });

  it('does not print a stray 0 for series that include issue #0', () => {
    expect(seriesSubtitle([0])).toEqual({ subtitle: '1 issue in the collection', note: undefined });
    expect(seriesSubtitle([3, 0, 1])).toEqual({ subtitle: '3 issues in the collection', note: '(#0–#3)' });
  });

  it('hides headline returns when too few comics have recorded costs', () => {
    const comics = [
      { ...base, id: 'a', purchasePrice: 1.95, currentValue: 159 },
      ...Array.from({ length: 4 }, (_, i) => ({ ...base, id: `b${i}`, purchasePrice: undefined, currentValue: 5 })),
    ];
    const html = renderToStaticMarkup(<KeyStats stats={calculateComicStats(comics)} />);
    expect(html).toContain('Not enough recorded costs');
    expect(html).not.toContain('8053');
  });

  it('exposes monthly data without requiring hover and keeps empty months on the axis', () => {
    const html = renderToStaticMarkup(<AcquisitionTimeline comics={[{ ...base, purchaseDate: '2026-01-01', purchasePrice: 5 }]} />);
    expect(html).toContain('<summary');
    expect(html).toContain('View monthly data');
    expect(html).toContain('<th scope="row"');
    expect(html).toContain('Jan 2026');
    const months = buildAcquisitionTimeline([
      { ...base, purchaseDate: '2026-03-10' },
      { ...base, purchaseDate: '2026-05-02' },
    ]).map((month) => `${month.fullLabel}:${month.count}`);
    expect(months).toHaveLength(24);
    expect(months.slice(-3)).toEqual(['Mar 2026:1', 'Apr 2026:0', 'May 2026:1']);
  });

  it('handles empty completeness metrics without NaN and ignores placeholder covers', () => {
    expect(renderToStaticMarkup(<CollectionHealth comics={[]} />)).not.toContain('NaN');
    const html = renderToStaticMarkup(<CollectionHealth comics={[{ ...base, coverImageUrl: 'https://covers.banast.as/noCover.jpg' }]} />);
    expect(html).toContain('0 of 1 · 0%');
  });

  it('shows the publisher and the date a value was recorded when known', () => {
    const comic = { ...base, currentValue: 12, valueAsOf: '2026-11-04' };
    const doc = parse(renderToStaticMarkup(<ComicDetail comic={comic} {...comicSeriesContext(comic, [comic])} publisher="Image" />));
    expect(doc.body.textContent).toContain('PublisherImage');
    expect(doc.body.textContent).toContain('as of November 4, 2026');

    const plain = parse(renderToStaticMarkup(detail({ ...base, currentValue: 12 })));
    expect(plain.body.textContent).not.toContain('Publisher');
    expect(plain.body.textContent).not.toContain('as of');
  });

  it('describes a series from whichever details are known', () => {
    expect(describeSeries({ publisher: 'Marvel', volume: 1, startYear: 2021 })).toBe('Marvel · Volume 1 · Since 2021');
    expect(describeSeries({ startYear: 1992 })).toBe('Since 1992');
    expect(describeSeries({})).toBeUndefined();
    expect(describeSeries(undefined)).toBeUndefined();
  });
});

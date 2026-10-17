// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DetailPageLayout } from './DetailPageLayout';
import { ComicDetail } from './ComicDetail';
import { AcquisitionTimeline } from './AcquisitionTimeline';
import { buildAcquisitionTimeline } from '../utils/acquisition-timeline';
import { ComicListItem } from './ComicListView';
import { ComicCard } from './ComicCard';
import { CollectionHealth } from './CollectionHealth';
import { KeyStats } from './Dashboard';
import { SeriesDetail } from './SeriesDetail';
import { calculateComicStats } from '../utils/stats';
import data from '../data/comics.json';
import type { Comic } from '../types/Comic';
const base = data[0] as Comic;
const noop = () => {};
const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

describe('detail page contracts', () => {
  it('respects the selected list view and renders comics before aggregate highlights', () => {
    window.history.replaceState(null, '', '/variants?view=list');
    const comics = [{ ...base, isVariant: true, purchasePrice: 1, currentValue: 3 }];
    const doc = parse(renderToStaticMarkup(<DetailPageLayout comics={comics} onBack={noop} onView={noop} icon={null} iconBgColor="" title="Variants" subtitle="1 comic" comicsListTitle="Comics" />));
    expect(doc.querySelector('[aria-label="List view"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(doc.querySelector('main')).not.toBeNull();
    const headings = [...doc.querySelectorAll('h2')].map((h) => h.textContent);
    expect(headings.indexOf('Comics')).toBeLessThan(headings.indexOf('Highlights'));
  });

  it('does not display an invented free purchase or gain on a comic with unknown cost', () => {
    const html = renderToStaticMarkup(<ComicDetail comic={{ ...base, purchasePrice: undefined, currentValue: 450 }} allComics={[]} onBack={noop} onView={noop} />);
    expect(html).toContain('Not recorded');
    expect(html).not.toContain('+$450');
    const row = renderToStaticMarkup(<ComicListItem comic={{ ...base, purchasePrice: undefined, currentValue: 450 }} onView={noop} />);
    expect(row).not.toContain('+$450');
  });

  it('names the comic page after the series and issue, without internal record dates', () => {
    const comic = { ...base, seriesName: 'Spawn', issueNumber: 85, isVariant: false };
    const doc = parse(renderToStaticMarkup(<ComicDetail comic={comic} allComics={[comic]} onBack={noop} onView={noop} />));
    expect(doc.querySelector('h1')?.textContent).toBe('Spawn #85');
    expect(doc.body.textContent).not.toContain('Added to Collection');
    expect(doc.body.textContent).not.toContain('Last Updated');
  });

  it('links related issues with real hrefs and shows values rather than an invented $0 cost', () => {
    const series = [1, 2, 3].map((issueNumber) => ({ ...base, id: `comic-${900 + issueNumber}`, seriesName: 'Test Series', issueNumber, purchasePrice: undefined, currentValue: 4 }));
    const doc = parse(renderToStaticMarkup(<ComicDetail comic={series[1]} allComics={series} onBack={noop} onView={noop} />));
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
    const comics = [{ ...base, issueNumber: 0, seriesName: 'Zero' }];
    const html = renderToStaticMarkup(<SeriesDetail seriesName="Zero" seriesComics={comics} onBack={noop} onView={noop} />);
    expect(parse(html).querySelector('h1 + p')?.textContent).toBe('1 issue in the collection');
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
});

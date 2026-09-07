// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DetailPageLayout } from './DetailPageLayout';
import { ComicDetail } from './ComicDetail';
import { AcquisitionTimeline } from './AcquisitionTimeline';
import { ComicListRow } from './ComicListRow';
import { CollectionHealth } from './CollectionHealth';
import data from '../data/comics.json';
import type { Comic } from '../types/Comic';
const base = data[0] as Comic;
const noop = () => {};

describe('detail page contracts', () => {
  it('uses the subset variant count and respects the selected list view', () => {
    window.history.replaceState(null, '', '/variants?view=list');
    const html = renderToStaticMarkup(<DetailPageLayout comics={[{...base,isVariant:true}]} onBack={noop} onView={noop} icon={null} iconBgColor="" title="Variants" subtitle="1 comic" comicsListTitle="Comics" />);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    expect(doc.querySelector('[aria-label="List view"]')?.getAttribute('aria-pressed')).toBe('true');
    const variantsLabel = [...doc.querySelectorAll('span')].find(e=>e.textContent==='Variants');
    expect(variantsLabel?.nextElementSibling?.textContent).toBe('1');
    expect(doc.querySelector('main')).not.toBeNull();
  });
  it('does not display an invented free purchase or gain on a comic with unknown cost', () => {
    const html = renderToStaticMarkup(<ComicDetail comic={{...base,purchasePrice:undefined,currentValue:450}} allComics={[]} onBack={noop} onView={noop} />);
    expect(html).toContain('Not recorded');
    expect(html).not.toContain('+$450');
    const row = renderToStaticMarkup(<ComicListRow comic={{...base,purchasePrice:undefined,currentValue:450}} onView={noop}/>);
    expect(row).not.toContain('+$450');
  });
  it('exposes monthly data without requiring hover', () => {
    const html = renderToStaticMarkup(<AcquisitionTimeline comics={[{...base,purchaseDate:'2026-01-01',purchasePrice:5}]} />);
    expect(html).toContain('<summary');
    expect(html).toContain('View monthly data');
    expect(html).toContain('<th scope="row"');
    expect(html).toContain('Jan 2026');
  });
  it('handles empty health metrics without NaN', () => {
    expect(renderToStaticMarkup(<CollectionHealth comics={[]} />)).not.toContain('NaN');
  });
});

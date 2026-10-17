import { describe, expect, it } from 'vitest';
import comics from '../src/data/comics.json';
import type { Comic } from '../src/types/Comic';
import {
  findDataWarnings,
  findSeriesCaseConflicts,
  formatDataWarnings,
  normalizeArtistName,
  normalizeSeriesName,
  repeatedLeadingWord,
  // @ts-expect-error Build utilities are native ESM shared with Node scripts.
} from './data-warnings.mjs';

const base: Comic = {
  id: 'comic-1',
  title: 'Spawn',
  seriesName: 'Spawn',
  issueNumber: 1,
  releaseDate: '1992-05-01',
  coverImageUrl: 'https://covers.banast.as/Spawn_1.jpg',
  coverArtist: 'Todd McFarlane',
  grade: 9.4,
  purchasePrice: 5,
  purchaseDate: '1992-05-01',
  currentValue: 60,
  notes: '',
  signedBy: '',
  storageLocation: 'Box 1',
  tags: [],
  isSlabbed: false,
  isVariant: false,
  isGraphicNovel: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const comic = (id: number, overrides: Partial<Comic> = {}): Comic => ({
  ...base,
  id: `comic-${id}`,
  coverImageUrl: `https://covers.banast.as/cover-${id}.jpg`,
  ...overrides,
});

type Warning = { rule: string; message: string; ids: string[] };
const rulesFor = (records: Comic[]) => (findDataWarnings(records) as Warning[]).map((warning) => warning.rule);
const idsForRule = (records: Comic[], rule: string) => (findDataWarnings(records) as Warning[])
  .filter((warning) => warning.rule === rule)
  .flatMap((warning) => warning.ids);

describe('data quality warnings', () => {
  it('reports nothing for a clean record', () => {
    expect(findDataWarnings([comic(1)])).toEqual([]);
    expect(formatDataWarnings([])).toBe('WARNINGS: none');
  });

  it('flags purchase dates before the release date, separating likely preorders', () => {
    const records = [
      comic(1, { purchaseDate: '1981-05-03', releaseDate: '2024-07-17' }),
      comic(2, { purchaseDate: '2026-01-28', releaseDate: '2026-04-01' }),
      comic(3, { purchaseDate: '2026-04-02', releaseDate: '2026-04-01' }),
    ];

    expect(idsForRule(records, 'purchase-before-release')).toEqual(['comic-1']);
    expect(idsForRule(records, 'purchase-before-release-preorder')).toEqual(['comic-2']);
  });

  it('flags a repeated leading word in titles and series names', () => {
    expect(repeatedLeadingWord('The The Department Of Truth')).toBe('The');
    expect(repeatedLeadingWord('Theme Park')).toBeUndefined();
    expect(repeatedLeadingWord('The Thing')).toBeUndefined();
    expect(idsForRule([comic(7, { title: 'The The Department Of Truth', seriesName: 'The The Department Of Truth' })], 'repeated-leading-word'))
      .toEqual(['comic-7', 'comic-7']);
  });

  it('flags series names that collide after normalizing case and punctuation', () => {
    expect(normalizeSeriesName('Bill & Ted: Excellent')).toBe(normalizeSeriesName('bill and ted excellent'));
    const records = [comic(1, { seriesName: 'X-Men' }), comic(2, { seriesName: 'X Men' }), comic(3, { seriesName: 'Spawn' })];

    expect(idsForRule(records, 'series-name-variants')).toEqual(['comic-1', 'comic-2']);
  });

  it('flags shared series prefixes that differ only by capitalization', () => {
    const conflicts = findSeriesCaseConflicts(['Rick and Morty', 'Rick And Morty Forever', 'Rick and Morty: Heist', 'Spawn']);

    expect(conflicts).toHaveLength(1);
    expect([...conflicts[0].keys()].sort()).toEqual(['Rick And Morty', 'Rick and Morty']);
    expect(findSeriesCaseConflicts(['Rick and Morty', 'Rick and Morty Forever'])).toEqual([]);
  });

  it('flags cover artist names that match after normalizing separators', () => {
    expect(normalizeArtistName('Pye Parr & Luke Preece & Andres Juarez')).toBe(normalizeArtistName('Pye Parr,  Luke Preece & Andres Juarez'));
    const records = [
      comic(1, { coverArtist: 'Pye Parr & Luke Preece & Andres Juarez' }),
      comic(2, { coverArtist: 'Pye Parr, Luke Preece & Andres Juarez' }),
      comic(3, { coverArtist: 'Pye Parr' }),
    ];

    expect(idsForRule(records, 'cover-artist-variants')).toEqual(['comic-1', 'comic-2']);
  });

  it('flags raw gem mint grades, missing values, and placeholder or shared covers', () => {
    const records = [
      comic(1, { grade: 9.8 }),
      comic(2, { grade: 9.8, isSlabbed: true }),
      comic(3, { purchasePrice: undefined, currentValue: undefined }),
      comic(4, { purchasePrice: undefined, currentValue: 0 }),
      comic(5, { coverImageUrl: 'https://covers.banast.as/noCover.jpg' }),
      comic(6, { coverImageUrl: 'https://covers.banast.as/' }),
      comic(7, { seriesName: 'Alien', coverImageUrl: 'https://covers.banast.as/shared.jpg' }),
      comic(8, { seriesName: 'Aliens', coverImageUrl: 'https://covers.banast.as/shared.jpg' }),
      comic(9, { coverImageUrl: 'https://covers.banast.as/same-series.jpg' }),
      comic(10, { coverImageUrl: 'https://covers.banast.as/same-series.jpg' }),
    ];

    expect(idsForRule(records, 'raw-gem-mint-grade')).toEqual(['comic-1']);
    expect(idsForRule(records, 'missing-value')).toEqual(['comic-3']);
    expect(idsForRule(records, 'placeholder-cover')).toEqual(['comic-5', 'comic-6']);
    expect(idsForRule(records, 'shared-cover')).toEqual(['comic-7', 'comic-8']);
  });

  it('formats a non-failing report for the current collection', () => {
    const report = formatDataWarnings(findDataWarnings(comics as Comic[]));

    expect(report).toMatch(/^WARNINGS/);
    expect(rulesFor(comics as Comic[]).every((rule) => typeof rule === 'string')).toBe(true);
  });
});

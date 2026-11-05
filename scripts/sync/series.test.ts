import { describe, expect, it } from 'vitest';
import { seriesMetadataSchema } from '../../src/validation/comic-schema';
import { seriesCommitMessage, transformSeriesSheet } from './series';
import { rowsFromValues } from './transform';

const names = new Set(['Alien (Vol 1)', 'Spawn']);
const rows = (...body: (string | number | boolean | null)[][]) =>
  rowsFromValues([['seriesName', 'publisher', 'volume', 'startYear'], ...body]).rows;

describe('transformSeriesSheet', () => {
  it('keeps filled fields, drops blanks, and sorts by series name', () => {
    const { series, warnings } = transformSeriesSheet(rows(
      ['Spawn', 'Image', '', 1992],
      ['Alien (Vol 1)', ' Marvel ', 1, '2021'],
      ['', 'ignored', '', ''],
    ), names);

    expect(series).toEqual({
      'Alien (Vol 1)': { publisher: 'Marvel', volume: 1, startYear: 2021 },
      Spawn: { publisher: 'Image', startYear: 1992 },
    });
    expect(Object.keys(series)).toEqual(['Alien (Vol 1)', 'Spawn']);
    expect(warnings).toEqual([]);
    expect(seriesMetadataSchema.parse(series)).toEqual(series);
  });

  it('skips series with no comics and rows with nothing filled in', () => {
    const { series, warnings } = transformSeriesSheet(rows(['Batman', 'DC', 1, 1940], ['Spawn', '', '', '']), names);

    expect(series).toEqual({});
    expect(warnings).toEqual(['Series sheet row 2: "Batman" has no comics in the collection; skipped']);
  });

  it.each([
    [[['Spawn', 'Image', 'two', '']], /row 2: volume "two" must be a whole number/],
    [[['Spawn', '', '', 1850]], /row 2: startYear "1850" must be a whole number from 1900/],
    [[['Spawn', 'Image', '', ''], ['Spawn', 'Image', '', '']], /rows 2 and 3 both describe "Spawn"/],
  ])('rejects bad rows (%#)', (body, message) => {
    expect(() => transformSeriesSheet(rows(...body), names)).toThrow(message);
  });

  it('describes series-only syncs in the commit message', () => {
    expect(seriesCommitMessage(12)).toBe('data: sync series details from sheet (12 series)');
  });
});

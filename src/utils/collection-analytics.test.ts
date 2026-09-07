import { describe, expect, it } from 'vitest';
import { getSeriesPerformance } from './collection-analytics';
import data from '../data/comics.json';
import type { Comic } from '../types/Comic';

describe('series returns', () => {
  it('keeps the full market value but excludes unknown costs from gains', () => {
    const base = data[0] as Comic;
    const [series] = getSeriesPerformance([
      { ...base, purchasePrice: 10, currentValue: 15 },
      { ...base, purchasePrice: undefined, currentValue: 500 },
    ]);
    expect(series.currentValue).toBe(515);
    expect(series.gainLoss).toBe(5);
    expect(series.gainLossPercentage).toBe(50);
    expect(series.countWithKnownReturn).toBe(1);
  });
});

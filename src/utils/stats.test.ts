import { describe, expect, it } from 'vitest';
import type { Comic } from '../types/Comic';
import { calculateComicStats } from './stats';

const baseComic: Comic = {
  id: 'comic-1',
  title: 'Issue A',
  seriesName: 'Series',
  issueNumber: 1,
  releaseDate: '2024-01-01',
  coverImageUrl: 'https://covers.banast.as/a.jpg',
  coverArtist: '',
  grade: 9.4,
  purchasePrice: 10,
  purchaseDate: '2024-01-02',
  currentValue: 25,
  notes: '',
  signedBy: '',
  storageLocation: 'Archive #1',
  tags: [],
  isSlabbed: false,
  isVariant: false,
  isGraphicNovel: false,
  createdAt: '2024-01-02T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
};

describe('calculateComicStats', () => {
  it('keeps current value and purchase value separate for UI, SEO, and API consumers', () => {
    const comics: Comic[] = [
      baseComic,
      {
        ...baseComic,
        id: 'comic-2',
        issueNumber: 2,
        purchasePrice: 20,
        currentValue: 5,
        isSlabbed: true,
      },
    ];

    const stats = calculateComicStats(comics);

    expect(stats.totalValue).toBe(30);
    expect(stats.totalCurrentValue).toBe(30);
    expect(stats.totalPurchaseValue).toBe(30);
    expect(stats.totalGainLoss).toBe(0);
    expect(stats.rawComics).toBe(1);
    expect(stats.slabbedComics).toBe(1);
  });

  it('only calculates gain/loss against comics with current values', () => {
    const stats = calculateComicStats([
      baseComic,
      {
        ...baseComic,
        id: 'comic-2',
        issueNumber: 2,
        purchasePrice: 100,
        currentValue: undefined,
      },
    ]);

    expect(stats.totalPurchaseValue).toBe(110);
    expect(stats.totalCurrentValue).toBe(25);
    expect(stats.totalGainLoss).toBe(15);
    expect(stats.totalGainLossPercentage).toBe(150);
  });
});

describe('known purchase costs and explicit zero values', () => {
  it('excludes unknown purchase costs from returns and biggest gains', () => {
    const stats = calculateComicStats([baseComic, { ...baseComic, id: 'unknown', currentValue: 450, purchasePrice: undefined }]);
    expect(stats.totalCurrentValue).toBe(475);
    expect(stats.totalGainLoss).toBe(15);
    expect(stats.totalGainLossPercentage).toBe(150);
    expect(stats.comicsWithKnownReturn).toBe(1);
    expect(stats.biggestGainer?.id).toBe(baseComic.id);
  });
  it('does not replace a zero current value with the purchase price', () => {
    const stats = calculateComicStats([{ ...baseComic, currentValue: 0 }, { ...baseComic, id: 'valued', currentValue: 5, purchasePrice: 1 }]);
    expect(stats.highestValuedComic?.id).toBe('valued');
    expect(stats.totalGainLoss).toBe(-6);
  });
  it('does not call a loss a biggest gain', () => {
    expect(calculateComicStats([{ ...baseComic, currentValue: 1 }]).biggestGainer).toBeNull();
  });
  it('accepts an explicitly recorded free purchase', () => {
    const stats = calculateComicStats([{ ...baseComic, purchasePrice: 0 }]);
    expect(stats.totalGainLoss).toBe(25);
    expect(stats.comicsWithKnownReturn).toBe(1);
  });
});

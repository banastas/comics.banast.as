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

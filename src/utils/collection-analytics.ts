import type { Comic } from '../types/Comic';

export interface SeriesPerformance {
  name: string;
  count: number;
  countWithValue: number;
  purchaseValue: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
}

export interface SeriesCountSummary {
  name: string;
  count: number;
  value: number;
}

export interface StorageLocationSummary {
  name: string;
  count: number;
  value: number;
}

export const getTopValueComics = (comics: Comic[], limit: number): Comic[] => {
  return [...comics]
    .filter((comic) => comic.currentValue !== undefined)
    .sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0))
    .slice(0, limit);
};

export const getSeriesPerformance = (comics: Comic[]): SeriesPerformance[] => {
  const summaries = new Map<string, SeriesPerformance>();

  comics.forEach((comic) => {
    const summary = summaries.get(comic.seriesName) || {
      name: comic.seriesName,
      count: 0,
      countWithValue: 0,
      purchaseValue: 0,
      currentValue: 0,
      gainLoss: 0,
      gainLossPercentage: 0,
    };

    summary.count += 1;

    if (comic.currentValue !== undefined) {
      summary.countWithValue += 1;
      summary.purchaseValue += comic.purchasePrice || 0;
      summary.currentValue += comic.currentValue;
    }

    summaries.set(comic.seriesName, summary);
  });

  return Array.from(summaries.values())
    .map((summary) => {
      const gainLoss = summary.currentValue - summary.purchaseValue;
      const gainLossPercentage = summary.purchaseValue > 0 ? (gainLoss / summary.purchaseValue) * 100 : 0;
      return { ...summary, gainLoss, gainLossPercentage };
    })
    .filter((summary) => summary.countWithValue > 0)
    .sort((a, b) => Math.abs(b.gainLossPercentage) - Math.abs(a.gainLossPercentage));
};

export const getSeriesCountSummaries = (comics: Comic[]): SeriesCountSummary[] => {
  const summaries = new Map<string, SeriesCountSummary>();

  comics.forEach((comic) => {
    const summary = summaries.get(comic.seriesName) || {
      name: comic.seriesName,
      count: 0,
      value: 0,
    };
    summary.count += 1;
    summary.value += comic.purchasePrice || 0;
    summaries.set(comic.seriesName, summary);
  });

  return Array.from(summaries.values()).sort((a, b) => b.count - a.count);
};

export const getStorageLocationSummaries = (comics: Comic[]): StorageLocationSummary[] => {
  const summaries = new Map<string, StorageLocationSummary>();

  comics.forEach((comic) => {
    if (!comic.storageLocation) return;

    const summary = summaries.get(comic.storageLocation) || {
      name: comic.storageLocation,
      count: 0,
      value: 0,
    };
    summary.count += 1;
    summary.value += comic.currentValue || comic.purchasePrice || 0;
    summaries.set(comic.storageLocation, summary);
  });

  return Array.from(summaries.values()).sort((a, b) => b.value - a.value);
};

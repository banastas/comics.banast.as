export const plural = (count: number, noun: string): string => `${count.toLocaleString('en-US')} ${noun}${count === 1 ? '' : 's'}`;

export const seriesCountLabel = (count: number, noun: string, seriesCount: number): string =>
  `${plural(count, noun)}${seriesCount > 0 ? ` · ${seriesCount.toLocaleString('en-US')} series` : ''}`;

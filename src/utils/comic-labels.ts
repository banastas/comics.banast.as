import type { Comic } from '../types/Comic';
import { formatComicLabel, formatCurrency } from './formatting';

export const comicAccessibleName = (comic: Comic): string => {
  const value = comic.currentValue ?? comic.purchasePrice;
  return `${formatComicLabel(comic)}, grade ${comic.grade}, ${value === undefined ? 'no value recorded' : `value ${formatCurrency(value)}`}`;
};

export const coverAltText = (comic: Pick<Comic, 'seriesName' | 'issueNumber' | 'coverArtist' | 'isVariant'>): string =>
  `${comic.seriesName} #${comic.issueNumber} cover${comic.coverArtist ? ` by ${comic.coverArtist}` : ''}${comic.isVariant ? ' (variant)' : ''}`;

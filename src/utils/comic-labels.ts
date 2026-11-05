import type { Comic } from '../types/Comic';
import { formatComicLabel, formatCurrency } from './formatting';
import { issueText } from './comic-slug';

export const comicAccessibleName = (comic: Comic): string => {
  const value = comic.currentValue ?? comic.purchasePrice;
  return `${formatComicLabel(comic)}, grade ${comic.grade}, ${value === undefined ? 'no value recorded' : `value ${formatCurrency(value)}`}`;
};

export const coverAltText = (comic: Pick<Comic, 'seriesName' | 'issueNumber' | 'issueLabel' | 'coverArtist' | 'isVariant'>): string =>
  `${comic.seriesName} ${issueText(comic)} cover${comic.coverArtist ? ` by ${comic.coverArtist}` : ''}${comic.isVariant ? ' (variant)' : ''}`;

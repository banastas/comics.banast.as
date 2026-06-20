import { Comic } from '../types/Comic';

export type DetailSortField = 'series' | 'issue' | 'grade' | 'value' | 'date' | 'dateDesc' | 'dateAsc';

const releaseDateTimestamp = (comic: Comic): number => new Date(comic.releaseDate).getTime();

export const sortComics = (comics: Comic[], sortBy: DetailSortField): Comic[] => {
  return [...comics].sort((a, b) => {
    switch (sortBy) {
      case 'series': {
        const seriesCompare = a.seriesName.localeCompare(b.seriesName);
        return seriesCompare !== 0 ? seriesCompare : a.issueNumber - b.issueNumber;
      }
      case 'issue':
        return a.issueNumber - b.issueNumber;
      case 'grade':
        return b.grade - a.grade;
      case 'value': {
        const aValue = a.currentValue || a.purchasePrice || 0;
        const bValue = b.currentValue || b.purchasePrice || 0;
        return bValue - aValue;
      }
      case 'dateAsc':
        return releaseDateTimestamp(a) - releaseDateTimestamp(b);
      case 'dateDesc':
      case 'date':
        return releaseDateTimestamp(b) - releaseDateTimestamp(a);
      default:
        return a.seriesName.localeCompare(b.seriesName);
    }
  });
};

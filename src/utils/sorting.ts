import { Comic } from '../types/Comic';

export type DetailSortField = 'series' | 'issue' | 'grade' | 'value' | 'date';

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
      case 'date':
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      default:
        return a.seriesName.localeCompare(b.seriesName);
    }
  });
};

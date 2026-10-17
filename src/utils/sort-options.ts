import type { SortField } from '../types/Comic';

export const sortFieldOptions: { value: SortField; label: string }[] = [
  { value: 'releaseDate', label: 'Release Date' },
  { value: 'title', label: 'Title' },
  { value: 'seriesName', label: 'Series' },
  { value: 'issueNumber', label: 'Issue #' },
  { value: 'grade', label: 'Grade' },
  { value: 'currentValue', label: 'Current Value' },
  { value: 'purchasePrice', label: 'Purchase Price' },
  { value: 'purchaseDate', label: 'Purchase Date' },
];

import { useMemo } from 'react';
import { Comic, SortField, SortDirection, FilterOptions } from '../types/Comic';

export const useComicFilters = (
  comics: Comic[],
  filters: FilterOptions,
  sortField: SortField,
  sortDirection: SortDirection
) => {
  const filteredAndSortedComics = useMemo(() => {
    let filtered = [...comics];

    // Apply filters
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(comic =>
        comic.title.toLowerCase().includes(searchLower) ||
        comic.seriesName.toLowerCase().includes(searchLower) ||
        comic.notes.toLowerCase().includes(searchLower) ||
        comic.signedBy.toLowerCase().includes(searchLower) ||
        comic.coverArtist.toLowerCase().includes(searchLower)
      );
    }

    if (filters.seriesName) {
      filtered = filtered.filter(comic => 
        comic.seriesName.toLowerCase().includes(filters.seriesName.toLowerCase())
      );
    }

    filtered = filtered.filter(comic => 
      comic.grade >= filters.minGrade && comic.grade <= filters.maxGrade
    );

    filtered = filtered.filter(comic => 
      comic.purchasePrice >= filters.minPrice && comic.purchasePrice <= filters.maxPrice
    );

    if (filters.isSlabbed !== null) {
      filtered = filtered.filter(comic => comic.isSlabbed === filters.isSlabbed);
    }

    if (filters.isSigned !== null) {
      filtered = filtered.filter(comic => 
        filters.isSigned ? comic.signedBy.trim() !== '' : comic.signedBy.trim() === ''
      );
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(comic =>
        filters.tags.some(tag => comic.tags.includes(tag))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number | undefined;
      let bValue: string | number | undefined;
      
      // Handle currentValue sorting specially since it might be undefined
      if (sortField === 'currentValue') {
        aValue = a.currentValue || a.purchasePrice;
        bValue = b.currentValue || b.purchasePrice;
      } else {
        aValue = a[sortField as keyof Comic] as string | number | undefined;
        bValue = b[sortField as keyof Comic] as string | number | undefined;
      }
      
      let comparison = 0;
      
      // Special handling for title sorting - also sort by issue number
      if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
        if (comparison === 0) {
          // If titles are the same, sort by issue number
          comparison = a.issueNumber - b.issueNumber;
        }
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [comics, filters, sortField, sortDirection]);

  return filteredAndSortedComics;
};

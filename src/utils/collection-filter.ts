import type { Comic, FilterOptions, SortDirection, SortField } from '../types/Comic';

// Collection search, filters and sorting, shared by the collection island and its tests.

export const defaultFilters: FilterOptions = {
  searchTerm: '',
  seriesName: '',
  minGrade: 0.5,
  maxGrade: 10.0,
  minPrice: 0,
  maxPrice: 10000,
  isSlabbed: null,
  isSigned: null,
  tags: [],
};

export const matchesSearch = (comic: Comic, searchTerm: string): boolean => {
  const searchLower = searchTerm.trim().toLowerCase();
  if (!searchLower) return true;
  return `${comic.seriesName} #${comic.issueNumber}`.toLowerCase().includes(searchLower) ||
    comic.title.toLowerCase().includes(searchLower) ||
    comic.notes.toLowerCase().includes(searchLower) ||
    comic.signedBy.toLowerCase().includes(searchLower) ||
    comic.coverArtist.toLowerCase().includes(searchLower) ||
    comic.storageLocation.toLowerCase() === searchLower;
};

// Applies search and filters, then sorts.
export const applyFilters = (
  comics: Comic[],
  filters: FilterOptions,
  sortField: SortField,
  sortDirection: SortDirection,
  activeComputedTag?: string | null,
  computedTagsMap?: Map<string, string[]>,
): Comic[] => {
  let filtered = [...comics];

  // Apply search filter
  if (filters.searchTerm && filters.searchTerm.trim() !== '') {
    filtered = filtered.filter(comic => matchesSearch(comic, filters.searchTerm));
  }

  // Apply series filter
  if (filters.seriesName) {
    filtered = filtered.filter(comic => 
      comic.seriesName.toLowerCase().includes(filters.seriesName.toLowerCase())
    );
  }

  // Apply grade filter
  filtered = filtered.filter(comic => 
    comic.grade >= filters.minGrade && comic.grade <= filters.maxGrade
  );

  // Apply price filter
  filtered = filtered.filter(comic => {
    const price = comic.purchasePrice || 0;
    return price >= filters.minPrice && price <= filters.maxPrice;
  });

  // Apply slabbed filter
  if (filters.isSlabbed !== null) {
    filtered = filtered.filter(comic => comic.isSlabbed === filters.isSlabbed);
  }

  // Apply signed filter
  if (filters.isSigned !== null) {
    filtered = filtered.filter(comic => 
      filters.isSigned ? comic.signedBy.trim() !== '' : comic.signedBy.trim() === ''
    );
  }

  // Apply tags filter
  if (filters.tags.length > 0) {
    filtered = filtered.filter(comic =>
      filters.tags.some(tag => comic.tags.includes(tag))
    );
  }

  // Apply computed tag filter
  if (activeComputedTag && computedTagsMap) {
    filtered = filtered.filter(comic => {
      const tags = computedTagsMap.get(comic.id) || [];
      return tags.includes(activeComputedTag);
    });
  }

  return sortCollection(filtered, sortField, sortDirection);
};

type SortKey = string | number | null;

const getSortKey = (comic: Comic, sortField: SortField): SortKey => {
  const value = comic[sortField];
  if (value === undefined || value === null || value === '') return null;
  if (sortField === 'issueNumber') return Number(value);
  if (sortField === 'releaseDate' || sortField === 'purchaseDate') {
    const time = new Date(value as string).getTime();
    return Number.isNaN(time) ? null : time;
  }
  if (typeof value === 'number') return Number.isNaN(value) ? null : value;
  return String(value);
};

// Missing values always sort last so a direction change never surfaces unrecorded prices
// or values first. Equal keys fall back to series and issue for a stable, predictable order.
export const sortCollection = (comics: Comic[], sortField: SortField, sortDirection: SortDirection): Comic[] => {
  const direction = sortDirection === 'asc' ? 1 : -1;
  return [...comics].sort((a, b) => {
    const aKey = getSortKey(a, sortField);
    const bKey = getSortKey(b, sortField);
    if (aKey === null || bKey === null) {
      if (aKey !== bKey) return aKey === null ? 1 : -1;
    } else {
      const compared = typeof aKey === 'string' || typeof bKey === 'string'
        ? String(aKey).localeCompare(String(bKey), 'en', { sensitivity: 'base', numeric: true })
        : aKey - bKey;
      if (compared !== 0) return compared * direction;
    }
    return a.seriesName.localeCompare(b.seriesName, 'en', { sensitivity: 'base' })
      || a.issueNumber - b.issueNumber
      || Number(a.isVariant) - Number(b.isVariant)
      || a.id.localeCompare(b.id, 'en', { numeric: true });
  });
};

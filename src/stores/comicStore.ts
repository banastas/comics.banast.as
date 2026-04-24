import { create } from 'zustand';
import type { Comic, ComicStats, SortField, SortDirection, FilterOptions } from '../types/Comic';
import { calculateComicStats } from '../utils/stats';
import { computeTagData } from '../utils/computed-tags';
import { parseComics } from '../validation/comic-schema';

// Helper function to apply filters and sorting
const applyFilters = (
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
    const searchLower = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(comic =>
      comic.title.toLowerCase().includes(searchLower) ||
      comic.seriesName.toLowerCase().includes(searchLower) ||
      comic.notes.toLowerCase().includes(searchLower) ||
      comic.signedBy.toLowerCase().includes(searchLower) ||
      comic.coverArtist.toLowerCase().includes(searchLower)
    );
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

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue: string | number = a[sortField] as string | number;
    let bValue: string | number = b[sortField] as string | number;

    // Handle special cases for sorting
    if (sortField === 'issueNumber') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    } else if (sortField === 'releaseDate' || sortField === 'purchaseDate') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = typeof bValue === 'string' ? bValue.toLowerCase() : bValue;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return filtered;
};

// Helper to compute derived data from comics array
const computeDerivedData = (comics: Comic[]) => {
  const tagData = computeTagData(comics);

  return {
    stats: calculateComicStats(comics),
    allSeries: Array.from(new Set(comics.map(c => c.seriesName))).sort(),
    allVirtualBoxes: Array.from(new Set(comics.map(c => c.storageLocation).filter(Boolean))).sort(),
    variantsCount: comics.filter(c => c.isVariant).length,
    ...tagData,
  };
};

interface ComicStore {
  // State
  comics: Comic[];
  filteredComics: Comic[];
  filters: FilterOptions;
  sortField: SortField;
  sortDirection: SortDirection;
  loading: boolean;

  // Cached computed values (updated when comics change)
  stats: ComicStats;
  allSeries: string[];
  allVirtualBoxes: string[];
  variantsCount: number;
  computedTagsMap: Map<string, string[]>;
  allComputedTags: string[];
  computedTagCounts: Map<string, number>;

  activeComputedTag: string | null;

  // Actions
  setComics: (comics: Comic[]) => void;
  setFilteredComics: (comics: Comic[]) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  setSortField: (field: SortField) => void;
  setSortDirection: (direction: SortDirection) => void;
  setLoading: (loading: boolean) => void;

  setActiveComputedTag: (tag: string | null) => void;
  getComputedTags: (comicId: string) => string[];

  // Comic Actions
  addComic: (comic: Omit<Comic, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateComic: (id: string, updates: Partial<Comic>) => void;
  deleteComic: (id: string) => void;
}

const defaultFilters: FilterOptions = {
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

export const useComicStore = create<ComicStore>((set, get) => {
  // Initialize store with empty data — comics.json is fetched asynchronously
  // in a separate chunk so the app shell can render immediately
  const initialComics: Comic[] = [];
  const initialFilteredComics = applyFilters(initialComics, defaultFilters, 'releaseDate', 'desc');
  const initialDerived = computeDerivedData(initialComics);

  // Kick off async load; updates store when ready
  import('../data/comics.json')
    .then((mod) => {
      const data = parseComics(mod.default ?? mod);
      const derived = computeDerivedData(data);
      const filtered = applyFilters(data, defaultFilters, 'releaseDate', 'desc');
      set({ comics: data, filteredComics: filtered, ...derived, loading: false });
    })
    .catch((err) => {
      if (err instanceof Error) {
        console.error('Failed to load comics data', err.message);
      }
      set({ loading: false });
    });

  return {
    // Initial State
    comics: initialComics,
    filteredComics: initialFilteredComics,
    filters: defaultFilters,
    sortField: 'releaseDate',
    sortDirection: 'desc',
    loading: true,

    // Cached computed values
    ...initialDerived,
    activeComputedTag: null,
  
  // Actions
  setComics: (comics) => set((state) => {
    const derived = computeDerivedData(comics);
    const filteredComics = applyFilters(comics, state.filters, state.sortField, state.sortDirection, state.activeComputedTag, derived.computedTagsMap);
    return { comics, filteredComics, ...derived };
  }),
  setFilteredComics: (comics) => set({ filteredComics: comics }),
  setFilters: (filters) => set((state) => {
    const newFilters = { ...state.filters, ...filters };
    const filteredComics = applyFilters(state.comics, newFilters, state.sortField, state.sortDirection, state.activeComputedTag, state.computedTagsMap);
    return {
      filters: newFilters,
      filteredComics
    };
  }),
  setSortField: (sortField) => set((state) => {
    const filteredComics = applyFilters(state.comics, state.filters, sortField, state.sortDirection, state.activeComputedTag, state.computedTagsMap);
    return { sortField, filteredComics };
  }),
  setSortDirection: (sortDirection) => set((state) => {
    const filteredComics = applyFilters(state.comics, state.filters, state.sortField, sortDirection, state.activeComputedTag, state.computedTagsMap);
    return { sortDirection, filteredComics };
  }),
  setLoading: (loading) => set({ loading }),
  setActiveComputedTag: (activeComputedTag) => set((state) => {
    const filteredComics = applyFilters(state.comics, state.filters, state.sortField, state.sortDirection, activeComputedTag, state.computedTagsMap);
    return { activeComputedTag, filteredComics };
  }),
  getComputedTags: (comicId) => get().computedTagsMap.get(comicId) || [],
  
  // Comic Actions
  addComic: (comicData) => {
    const newComic: Comic = {
      ...comicData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => {
      const updatedComics = [...state.comics, newComic];
      const derived = computeDerivedData(updatedComics);
      const filteredComics = applyFilters(updatedComics, state.filters, state.sortField, state.sortDirection, state.activeComputedTag, derived.computedTagsMap);
      return {
        comics: updatedComics,
        filteredComics,
        ...derived,
      };
    });
  },

  updateComic: (id, updates) => {
    set((state) => {
      const updatedComics = state.comics.map(comic =>
        comic.id === id
          ? { ...comic, ...updates, updatedAt: new Date().toISOString() }
          : comic
      );
      const derived = computeDerivedData(updatedComics);
      const filteredComics = applyFilters(updatedComics, state.filters, state.sortField, state.sortDirection, state.activeComputedTag, derived.computedTagsMap);
      return {
        comics: updatedComics,
        filteredComics,
        ...derived,
      };
    });
  },

  deleteComic: (id) => {
    set((state) => {
      const updatedComics = state.comics.filter(comic => comic.id !== id);
      const derived = computeDerivedData(updatedComics);
      const filteredComics = applyFilters(updatedComics, state.filters, state.sortField, state.sortDirection, state.activeComputedTag, derived.computedTagsMap);
      return {
        comics: updatedComics,
        filteredComics,
        ...derived,
      };
    });
  },
  };
});

// Store is now initialized immediately with data on creation

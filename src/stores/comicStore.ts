import { create } from 'zustand';
import type { Comic, ComicStats, SortField, SortDirection, FilterOptions } from '../types/Comic';
import { calculateComicStats } from '../utils/stats';
import { computeTagData } from '../utils/computed-tags';
import { parseComics } from '../validation/comic-schema';

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
  loadError: boolean;

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
      const state = get();
      const filtered = applyFilters(data, state.filters, state.sortField, state.sortDirection, state.activeComputedTag, derived.computedTagsMap);
      set({ comics: data, filteredComics: filtered, ...derived, loading: false, loadError: false });
    })
    .catch((err) => {
      if (err instanceof Error) {
        console.error('Failed to load comics data', err.message);
      }
      set({ loading: false, loadError: true });
    });

  return {
    // Initial State
    comics: initialComics,
    filteredComics: initialFilteredComics,
    filters: defaultFilters,
    sortField: 'releaseDate',
    sortDirection: 'desc',
    loading: true,
    loadError: false,

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

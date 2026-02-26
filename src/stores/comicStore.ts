import { create } from 'zustand';
import { Comic, ComicStats, SortField, SortDirection, FilterOptions } from '../types/Comic';
import { calculateComicStats } from '../utils/stats';
import initialComicsData from '../data/comics.json';

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
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    } else if (sortField === 'releaseDate' || sortField === 'purchaseDate') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return filtered;
};

// Compute smart tags for a comic based on its data
const computeTagsForComic = (comic: Comic): string[] => {
  const tags: string[] = [];

  // Decade tags from release date
  const year = new Date(comic.releaseDate).getFullYear();
  if (year >= 1940 && year < 1950) tags.push('Golden Age');
  else if (year >= 1950 && year < 1970) tags.push('Silver Age');
  else if (year >= 1970 && year < 1985) tags.push('Bronze Age');
  else if (year >= 1985 && year < 1992) tags.push('Copper Age');
  else if (year >= 1992 && year < 2000) tags.push('90s');
  else if (year >= 2000 && year < 2010) tags.push('2000s');
  else if (year >= 2010 && year < 2020) tags.push('2010s');
  else if (year >= 2020) tags.push('Modern');

  // Grade-based tags
  if (comic.grade >= 9.8) tags.push('Gem Mint');
  else if (comic.grade >= 9.6) tags.push('High Grade');

  // Key issue tag
  if (comic.issueNumber === 1) tags.push('First Issue');

  // Value-based tags
  if (comic.currentValue && comic.currentValue >= 50) tags.push('High Value');

  // Appreciation/depreciation
  if (comic.currentValue && comic.purchasePrice && comic.purchasePrice > 0) {
    const change = ((comic.currentValue - comic.purchasePrice) / comic.purchasePrice) * 100;
    if (change >= 50) tags.push('Appreciating');
    else if (change <= -20) tags.push('Depreciating');
  }

  // Signed
  if (comic.signedBy && comic.signedBy.trim() !== '') tags.push('Signed');

  return tags;
};

// Helper to compute derived data from comics array
const computeDerivedData = (comics: Comic[]) => {
  // Build computed tags map
  const tagMap = new Map<string, string[]>();
  const tagCounts = new Map<string, number>();
  comics.forEach(c => {
    const computed = computeTagsForComic(c);
    tagMap.set(c.id, computed);
    computed.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  // Sort tags by count descending
  const allComputedTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  return {
    stats: calculateComicStats(comics),
    allSeries: Array.from(new Set(comics.map(c => c.seriesName))).sort(),
    allVirtualBoxes: Array.from(new Set(comics.map(c => c.storageLocation).filter(Boolean))).sort(),
    variantsCount: comics.filter(c => c.isVariant).length,
    computedTagsMap: tagMap,
    allComputedTags,
    computedTagCounts: tagCounts,
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

  // UI State
  showForm: boolean;
  editingComic: Comic | undefined;
  activeTab: 'collection' | 'stats';
  selectedComic: Comic | undefined;
  selectedSeries: string | null;
  selectedStorageLocation: string | null;
  selectedCoverArtist: string | null;
  selectedTag: string | null;
  selectedCondition: 'raw' | 'slabbed' | 'variants' | null;
  viewMode: 'grid' | 'list';
  showVirtualBoxes: boolean;
  activeComputedTag: string | null;

  // Actions
  setComics: (comics: Comic[]) => void;
  setFilteredComics: (comics: Comic[]) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  setSortField: (field: SortField) => void;
  setSortDirection: (direction: SortDirection) => void;
  setLoading: (loading: boolean) => void;

  // UI Actions
  setShowForm: (show: boolean) => void;
  setEditingComic: (comic: Comic | undefined) => void;
  setActiveTab: (tab: 'collection' | 'stats') => void;
  setSelectedComic: (comic: Comic | undefined) => void;
  setSelectedSeries: (series: string | null) => void;
  setSelectedStorageLocation: (location: string | null) => void;
  setSelectedCoverArtist: (artist: string | null) => void;
  setSelectedTag: (tag: string | null) => void;
  setSelectedCondition: (condition: 'raw' | 'slabbed' | 'variants' | null) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setShowVirtualBoxes: (show: boolean) => void;
  setActiveComputedTag: (tag: string | null) => void;
  getComputedTags: (comicId: string) => string[];

  // Comic Actions
  addComic: (comic: Omit<Comic, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateComic: (id: string, updates: Partial<Comic>) => void;
  deleteComic: (id: string) => void;

  // Navigation Actions
  navigateToComic: (comic: Comic) => void;
  navigateToSeries: (seriesName: string) => void;
  navigateToStorageLocation: (location: string) => void;
  navigateToCoverArtist: (artist: string) => void;
  navigateToTag: (tag: string) => void;
  navigateToCondition: (condition: 'raw' | 'slabbed' | 'variants') => void;
  navigateToVirtualBoxes: () => void;
  backToCollection: () => void;
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
  // Initialize store immediately with data
  const initialComics = initialComicsData as Comic[];
  const initialFilteredComics = applyFilters(initialComics, defaultFilters, 'releaseDate', 'desc');
  const initialDerived = computeDerivedData(initialComics);

  return {
    // Initial State
    comics: initialComics,
    filteredComics: initialFilteredComics,
    filters: defaultFilters,
    sortField: 'releaseDate',
    sortDirection: 'desc',
    loading: false,

    // Cached computed values
    ...initialDerived,
  
  // UI State
  showForm: false,
  editingComic: undefined,
  activeTab: 'collection',
  selectedComic: undefined,
  selectedSeries: null,
  selectedStorageLocation: null,
  selectedCoverArtist: null,
  selectedTag: null,
  selectedCondition: null,
  viewMode: 'grid',
  showVirtualBoxes: false,
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
  
  // UI Actions
  setShowForm: (showForm) => set({ showForm }),
  setEditingComic: (editingComic) => set({ editingComic }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedComic: (selectedComic) => set({ selectedComic }),
  setSelectedSeries: (selectedSeries) => set({ selectedSeries }),
  setSelectedStorageLocation: (selectedStorageLocation) => set({ selectedStorageLocation }),
  setSelectedCoverArtist: (selectedCoverArtist) => set({ selectedCoverArtist }),
  setSelectedTag: (selectedTag) => set({ selectedTag }),
  setSelectedCondition: (selectedCondition) => set({ selectedCondition }),
  setViewMode: (viewMode) => set({ viewMode }),
  setShowVirtualBoxes: (showVirtualBoxes) => set({ showVirtualBoxes }),
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
        showForm: false,
        editingComic: undefined
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
        showForm: false,
        editingComic: undefined
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
  
  // Navigation Actions
  navigateToComic: (comic) => set({
    selectedComic: comic,
    selectedSeries: null,
    selectedStorageLocation: null,
    selectedCoverArtist: null,
    selectedTag: null,
    selectedCondition: null,
    showVirtualBoxes: false,
  }),
  
  navigateToSeries: (seriesName) => set({
    selectedSeries: seriesName,
    selectedComic: undefined,
    selectedStorageLocation: null,
    selectedCoverArtist: null,
    selectedTag: null,
    selectedCondition: null,
    showVirtualBoxes: false,
  }),
  
  navigateToStorageLocation: (location) => set({
    selectedStorageLocation: location,
    selectedComic: undefined,
    selectedSeries: null,
    selectedCoverArtist: null,
    selectedTag: null,
    selectedCondition: null,
    showVirtualBoxes: false,
  }),
  
  navigateToCoverArtist: (artist) => set({
    selectedCoverArtist: artist,
    selectedComic: undefined,
    selectedSeries: null,
    selectedStorageLocation: null,
    selectedTag: null,
    selectedCondition: null,
    showVirtualBoxes: false,
  }),
  
  navigateToTag: (tag) => set({
    selectedTag: tag,
    selectedComic: undefined,
    selectedSeries: null,
    selectedStorageLocation: null,
    selectedCoverArtist: null,
    selectedCondition: null,
    showVirtualBoxes: false,
  }),
  
  navigateToCondition: (condition) => set({
    selectedCondition: condition,
    selectedComic: undefined,
    selectedSeries: null,
    selectedStorageLocation: null,
    selectedCoverArtist: null,
    selectedTag: null,
    showVirtualBoxes: false,
  }),
  
  navigateToVirtualBoxes: () => set({
    showVirtualBoxes: true,
    selectedComic: undefined,
    selectedSeries: null,
    selectedStorageLocation: null,
    selectedCoverArtist: null,
    selectedTag: null,
    selectedCondition: null,
  }),
  
  
  backToCollection: () => set({
    selectedComic: undefined,
    selectedSeries: null,
    selectedStorageLocation: null,
    selectedCoverArtist: null,
    selectedTag: null,
    selectedCondition: null,
    showVirtualBoxes: false,
    showForm: false,
    editingComic: undefined
  }),
  
  };
});

// Store is now initialized immediately with data on creation

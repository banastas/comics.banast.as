import { create } from 'zustand';
import { Comic, ComicStats, SortField, SortDirection, FilterOptions } from '../types/Comic';
import initialComicsData from '../data/comics.json';

// Helper function to apply filters and sorting
const applyFilters = (
  comics: Comic[], 
  filters: FilterOptions, 
  sortField: SortField, 
  sortDirection: SortDirection
): Comic[] => {
  let filtered = [...comics];

  // Apply search filter
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
  filtered = filtered.filter(comic => 
    comic.purchasePrice >= filters.minPrice && comic.purchasePrice <= filters.maxPrice
  );

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

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

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

interface ComicStore {
  // State
  comics: Comic[];
  filteredComics: Comic[];
  filters: FilterOptions;
  sortField: SortField;
  sortDirection: SortDirection;
  loading: boolean;
  
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
  showCsvConverter: boolean;
  
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
  setShowCsvConverter: (show: boolean) => void;
  
  // Comic Actions
  addComic: (comic: Omit<Comic, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateComic: (id: string, updates: Partial<Comic>) => void;
  deleteComic: (id: string) => void;
  
  // Computed Properties
  stats: ComicStats;
  allSeries: string[];
  allVirtualBoxes: string[];
  variantsCount: number;
  
  // Navigation Actions
  navigateToComic: (comic: Comic) => void;
  navigateToSeries: (seriesName: string) => void;
  navigateToStorageLocation: (location: string) => void;
  navigateToCoverArtist: (artist: string) => void;
  navigateToTag: (tag: string) => void;
  navigateToCondition: (condition: 'raw' | 'slabbed' | 'variants') => void;
  navigateToVirtualBoxes: () => void;
  navigateToCsvConverter: () => void;
  backToCollection: () => void;
  
  // Computed Values
  stats: ComicStats;
  allSeries: string[];
  allVirtualBoxes: string[];
  variantsCount: number;
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
  
  return {
    // Initial State
    comics: initialComics,
    filteredComics: initialFilteredComics,
    filters: defaultFilters,
    sortField: 'releaseDate',
    sortDirection: 'desc',
    loading: false,
  
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
  showCsvConverter: false,
  
  // Actions
  setComics: (comics) => set((state) => {
    const filteredComics = applyFilters(comics, state.filters, state.sortField, state.sortDirection);
    return { comics, filteredComics };
  }),
  setFilteredComics: (comics) => set({ filteredComics: comics }),
  setFilters: (filters) => set((state) => {
    const newFilters = { ...state.filters, ...filters };
    const filteredComics = applyFilters(state.comics, newFilters, state.sortField, state.sortDirection);
    return { 
      filters: newFilters,
      filteredComics
    };
  }),
  setSortField: (sortField) => set((state) => {
    const filteredComics = applyFilters(state.comics, state.filters, sortField, state.sortDirection);
    return { sortField, filteredComics };
  }),
  setSortDirection: (sortDirection) => set((state) => {
    const filteredComics = applyFilters(state.comics, state.filters, state.sortField, sortDirection);
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
  setShowCsvConverter: (showCsvConverter) => set({ showCsvConverter }),
  
  // Comic Actions
  addComic: (comicData) => {
    const newComic: Comic = {
      ...comicData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ 
      comics: [...state.comics, newComic],
      showForm: false,
      editingComic: undefined
    }));
  },
  
  updateComic: (id, updates) => {
    set((state) => ({
      comics: state.comics.map(comic => 
        comic.id === id 
          ? { ...comic, ...updates, updatedAt: new Date().toISOString() }
          : comic
      ),
      showForm: false,
      editingComic: undefined
    }));
  },
  
  deleteComic: (id) => {
    set((state) => ({
      comics: state.comics.filter(comic => comic.id !== id)
    }));
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
    showCsvConverter: false
  }),
  
  navigateToSeries: (seriesName) => set({
    selectedSeries: seriesName,
    selectedComic: undefined,
    selectedStorageLocation: null,
    selectedCoverArtist: null,
    selectedTag: null,
    selectedCondition: null,
    showVirtualBoxes: false,
    showCsvConverter: false
  }),
  
  navigateToStorageLocation: (location) => set({
    selectedStorageLocation: location,
    selectedComic: undefined,
    selectedSeries: null,
    selectedCoverArtist: null,
    selectedTag: null,
    selectedCondition: null,
    showVirtualBoxes: false,
    showCsvConverter: false
  }),
  
  navigateToCoverArtist: (artist) => set({
    selectedCoverArtist: artist,
    selectedComic: undefined,
    selectedSeries: null,
    selectedStorageLocation: null,
    selectedTag: null,
    selectedCondition: null,
    showVirtualBoxes: false,
    showCsvConverter: false
  }),
  
  navigateToTag: (tag) => set({
    selectedTag: tag,
    selectedComic: undefined,
    selectedSeries: null,
    selectedStorageLocation: null,
    selectedCoverArtist: null,
    selectedCondition: null,
    showVirtualBoxes: false,
    showCsvConverter: false
  }),
  
  navigateToCondition: (condition) => set({
    selectedCondition: condition,
    selectedComic: undefined,
    selectedSeries: null,
    selectedStorageLocation: null,
    selectedCoverArtist: null,
    selectedTag: null,
    showVirtualBoxes: false,
    showCsvConverter: false
  }),
  
  navigateToVirtualBoxes: () => set({
    showVirtualBoxes: true,
    selectedComic: undefined,
    selectedSeries: null,
    selectedStorageLocation: null,
    selectedCoverArtist: null,
    selectedTag: null,
    selectedCondition: null,
    showCsvConverter: false
  }),
  
  navigateToCsvConverter: () => set({
    showCsvConverter: true,
    selectedComic: undefined,
    selectedSeries: null,
    selectedStorageLocation: null,
    selectedCoverArtist: null,
    selectedTag: null,
    selectedCondition: null,
    showVirtualBoxes: false
  }),
  
  backToCollection: () => set({
    selectedComic: undefined,
    selectedSeries: null,
    selectedStorageLocation: null,
    selectedCoverArtist: null,
    selectedTag: null,
    selectedCondition: null,
    showVirtualBoxes: false,
    showCsvConverter: false,
    showForm: false,
    editingComic: undefined
  }),
  
  // Computed Values
  get stats() {
    const state = get();
    const comicsWithCurrentValue = state.comics.filter(comic => comic.currentValue !== undefined);
    const totalPurchaseValue = state.comics.reduce((sum, comic) => sum + (comic.purchasePrice || 0), 0);
    const totalCurrentValue = comicsWithCurrentValue.reduce((sum, comic) => sum + (comic.currentValue || 0), 0);
    const totalGainLoss = totalCurrentValue - comicsWithCurrentValue.reduce((sum, comic) => sum + (comic.purchasePrice || 0), 0);
    const totalGainLossPercentage = comicsWithCurrentValue.length > 0 
      ? (totalGainLoss / comicsWithCurrentValue.reduce((sum, comic) => sum + (comic.purchasePrice || 0), 0)) * 100 
      : 0;

    const biggestGainer = comicsWithCurrentValue.reduce((biggest, comic) => {
      const gain = (comic.currentValue || 0) - (comic.purchasePrice || 0);
      const biggestGain = biggest ? ((biggest.currentValue || 0) - (biggest.purchasePrice || 0)) : -Infinity;
      return gain > biggestGain ? comic : biggest;
    }, null as Comic | null);

    const biggestLoser = comicsWithCurrentValue.reduce((biggest, comic) => {
      const loss = (comic.currentValue || 0) - (comic.purchasePrice || 0);
      const biggestLoss = biggest ? ((biggest.currentValue || 0) - (biggest.purchasePrice || 0)) : Infinity;
      return loss < biggestLoss ? comic : biggest;
    }, null as Comic | null);

    const statsResult = {
      totalComics: state.comics.length,
      totalValue: totalPurchaseValue,
      totalPurchaseValue,
      totalCurrentValue,
      highestValuedComic: state.comics.reduce((highest, comic) => 
        !highest || comic.purchasePrice > highest.purchasePrice ? comic : highest, 
        null as Comic | null
      ),
      highestValuedSlabbedComic: state.comics
        .filter(comic => comic.isSlabbed)
        .reduce((highest, comic) => {
          const comicValue = comic.currentValue || comic.purchasePrice;
          const highestValue = highest ? (highest.currentValue || highest.purchasePrice) : 0;
          return comicValue > highestValue ? comic : highest;
        }, null as Comic | null),
      highestValuedRawComic: state.comics
        .filter(comic => !comic.isSlabbed)
        .reduce((highest, comic) => {
          const comicValue = comic.currentValue || comic.purchasePrice;
          const highestValue = highest ? (highest.currentValue || highest.purchasePrice) : 0;
          return comicValue > highestValue ? comic : highest;
        }, null as Comic | null),
      biggestGainer,
      biggestLoser,
      rawComics: state.comics.filter(comic => !comic.isSlabbed).length,
      slabbedComics: state.comics.filter(comic => comic.isSlabbed).length,
      signedComics: state.comics.filter(comic => comic.signedBy.trim() !== '').length,
      averageGrade: state.comics.length > 0 
        ? state.comics.reduce((sum, comic) => sum + comic.grade, 0) / state.comics.length 
        : 0,
      totalGainLoss,
      totalGainLossPercentage,
      comicsWithCurrentValue: comicsWithCurrentValue.length,
    };
    
    return statsResult;
  },
  
  get allSeries() {
    return Array.from(new Set(get().comics.map(comic => comic.seriesName))).sort();
  },
  
  get allVirtualBoxes() {
    return Array.from(new Set(get().comics.map(comic => comic.storageLocation).filter(Boolean))).sort();
  },
  
  get variantsCount() {
    return get().comics.filter(comic => comic.isVariant).length;
  },
  };
});

// Store is now initialized immediately with data on creation

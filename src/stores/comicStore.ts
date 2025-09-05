import { create } from 'zustand';
import { Comic, ComicStats, SortField, SortDirection, FilterOptions } from '../types/Comic';
import initialComicsData from '../data/comics.json';

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

export const useComicStore = create<ComicStore>((set, get) => ({
  // Initial State
  comics: [],
  filteredComics: [],
  filters: defaultFilters,
  sortField: 'releaseDate',
  sortDirection: 'desc',
  loading: true,
  
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
  setComics: (comics) => set({ comics }),
  setFilteredComics: (comics) => set({ filteredComics: comics }),
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  setSortField: (sortField) => set({ sortField }),
  setSortDirection: (sortDirection) => set({ sortDirection }),
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
    const totalPurchaseValue = state.comics.reduce((sum, comic) => sum + comic.purchasePrice, 0);
    const totalCurrentValue = comicsWithCurrentValue.reduce((sum, comic) => sum + (comic.currentValue || 0), 0);
    const totalGainLoss = totalCurrentValue - comicsWithCurrentValue.reduce((sum, comic) => sum + comic.purchasePrice, 0);
    const totalGainLossPercentage = comicsWithCurrentValue.length > 0 
      ? (totalGainLoss / comicsWithCurrentValue.reduce((sum, comic) => sum + comic.purchasePrice, 0)) * 100 
      : 0;

    const biggestGainer = comicsWithCurrentValue.reduce((biggest, comic) => {
      const gain = (comic.currentValue || 0) - comic.purchasePrice;
      const biggestGain = biggest ? ((biggest.currentValue || 0) - biggest.purchasePrice) : -Infinity;
      return gain > biggestGain ? comic : biggest;
    }, null as Comic | null);

    const biggestLoser = comicsWithCurrentValue.reduce((biggest, comic) => {
      const loss = (comic.currentValue || 0) - comic.purchasePrice;
      const biggestLoss = biggest ? ((biggest.currentValue || 0) - biggest.purchasePrice) : Infinity;
      return loss < biggestLoss ? comic : biggest;
    }, null as Comic | null);

    return {
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
}));

// Initialize store with data
export const initializeStore = () => {
  const store = useComicStore.getState();
  if (store.comics.length === 0) {
    try {
      // Handle both array format and object format with comics property
      const comicsData = Array.isArray(initialComicsData) 
        ? initialComicsData 
        : (initialComicsData as any).comics || [];
      store.setComics(comicsData as Comic[]);
      store.setLoading(false);
    } catch (error) {
      console.error('Error loading comics:', error);
      store.setComics([]);
      store.setLoading(false);
    }
  }
};

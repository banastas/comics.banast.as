import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useComicStore } from './stores/comicStore';
import { useRouting } from './hooks/useRouting';
import { SEO } from './components/SEO';
import type { Comic, SortField } from './types/Comic';
import { BookOpen, BarChart3, Grid, List, SortAsc, SortDesc, Search, SlidersHorizontal, X } from 'lucide-react';
import { createComicSlug } from './utils/routing';
import { debounce } from './utils/performance';
import type { BreadcrumbItem } from './components/Breadcrumb';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MobileControls } from './components/MobileControls';
import { ToastContainer } from './components/Toast';
import { getSeriesCountSummaries, getSeriesPerformance, getStorageLocationSummaries, getTopValueComics } from './utils/collection-analytics';
import { generateCollectionStructuredData } from './utils/structured-data';
import { AppRouteRenderer } from './components/AppRouteRenderer';
import { CollectionLoading, LoadingSpinner } from './components/AppLoading';
import { ComicForm } from './components/lazyRoutes';
import { CollectionTab } from './components/CollectionTab';
import { StatsTab } from './components/StatsTab';

function App() {
  const allComics = useComicStore((s) => s.comics);
  const filteredComics = useComicStore((s) => s.filteredComics);
  const stats = useComicStore((s) => s.stats);
  const filters = useComicStore((s) => s.filters);
  const sortField = useComicStore((s) => s.sortField);
  const sortDirection = useComicStore((s) => s.sortDirection);
  const loading = useComicStore((s) => s.loading);
  const addComic = useComicStore((s) => s.addComic);
  const updateComic = useComicStore((s) => s.updateComic);
  const setFilters = useComicStore((s) => s.setFilters);
  const setSortField = useComicStore((s) => s.setSortField);
  const setSortDirection = useComicStore((s) => s.setSortDirection);
  const allSeries = useComicStore((s) => s.allSeries);
  const allVirtualBoxes = useComicStore((s) => s.allVirtualBoxes);
  const variantsCount = useComicStore((s) => s.variantsCount);
  const allComputedTags = useComicStore((s) => s.allComputedTags);
  const computedTagCounts = useComicStore((s) => s.computedTagCounts);
  const computedTagsMap = useComicStore((s) => s.computedTagsMap);
  const activeComputedTag = useComicStore((s) => s.activeComputedTag);
  const setActiveComputedTag = useComicStore((s) => s.setActiveComputedTag);

  const [showForm, setShowForm] = useState(false);
  const [editingComic, setEditingComic] = useState<Comic | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'collection' | 'stats'>('collection');
  const [selectedComic, setSelectedComic] = useState<Comic | undefined>(undefined);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [selectedStorageLocation, setSelectedStorageLocation] = useState<string | null>(null);
  const [selectedCoverArtist, setSelectedCoverArtist] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<'raw' | 'slabbed' | 'variants' | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showVirtualBoxes, setShowVirtualBoxes] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    if (typeof window === 'undefined') return 48;
    const stored = window.localStorage.getItem('comics:itemsPerPage');
    const parsed = stored ? Number.parseInt(stored, 10) : NaN;
    return [48, 96, 192].includes(parsed) ? parsed : 48;
  });
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAllSeriesPerf, setShowAllSeriesPerf] = useState(false);
  const [showAllSeriesCount, setShowAllSeriesCount] = useState(false);

  // URL routing
  const { navigateToRoute } = useRouting({
    activeTab,
    viewMode,
    searchTerm: filters.searchTerm,
    sortField,
    sortDirection,
    setActiveTab,
    setSelectedComic,
    setSelectedSeries,
    setSelectedStorageLocation,
    setSelectedCoverArtist,
    setSelectedTag,
    setSelectedCondition,
    setShowVirtualBoxes,
    setViewMode,
    setFilters,
    setSortField,
    setSortDirection,
    setActiveComputedTag,
    allComics,
  });

  // Sticky header scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Refs for stable debounce closure
  const searchContextRef = useRef({ activeTab, viewMode, sortField, sortDirection, navigateToRoute });
  searchContextRef.current = { activeTab, viewMode, sortField, sortDirection, navigateToRoute };

  // Debounced search function — stable across renders
  const debouncedSetFilters = useMemo(
    () => debounce((searchTerm: string) => {
      const { activeTab: tab, viewMode: vm, sortField: sf, sortDirection: sd, navigateToRoute: nav } = searchContextRef.current;
      setFilters({ searchTerm });
      nav(tab === 'stats' ? 'stats' : 'collection', undefined, {
        tab, viewMode: vm, searchTerm, sortField: sf, sortDirection: sd
      });
    }, 300),
    [setFilters]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value === '') {
      debouncedSetFilters.cancel();
      setFilters({ searchTerm: '' });
      const { activeTab: tab, viewMode: vm, sortField: sf, sortDirection: sd, navigateToRoute: nav } = searchContextRef.current;
      nav(tab === 'stats' ? 'stats' : 'collection', undefined, {
        tab, viewMode: vm, searchTerm: '', sortField: sf, sortDirection: sd
      });
    } else {
      debouncedSetFilters(value);
    }
  }, [debouncedSetFilters, setFilters]);

  const clearSearch = useCallback(() => {
    debouncedSetFilters.cancel();
    setSearchInput('');
    setFilters({ searchTerm: '' });
    setShowMobileSearch(false);
    const { activeTab: tab, viewMode: vm, sortField: sf, sortDirection: sd, navigateToRoute: nav } = searchContextRef.current;
    nav(tab === 'stats' ? 'stats' : 'collection', undefined, {
      tab, viewMode: vm, searchTerm: '', sortField: sf, sortDirection: sd
    });
  }, [debouncedSetFilters, setFilters]);

  useEffect(() => { setSearchInput(filters.searchTerm); }, [filters.searchTerm]);
  useEffect(() => { setCurrentPage(0); }, [filters.searchTerm, filters.seriesName, filters.minGrade, filters.maxGrade, filters.minPrice, filters.maxPrice, filters.isSlabbed, filters.isSigned, sortField, sortDirection, activeComputedTag]);

  // Pagination
  const totalPages = Math.ceil(filteredComics.length / itemsPerPage);
  const paginatedComics = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return filteredComics.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredComics, currentPage, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(0);
    try { window.localStorage.setItem('comics:itemsPerPage', String(newItemsPerPage)); } catch { /* ignore quota/privacy errors */ }
  }, []);

  const handleSaveComic = (comicData: Omit<Comic, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingComic) {
      updateComic(editingComic.id, comicData);
    } else {
      addComic(comicData);
    }
    setShowForm(false);
    setEditingComic(undefined);
  };

  // Navigation handlers
  const handleViewComic = (comic: Comic) => {
    setSelectedComic(comic);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setSelectedCondition(null);
    setShowVirtualBoxes(false);
    const slug = createComicSlug(comic);
    navigateToRoute('comic', slug, { tab: activeTab });
  };

  const handleBackToCollection = () => {
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setSelectedCondition(null);
    setShowVirtualBoxes(false);
    navigateToRoute('collection', undefined, { tab: activeTab, viewMode, searchTerm: filters.searchTerm, sortField, sortDirection });
  };

  const handleViewSeries = (seriesName: string) => {
    setSelectedSeries(seriesName);
    setSelectedComic(undefined);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setSelectedCondition(null);
    setShowVirtualBoxes(false);
    navigateToRoute('series', seriesName, { tab: activeTab });
  };

  const handleViewStorageLocation = (storageLocation: string) => {
    setSelectedStorageLocation(storageLocation);
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setSelectedCondition(null);
    setShowVirtualBoxes(false);
    navigateToRoute('storage', storageLocation, { tab: activeTab });
  };

  const handleViewCoverArtist = (coverArtist: string) => {
    setSelectedCoverArtist(coverArtist);
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedTag(null);
    setSelectedCondition(null);
    setShowVirtualBoxes(false);
    navigateToRoute('artist', coverArtist, { tab: activeTab });
  };

  const handleViewTag = (tag: string) => {
    setSelectedTag(tag);
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedCondition(null);
    setShowVirtualBoxes(false);
    navigateToRoute('tag', tag, { tab: activeTab });
  };

  const handleViewRawComics = () => {
    setSelectedCondition('raw');
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setShowVirtualBoxes(false);
    navigateToRoute('raw', undefined, { tab: activeTab, viewMode, searchTerm: filters.searchTerm, sortField, sortDirection });
  };

  const handleViewSlabbedComics = () => {
    setSelectedCondition('slabbed');
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setShowVirtualBoxes(false);
    navigateToRoute('slabbed', undefined, { tab: activeTab, viewMode, searchTerm: filters.searchTerm, sortField, sortDirection });
  };

  const handleViewVariants = () => {
    setSelectedCondition('variants');
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setShowVirtualBoxes(false);
    navigateToRoute('variants', undefined, { tab: activeTab, viewMode, searchTerm: filters.searchTerm, sortField, sortDirection });
  };

  const handleViewVirtualBoxes = () => {
    setShowVirtualBoxes(true);
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setSelectedCondition(null);
    navigateToRoute('boxes', undefined, { tab: activeTab });
  };

  // Mobile sort/view handlers for bottom sheet
  const handleMobileSortFieldChange = (field: SortField) => {
    setSortField(field);
    navigateToRoute(activeTab === 'stats' ? 'stats' : 'collection', undefined, {
      tab: activeTab, viewMode, searchTerm: filters.searchTerm, sortField: field, sortDirection
    });
  };

  const handleMobileViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    navigateToRoute(activeTab === 'stats' ? 'stats' : 'collection', undefined, {
      tab: activeTab, viewMode: mode, searchTerm: filters.searchTerm, sortField, sortDirection
    });
  };

  const handleMobileSortDirectionChange = () => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);
    navigateToRoute(activeTab === 'stats' ? 'stats' : 'collection', undefined, {
      tab: activeTab, viewMode, searchTerm: filters.searchTerm, sortField, sortDirection: newDirection
    });
  };

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = (() => {
    const items: BreadcrumbItem[] = [{ label: 'Collection', onClick: handleBackToCollection }];
    if (selectedCondition === 'raw') items.push({ label: 'Raw Comics' });
    else if (selectedCondition === 'slabbed') items.push({ label: 'Slabbed Comics' });
    else if (selectedCondition === 'variants') items.push({ label: 'Variants' });
    else if (showVirtualBoxes) items.push({ label: 'Virtual Boxes' });
    else if (selectedSeries) items.push({ label: selectedSeries });
    else if (selectedStorageLocation) items.push({ label: selectedStorageLocation });
    else if (selectedCoverArtist) items.push({ label: selectedCoverArtist });
    else if (selectedTag) items.push({ label: selectedTag });
    else if (selectedComic) {
      if (selectedComic.seriesName) {
        items.push({ label: selectedComic.seriesName, onClick: () => handleViewSeries(selectedComic.seriesName) });
      }
      items.push({ label: `#${selectedComic.issueNumber}` });
    }
    return items;
  })();

  // Top 10 most valuable comics
  const top10Comics = useMemo(() => {
    return getTopValueComics(allComics, 10);
  }, [allComics]);
  const seriesPerformance = useMemo(() => getSeriesPerformance(allComics), [allComics]);
  const valuedSeriesCount = seriesPerformance.length;
  const seriesCountSummaries = useMemo(() => getSeriesCountSummaries(allComics), [allComics]);
  const storageLocationSummaries = useMemo(() => getStorageLocationSummaries(allComics), [allComics]);
  const collectionPageUrl = activeTab === 'stats' ? 'https://comics.banast.as/stats' : 'https://comics.banast.as/';

  if (loading) {
    return <CollectionLoading />;
  }

  const hasSelectedRoute = Boolean(
    showVirtualBoxes ||
    selectedComic ||
    selectedSeries ||
    selectedStorageLocation ||
    selectedCoverArtist ||
    selectedTag ||
    selectedCondition
  );

  if (hasSelectedRoute) {
    return (
      <AppRouteRenderer
        allComics={allComics}
        computedTagsMap={computedTagsMap}
        selectedComic={selectedComic}
        selectedSeries={selectedSeries}
        selectedStorageLocation={selectedStorageLocation}
        selectedCoverArtist={selectedCoverArtist}
        selectedTag={selectedTag}
        selectedCondition={selectedCondition}
        showVirtualBoxes={showVirtualBoxes}
        breadcrumbItems={breadcrumbItems}
        onBack={handleBackToCollection}
        onViewComic={handleViewComic}
        onViewSeries={handleViewSeries}
        onViewStorageLocation={handleViewStorageLocation}
        onViewCoverArtist={handleViewCoverArtist}
        onViewTag={handleViewTag}
        onViewRawComics={handleViewRawComics}
        onViewSlabbedComics={handleViewSlabbedComics}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface-base">
      <SEO
        title={activeTab === 'stats' ? 'Collection Statistics' : 'My Collection'}
        description={`View and manage your comic book collection. ${stats.totalComics} comics across ${allSeries.length} series, total value: $${stats.totalValue.toFixed(0)}`}
        url={collectionPageUrl}
        structuredData={generateCollectionStructuredData({
          totalComics: stats.totalComics,
          totalValue: stats.totalValue,
          uniqueSeries: allSeries.length,
        })}
        canonical={collectionPageUrl}
      />

      {/* Sticky Header */}
      <header className={`sticky top-0 z-30 bg-surface-primary/95 backdrop-blur-md border-b transition-shadow duration-200 ${
        isScrolled ? 'border-slate-700/50 shadow-lg shadow-black/20' : 'border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <a
              href="https://comics.banast.as"
              className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink-0 hover:opacity-80 transition-opacity group"
            >
              <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg shadow-lg group-hover:bg-blue-400 transition-colors">
                <BookOpen size={20} className="text-white sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-white truncate group-hover:text-blue-200 transition-colors">comics.banast.as</h1>
                <p className="text-xs text-slate-500 hidden sm:block">{stats.totalComics} comics</p>
              </div>
            </a>

            {/* Desktop Search and Controls */}
            {activeTab === 'collection' && (
              <div className="hidden sm:flex items-center space-x-2 sm:space-x-4 flex-1 max-w-2xl mx-4">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search comics..."
                    value={searchInput}
                    onChange={handleSearchChange}
                    aria-label="Search comics"
                    className="w-full pl-9 pr-10 py-2 bg-surface-secondary border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-500 text-white placeholder-slate-500 text-sm transition-all"
                  />
                  {searchInput && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Mobile search toggle */}
              {activeTab === 'collection' && (
                <button
                  onClick={() => setShowMobileSearch(!showMobileSearch)}
                  className="sm:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-secondary transition-colors"
                >
                  <Search size={20} />
                </button>
              )}

              {/* Mobile filter/sort toggle */}
              {activeTab === 'collection' && (
                <button
                  onClick={() => setShowMobileControls(true)}
                  className="sm:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-secondary transition-colors"
                >
                  <SlidersHorizontal size={20} />
                </button>
              )}

              {/* Desktop controls */}
              <div className="hidden sm:flex items-center space-x-2 flex-shrink-0">
                {activeTab === 'collection' && (
                  <>
                    <div className="flex items-center border border-slate-700 rounded-xl overflow-hidden">
                      <button
                        onClick={() => {
                          setViewMode('grid');
                          navigateToRoute('collection', undefined, { tab: activeTab, viewMode: 'grid', searchTerm: filters.searchTerm, sortField, sortDirection });
                        }}
                        className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-surface-secondary'}`}
                      >
                        <Grid size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setViewMode('list');
                          navigateToRoute('collection', undefined, { tab: activeTab, viewMode: 'list', searchTerm: filters.searchTerm, sortField, sortDirection });
                        }}
                        className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-surface-secondary'}`}
                      >
                        <List size={16} />
                      </button>
                    </div>

                    <select
                      value={sortField}
                      onChange={(e) => {
                        const nextSortField = e.target.value as SortField;
                        setSortField(nextSortField);
                        navigateToRoute('collection', undefined, { tab: activeTab, viewMode, searchTerm: filters.searchTerm, sortField: nextSortField, sortDirection });
                      }}
                      aria-label="Sort by"
                      className="bg-surface-secondary border border-slate-700 rounded-xl px-3 py-2 text-sm text-white cursor-pointer hover:border-slate-600 transition-colors"
                    >
                      <option value="title">Title</option>
                      <option value="seriesName">Series</option>
                      <option value="issueNumber">Issue #</option>
                      <option value="releaseDate">Release Date</option>
                      <option value="grade">Grade</option>
                      <option value="purchasePrice">Purchase Price</option>
                      <option value="currentValue">Current Value</option>
                      <option value="purchaseDate">Purchase Date</option>
                    </select>

                    <button
                      onClick={() => {
                        const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                        setSortDirection(newDirection);
                        navigateToRoute('collection', undefined, { tab: activeTab, viewMode, searchTerm: filters.searchTerm, sortField, sortDirection: newDirection });
                      }}
                      className="p-2 border border-slate-700 rounded-xl hover:bg-surface-secondary transition-colors text-slate-400 hover:text-white"
                    >
                      {sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (slides down) */}
        {showMobileSearch && (
          <div className="sm:hidden px-3 pb-3 animate-slide-down">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search comics..."
                value={searchInput}
                onChange={handleSearchChange}
                autoFocus
                aria-label="Search comics"
                className="w-full pl-9 pr-10 py-2.5 bg-surface-secondary border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-500 text-white placeholder-slate-500 text-sm"
              />
              <button
                onClick={() => { clearSearch(); setShowMobileSearch(false); }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-t border-slate-800/50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
              <button
                onClick={() => {
                  setActiveTab('collection');
                  navigateToRoute('collection', undefined, { tab: 'collection', viewMode, searchTerm: filters.searchTerm, sortField, sortDirection });
                }}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'collection'
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center space-x-1.5 whitespace-nowrap">
                  <BookOpen size={15} />
                  <span>Collection</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('stats');
                  navigateToRoute('stats', undefined, { tab: 'stats', viewMode, searchTerm: filters.searchTerm, sortField, sortDirection });
                }}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'stats'
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center space-x-1.5 whitespace-nowrap">
                  <BarChart3 size={15} />
                  <span>Statistics</span>
                </div>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Active Filter Chips */}
      {activeTab === 'collection' && (filters.searchTerm || activeComputedTag) && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500">Filtered:</span>
            {filters.searchTerm && (
              <button
                onClick={clearSearch}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
              >
                Search: {filters.searchTerm}
                <X size={12} />
              </button>
            )}
            {activeComputedTag && (
              <button
                onClick={() => setActiveComputedTag(null)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
              >
                Tag: {activeComputedTag}
                <X size={12} />
              </button>
            )}
            {Number(!!filters.searchTerm) + Number(!!activeComputedTag) >= 2 && (
              <button
                onClick={() => { clearSearch(); setActiveComputedTag(null); }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-400 text-xs border border-slate-700 hover:border-slate-500 hover:text-white transition-colors"
                aria-label="Clear all filters"
              >
                Clear all
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
        {activeTab === 'collection' && (
          <CollectionTab
            stats={stats}
            allComics={allComics}
            filteredComics={filteredComics}
            paginatedComics={paginatedComics}
            viewMode={viewMode}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
            allVirtualBoxesCount={allVirtualBoxes.length}
            variantsCount={variantsCount}
            allComputedTags={allComputedTags}
            computedTagCounts={computedTagCounts}
            activeComputedTag={activeComputedTag}
            onViewComic={handleViewComic}
            onViewRawComics={handleViewRawComics}
            onViewSlabbedComics={handleViewSlabbedComics}
            onViewVariants={handleViewVariants}
            onViewVirtualBoxes={handleViewVirtualBoxes}
            onSetActiveComputedTag={setActiveComputedTag}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            onShowForm={() => setShowForm(true)}
          />
        )}

        {activeTab === 'stats' && (
          <StatsTab
            stats={stats}
            allComics={allComics}
            allSeriesCount={allSeries.length}
            allVirtualBoxesCount={allVirtualBoxes.length}
            variantsCount={variantsCount}
            selectedCondition={selectedCondition}
            top10Comics={top10Comics}
            seriesPerformance={seriesPerformance}
            valuedSeriesCount={valuedSeriesCount}
            seriesCountSummaries={seriesCountSummaries}
            storageLocationSummaries={storageLocationSummaries}
            showAllSeriesPerf={showAllSeriesPerf}
            showAllSeriesCount={showAllSeriesCount}
            onToggleSeriesPerf={() => setShowAllSeriesPerf(!showAllSeriesPerf)}
            onToggleSeriesCount={() => setShowAllSeriesCount(!showAllSeriesCount)}
            onViewComic={handleViewComic}
            onViewSeries={handleViewSeries}
            onViewStorageLocation={handleViewStorageLocation}
            onViewRawComics={handleViewRawComics}
            onViewSlabbedComics={handleViewSlabbedComics}
            onViewVariants={handleViewVariants}
            onViewVirtualBoxes={handleViewVirtualBoxes}
          />
        )}
      </main>

      {/* Mobile Controls Bottom Sheet */}
      <MobileControls
        isOpen={showMobileControls}
        onClose={() => setShowMobileControls(false)}
        viewMode={viewMode}
        onViewModeChange={handleMobileViewModeChange}
        sortField={sortField}
        onSortFieldChange={handleMobileSortFieldChange}
        sortDirection={sortDirection}
        onSortDirectionChange={handleMobileSortDirectionChange}
      />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Comic Form Modal */}
      {showForm && (
        <ErrorBoundary><React.Suspense fallback={<LoadingSpinner />}>
          <ComicForm
            comic={editingComic}
            onSave={handleSaveComic}
            onCancel={() => { setShowForm(false); setEditingComic(undefined); }}
            allSeries={allSeries}
            allVirtualBoxes={allVirtualBoxes}
          />
        </React.Suspense></ErrorBoundary>
      )}
    </div>
  );
}

export default App;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useComicStore } from './stores/comicStore';
import { useRouting } from './hooks/useRouting';
import { Dashboard } from './components/Dashboard';
import { ComicCard } from './components/ComicCard';
import { ComicListView } from './components/ComicListView';
import { SEO, generateCollectionStructuredData } from './components/SEO';
import { Comic } from './types/Comic';
import { BookOpen, Plus, BarChart3, Grid, List, SortAsc, SortDesc, Search, SlidersHorizontal, X, Trophy } from 'lucide-react';
import { SortField } from './types/Comic';
import { getComicUrl, getSeriesUrl, getStorageLocationUrl, getCoverArtistUrl, getTagUrl, urls, createComicSlug } from './utils/routing';
import { debounce } from './utils/performance';
import { Breadcrumb } from './components/Breadcrumb';
import { MobileControls } from './components/MobileControls';
import { ToastContainer } from './components/Toast';
import { GradeDistribution } from './components/GradeDistribution';
import { AcquisitionTimeline } from './components/AcquisitionTimeline';
import { CollectorInsights } from './components/CollectorInsights';
import { CollectionHealth } from './components/CollectionHealth';
import { formatCurrency } from './utils/formatting';

// Lazy load components
const ComicForm = React.lazy(() => import('./components/ComicForm').then(module => ({ default: module.ComicForm })));
const ComicDetail = React.lazy(() => import('./components/ComicDetail').then(module => ({ default: module.ComicDetail })));
const SeriesDetail = React.lazy(() => import('./components/SeriesDetail').then(module => ({ default: module.SeriesDetail })));
const StorageLocationDetail = React.lazy(() => import('./components/StorageLocationDetail').then(module => ({ default: module.StorageLocationDetail })));
const CoverArtistDetail = React.lazy(() => import('./components/CoverArtistDetail').then(module => ({ default: module.CoverArtistDetail })));
const TagDetail = React.lazy(() => import('./components/TagDetail').then(module => ({ default: module.TagDetail })));
const RawComicsDetail = React.lazy(() => import('./components/RawComicsDetail').then(module => ({ default: module.RawComicsDetail })));
const SlabbedComicsDetail = React.lazy(() => import('./components/SlabbedComicsDetail').then(module => ({ default: module.SlabbedComicsDetail })));
const StorageLocationsListing = React.lazy(() => import('./components/StorageLocationsListing').then(module => ({ default: module.StorageLocationsListing })));
const VariantsDetail = React.lazy(() => import('./components/VariantsDetail').then(module => ({ default: module.VariantsDetail })));

// Loading component for Suspense
const LoadingSpinner = () => (
  <div className="min-h-screen bg-surface-base flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-400">Loading...</p>
    </div>
  </div>
);

function App() {
  const {
    comics: allComics,
    filteredComics,
    stats,
    filters,
    sortField,
    sortDirection,
    loading,
    addComic,
    updateComic,
    setFilters,
    setSortField,
    setSortDirection,
    allSeries,
    allVirtualBoxes,
    variantsCount,
    allComputedTags,
    computedTagCounts,
    activeComputedTag,
    setActiveComputedTag,
  } = useComicStore();

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
  const [itemsPerPage, setItemsPerPage] = useState(48);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAllSeriesPerf, setShowAllSeriesPerf] = useState(false);
  const [showAllSeriesCount, setShowAllSeriesCount] = useState(false);

  // URL routing
  const { navigateToRoute } = useRouting({
    activeTab,
    selectedComic,
    selectedSeries,
    selectedStorageLocation,
    selectedCoverArtist,
    selectedTag,
    selectedCondition,
    showVirtualBoxes,
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
    allComics,
  });

  // Sticky header scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debounced search function
  const debouncedSetFilters = useMemo(
    () => debounce((searchTerm: string) => {
      setFilters(prevFilters => ({ ...prevFilters, searchTerm }));
      navigateToRoute(activeTab === 'stats' ? 'stats' : 'collection', undefined, {
        tab: activeTab,
        viewMode,
        searchTerm,
        sortField,
        sortDirection
      });
    }, 300),
    [activeTab, viewMode, sortField, sortDirection, navigateToRoute, setFilters]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value === '') {
      debouncedSetFilters.cancel();
      setFilters({ searchTerm: '' });
      navigateToRoute(activeTab === 'stats' ? 'stats' : 'collection', undefined, {
        tab: activeTab, viewMode, searchTerm: '', sortField, sortDirection
      });
    } else {
      debouncedSetFilters(value);
    }
  }, [debouncedSetFilters, setFilters, activeTab, viewMode, sortField, sortDirection, navigateToRoute]);

  const clearSearch = useCallback(() => {
    debouncedSetFilters.cancel();
    setSearchInput('');
    setFilters({ searchTerm: '' });
    setShowMobileSearch(false);
    navigateToRoute(activeTab === 'stats' ? 'stats' : 'collection', undefined, {
      tab: activeTab, viewMode, searchTerm: '', sortField, sortDirection
    });
  }, [debouncedSetFilters, setFilters, activeTab, viewMode, sortField, sortDirection, navigateToRoute]);

  useEffect(() => { setSearchInput(filters.searchTerm); }, [filters.searchTerm]);
  useEffect(() => { setCurrentPage(0); }, [filters, sortField, sortDirection]);

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
  const breadcrumbItems = useMemo(() => {
    const items = [{ label: 'Collection', onClick: handleBackToCollection }];
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
  }, [selectedComic, selectedSeries, selectedStorageLocation, selectedCoverArtist, selectedTag, selectedCondition, showVirtualBoxes]);

  // Top 10 most valuable comics
  const top10Comics = useMemo(() => {
    return [...allComics]
      .filter(c => c.currentValue !== undefined)
      .sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0))
      .slice(0, 10);
  }, [allComics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your collection...</p>
        </div>
      </div>
    );
  }

  // Show virtual boxes listing
  if (showVirtualBoxes) {
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <StorageLocationsListing allComics={allComics} onBack={handleBackToCollection} onViewStorageLocation={handleViewStorageLocation} />
      </React.Suspense>
    );
  }

  // Show detail pages
  if (selectedComic) {
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <ComicDetail comic={selectedComic as Comic} allComics={allComics} onBack={handleBackToCollection} onView={handleViewComic}
          onViewSeries={handleViewSeries} onViewStorageLocation={handleViewStorageLocation} onViewCoverArtist={handleViewCoverArtist}
          onViewTag={handleViewTag} onViewRawComics={handleViewRawComics} onViewSlabbedComics={handleViewSlabbedComics} />
      </React.Suspense>
    );
  }

  if (selectedSeries) {
    const seriesComics = allComics.filter(comic => comic.seriesName === selectedSeries);
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <SeriesDetail seriesName={selectedSeries || ''} seriesComics={seriesComics} onBack={handleBackToCollection} onView={handleViewComic} />
      </React.Suspense>
    );
  }

  if (selectedStorageLocation) {
    const locationComics = allComics.filter(comic => comic.storageLocation === selectedStorageLocation);
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <StorageLocationDetail storageLocation={selectedStorageLocation || ''} locationComics={locationComics}
          onBack={handleBackToCollection} onView={handleViewComic} onViewSeries={handleViewSeries} />
      </React.Suspense>
    );
  }

  if (selectedCoverArtist) {
    const artistComics = allComics.filter(comic => comic.coverArtist === selectedCoverArtist);
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <CoverArtistDetail coverArtist={selectedCoverArtist || ''} artistComics={artistComics}
          onBack={handleBackToCollection} onView={handleViewComic} onViewSeries={handleViewSeries} />
      </React.Suspense>
    );
  }

  if (selectedTag) {
    const tagComics = allComics.filter(comic => comic.tags.includes(selectedTag || ''));
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <TagDetail tag={selectedTag || ''} tagComics={tagComics} onBack={handleBackToCollection}
          onView={handleViewComic} onViewSeries={handleViewSeries} onViewTag={handleViewTag} />
      </React.Suspense>
    );
  }

  if (selectedCondition === 'raw') {
    const rawComics = allComics.filter(comic => !comic.isSlabbed);
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <RawComicsDetail rawComics={rawComics} onBack={handleBackToCollection} onView={handleViewComic} onViewSeries={handleViewSeries} />
      </React.Suspense>
    );
  }

  if (selectedCondition === 'slabbed') {
    const slabbedComics = allComics.filter(comic => comic.isSlabbed);
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <SlabbedComicsDetail slabbedComics={slabbedComics} onBack={handleBackToCollection} onView={handleViewComic} onViewSeries={handleViewSeries} />
      </React.Suspense>
    );
  }

  if (selectedCondition === 'variants') {
    const variantComics = allComics.filter(comic => comic.isVariant);
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <VariantsDetail variantComics={variantComics} onBack={handleBackToCollection} onView={handleViewComic}
          onViewRawComics={handleViewRawComics} onViewSlabbedComics={handleViewSlabbedComics} onViewSeries={handleViewSeries} />
      </React.Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base">
      <SEO
        title={activeTab === 'stats' ? 'Collection Statistics' : 'My Collection'}
        description={`View and manage your comic book collection. ${stats.totalComics} comics across ${allSeries.length} series, total value: $${stats.totalValue.toFixed(0)}`}
        structuredData={generateCollectionStructuredData({
          totalComics: stats.totalComics,
          totalValue: stats.totalValue,
          uniqueSeries: allSeries.length,
        })}
        canonical="https://comics.banast.as/"
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
                        setSortField(e.target.value as SortField);
                        navigateToRoute('collection', undefined, { tab: activeTab, viewMode, searchTerm: filters.searchTerm, sortField: e.target.value, sortDirection });
                      }}
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
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
        {activeTab === 'collection' && (
          <div className="animate-fade-in">
            <div className="pt-4 sm:pt-6 lg:pt-8">
              <Dashboard
                stats={stats}
                onViewComic={handleViewComic}
                onViewRawComics={handleViewRawComics}
                onViewSlabbedComics={handleViewSlabbedComics}
                onViewVariants={handleViewVariants}
                onViewVirtualBoxes={handleViewVirtualBoxes}
                virtualBoxesCount={allVirtualBoxes.length}
                variantsCount={variantsCount}
              />
            </div>

            {/* Quick Filter Tags */}
            <div className="flex items-center gap-2 flex-wrap py-3">
              {allComputedTags.map((tag) => {
                const count = computedTagCounts.get(tag) || 0;
                const isActive = activeComputedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setActiveComputedTag(isActive ? null : tag)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-glow'
                        : 'bg-surface-secondary text-slate-400 border border-slate-700/50 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {tag}
                    <span className={`tabular-nums ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {filteredComics.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-slate-500">
                    Showing {currentPage * itemsPerPage + 1} to {Math.min((currentPage + 1) * itemsPerPage, filteredComics.length)} of {filteredComics.length}
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="bg-surface-secondary border border-slate-700 rounded-xl px-3 py-1 text-sm text-white cursor-pointer"
                  >
                    <option value={48}>48 per page</option>
                    <option value={96}>96 per page</option>
                    <option value={192}>192 per page</option>
                  </select>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="px-3 py-1.5 bg-surface-secondary border border-slate-700 rounded-xl text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-elevated transition-colors"
                    >
                      Previous
                    </button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) pageNum = i;
                        else if (currentPage < 3) pageNum = i;
                        else if (currentPage >= totalPages - 3) pageNum = totalPages - 5 + i;
                        else pageNum = currentPage - 2 + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
                              currentPage === pageNum
                                ? 'bg-blue-500 text-white'
                                : 'bg-surface-secondary text-slate-400 hover:bg-surface-elevated hover:text-white'
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages - 1}
                      className="px-3 py-1.5 bg-surface-secondary border border-slate-700 rounded-xl text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-elevated transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Comics Grid/List */}
            {filteredComics.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {allComics.length === 0 ? 'No comics in your collection' : 'No comics match your filters'}
                </h3>
                <p className="text-sm text-slate-500 mb-6 px-4">
                  {allComics.length === 0
                    ? 'Start building your collection by adding your first comic!'
                    : 'Try adjusting your search criteria or filters.'
                  }
                </p>
                {allComics.length === 0 && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
                  >
                    <Plus size={20} />
                    <span>Add Your First Comic</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                    {paginatedComics.map((comic) => (
                      <ComicCard key={comic.id} comic={comic} onView={handleViewComic} />
                    ))}
                  </div>
                ) : (
                  <ComicListView comics={paginatedComics} onView={handleViewComic} />
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6 pt-4 sm:pt-6 lg:pt-8 animate-fade-in">
            <Dashboard
              stats={stats}
              showDetailed={true}
              onViewComic={handleViewComic}
              onViewRawComics={handleViewRawComics}
              onViewSlabbedComics={handleViewSlabbedComics}
              onViewVariants={handleViewVariants}
              onViewVirtualBoxes={handleViewVirtualBoxes}
              virtualBoxesCount={allVirtualBoxes.length}
              variantsCount={variantsCount}
              hideSlabbedCard={selectedCondition === 'slabbed'}
              hideRawCard={selectedCondition === 'raw'}
            />

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <GradeDistribution comics={allComics} />
              <AcquisitionTimeline comics={allComics} />
              <CollectorInsights comics={allComics} />
              <CollectionHealth comics={allComics} />
            </div>

            {/* Top 10 Most Valuable */}
            {top10Comics.length > 0 && (
              <div className="bg-surface-primary rounded-xl border border-slate-800 p-5 sm:p-6">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <Trophy size={18} className="text-amber-400" />
                  Top 10 Most Valuable
                </h3>
                <div className="space-y-2">
                  {top10Comics.map((comic, i) => (
                    <div
                      key={comic.id}
                      className="flex items-center gap-3 sm:gap-4 p-2 rounded-lg hover:bg-surface-secondary/50 cursor-pointer transition-colors"
                      onClick={() => handleViewComic(comic)}
                    >
                      <span className="text-lg font-bold text-slate-600 w-7 text-right tabular-nums">{i + 1}</span>
                      <div className="w-8 h-11 bg-surface-secondary rounded overflow-hidden flex-shrink-0">
                        {comic.coverImageUrl && (
                          <img src={comic.coverImageUrl} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">{comic.seriesName} #{comic.issueNumber}</p>
                        <p className="text-xs text-slate-500">Grade: {comic.grade} &middot; {comic.isSlabbed ? 'Slabbed' : 'Raw'}</p>
                      </div>
                      <p className="font-semibold text-white tabular-nums text-sm">{formatCurrency(comic.currentValue || 0)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Series Performance & Count Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Value Performance by Series */}
              {stats.comicsWithCurrentValue > 0 && (
                <div className="bg-surface-primary rounded-xl border border-slate-800 p-5 sm:p-6">
                  <h3 className="text-base font-semibold text-white mb-4">Series Performance</h3>
                  {allSeries.length > 0 ? (
                    <div className="space-y-1">
                      {allSeries
                        .map(series => {
                          const seriesComics = allComics.filter(comic => comic.seriesName === series);
                          const seriesComicsWithValue = seriesComics.filter(comic => comic.currentValue !== undefined);
                          const purchaseValue = seriesComicsWithValue.reduce((sum, comic) => sum + (comic.purchasePrice || 0), 0);
                          const currentValue = seriesComicsWithValue.reduce((sum, comic) => sum + (comic.currentValue || 0), 0);
                          const gainLoss = currentValue - purchaseValue;
                          const gainLossPercentage = purchaseValue > 0 ? (gainLoss / purchaseValue) * 100 : 0;
                          return { name: series, count: seriesComics.length, countWithValue: seriesComicsWithValue.length, purchaseValue, currentValue, gainLoss, gainLossPercentage };
                        })
                        .filter(series => series.countWithValue > 0)
                        .sort((a, b) => Math.abs(b.gainLossPercentage) - Math.abs(a.gainLossPercentage))
                        .slice(0, showAllSeriesPerf ? undefined : 8)
                        .map(series => (
                          <div
                            key={series.name}
                            className="flex items-center justify-between cursor-pointer hover:bg-surface-secondary/50 rounded-lg p-2.5 transition-colors"
                            onClick={() => handleViewSeries(series.name)}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-white text-sm truncate">{series.name}</p>
                              <p className="text-xs text-slate-500">{series.countWithValue} of {series.count} valued</p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-3">
                              <p className="font-semibold text-white text-sm tabular-nums">
                                {(series.currentValue || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                              </p>
                              <p className={`text-xs font-medium tabular-nums ${series.gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {series.gainLoss >= 0 ? '+' : ''}{(series.gainLoss || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} ({(series.gainLossPercentage || 0) >= 0 ? '+' : ''}{(series.gainLossPercentage || 0).toFixed(1)}%)
                              </p>
                            </div>
                          </div>
                        ))}
                      {allSeries.filter(s => allComics.some(c => c.seriesName === s && c.currentValue !== undefined)).length > 8 && (
                        <button
                          onClick={() => setShowAllSeriesPerf(!showAllSeriesPerf)}
                          className="w-full text-center py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {showAllSeriesPerf ? 'Show Less' : 'Show All'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No series performance data available</p>
                  )}
                </div>
              )}

              {/* Series Breakdown by Count */}
              <div className="bg-surface-primary rounded-xl border border-slate-800 p-5 sm:p-6">
                <h3 className="text-base font-semibold text-white mb-4">Top Series by Count</h3>
                {allSeries.length > 0 ? (
                  <div className="space-y-1">
                    {allSeries
                      .map(series => ({
                        name: series,
                        count: allComics.filter(comic => comic.seriesName === series).length,
                        value: allComics.filter(comic => comic.seriesName === series).reduce((sum, comic) => sum + (comic.purchasePrice || 0), 0)
                      }))
                      .sort((a, b) => b.count - a.count)
                      .slice(0, showAllSeriesCount ? undefined : 10)
                      .map(series => (
                        <div
                          key={series.name}
                          className="flex items-center justify-between cursor-pointer hover:bg-surface-secondary/50 rounded-lg p-2.5 transition-colors"
                          onClick={() => handleViewSeries(series.name)}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-white text-sm truncate">{series.name}</p>
                            <p className="text-xs text-slate-500">{series.count} comics</p>
                          </div>
                          <p className="font-semibold text-white text-sm tabular-nums flex-shrink-0 ml-3">
                            {(series.value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                          </p>
                        </div>
                      ))}
                    {allSeries.length > 10 && (
                      <button
                        onClick={() => setShowAllSeriesCount(!showAllSeriesCount)}
                        className="w-full text-center py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {showAllSeriesCount ? 'Show Less' : 'Show All'}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No series data available</p>
                )}
              </div>

              {/* Recent Additions */}
              <div className="bg-surface-primary rounded-xl border border-slate-800 p-5 sm:p-6">
                <h3 className="text-base font-semibold text-white mb-4">Recent Additions</h3>
                {allComics.length > 0 ? (
                  <div className="space-y-1">
                    {[...allComics]
                      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
                      .slice(0, 5)
                      .map(comic => (
                        <div
                          key={comic.id}
                          className="flex items-center justify-between cursor-pointer hover:bg-surface-secondary/50 rounded-lg p-2.5 transition-colors"
                          onClick={() => handleViewComic(comic)}
                        >
                          <div className="min-w-0 flex-1">
                            <p
                              className="font-medium text-white text-sm hover:text-blue-400 transition-colors truncate"
                              onClick={(e) => { e.stopPropagation(); handleViewSeries(comic.seriesName); }}
                            >
                              {comic.seriesName} #{comic.issueNumber}
                            </p>
                            <p className="text-xs text-slate-500">
                              Purchased {new Date(comic.purchaseDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <p className="font-semibold text-white text-sm tabular-nums">
                              {(comic.purchasePrice || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                            </p>
                            {comic.currentValue && (
                              <p className={`text-xs tabular-nums ${(comic.currentValue || 0) >= (comic.purchasePrice || 0) ? 'text-emerald-400' : 'text-red-400'}`}>
                                Now: {(comic.currentValue || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No comics added yet</p>
                )}
              </div>

              {/* Storage Locations */}
              <div className="bg-surface-primary rounded-xl border border-slate-800 p-5 sm:p-6">
                <h3 className="text-base font-semibold text-white mb-4">Virtual Boxes</h3>
                {allVirtualBoxes.length > 0 ? (
                  <div className="space-y-1">
                    {allVirtualBoxes
                      .map(location => ({
                        name: location,
                        count: allComics.filter(comic => comic.storageLocation === location).length,
                        value: allComics.filter(comic => comic.storageLocation === location).reduce((sum, comic) => sum + (comic.currentValue || comic.purchasePrice || 0), 0)
                      }))
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 8)
                      .map(location => (
                        <div
                          key={location.name}
                          className="flex items-center justify-between cursor-pointer hover:bg-surface-secondary/50 rounded-lg p-2.5 transition-colors"
                          onClick={() => handleViewStorageLocation(location.name)}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-white text-sm truncate">{location.name}</p>
                            <p className="text-xs text-slate-500">{location.count} comics</p>
                          </div>
                          <p className="font-semibold text-white text-sm tabular-nums flex-shrink-0 ml-3">
                            {formatCurrency(location.value)}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No virtual boxes specified</p>
                )}
              </div>
            </div>
          </div>
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
        <React.Suspense fallback={<LoadingSpinner />}>
          <ComicForm
            comic={editingComic}
            onSave={handleSaveComic}
            onCancel={() => { setShowForm(false); setEditingComic(undefined); }}
            allSeries={allSeries}
            allVirtualBoxes={allVirtualBoxes}
          />
        </React.Suspense>
      )}
    </div>
  );
}

export default App;

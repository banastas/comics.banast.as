import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { matchesSearch, useComicStore } from './stores/comicStore';
import { emptySelection, useRouting, type RouteSelection } from './hooks/useRouting';
import { SEO } from './components/SEO';
import type { Comic, SortField } from './types/Comic';
import { debounce } from './utils/performance';
import type { BreadcrumbItem } from './components/Breadcrumb';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MobileControls } from './components/MobileControls';
import { ToastContainer } from './components/Toast';
import { getSeriesCountSummaries, getSeriesPerformance, getStorageLocationSummaries, getTopValueComics } from './utils/collection-analytics';
import { generateCollectionStructuredData } from './utils/structured-data';
import { AppRouteRenderer } from './components/AppRouteRenderer';
import { LoadingSpinner, CollectionLoading } from './components/AppLoading';
import { ComicForm } from './components/lazyRoutes';
import { CollectionTab } from './components/CollectionTab';
import { StatsTab } from './components/StatsTab';
import { SiteHeader, type HeaderSection } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { NavigationProvider } from './components/navigation';
import { destinationHref, type Destination } from './utils/destinations';
import { formatWholeCurrency } from './utils/formatting';
import { createComicSlug } from './utils/routing';

const ITEMS_PER_PAGE_KEY = 'comics:itemsPerPage';

function App() {
  const allComics = useComicStore((s) => s.comics);
  const filteredComics = useComicStore((s) => s.filteredComics);
  const stats = useComicStore((s) => s.stats);
  const filters = useComicStore((s) => s.filters);
  const sortField = useComicStore((s) => s.sortField);
  const sortDirection = useComicStore((s) => s.sortDirection);
  const loading = useComicStore((s) => s.loading);
  const loadError = useComicStore((s) => s.loadError);
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
  const [activeTab, setActiveTab] = useState<'collection' | 'stats'>(
    () => (typeof window !== 'undefined' && window.location.pathname === '/stats' ? 'stats' : 'collection')
  );
  const [selection, setSelection] = useState<RouteSelection>(emptySelection);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    if (typeof window === 'undefined') return 48;
    let stored: string | null = null;
    try { stored = window.localStorage.getItem(ITEMS_PER_PAGE_KEY); } catch { /* Storage can be blocked by browser privacy settings. */ }
    const parsed = stored ? Number.parseInt(stored, 10) : NaN;
    return [48, 96, 192].includes(parsed) ? parsed : 48;
  });
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [showAllSeriesPerf, setShowAllSeriesPerf] = useState(false);
  const [showAllSeriesCount, setShowAllSeriesCount] = useState(false);

  const { navigateToRoute, notFound } = useRouting({
    ready: !loading && !loadError,
    viewMode,
    searchTerm: filters.searchTerm,
    activeComputedTag,
    sortField,
    sortDirection,
    setActiveTab,
    setSelection,
    setViewMode,
    setFilters,
    setSortField,
    setSortDirection,
    setActiveComputedTag,
    setCurrentPage,
    allComics,
  });

  const hasSelectedRoute = Boolean(
    selection.showVirtualBoxes ||
    selection.comic ||
    selection.series ||
    selection.storageLocation ||
    selection.coverArtist ||
    selection.tag ||
    selection.condition
  );
  const onCollection = !hasSelectedRoute && !notFound && activeTab === 'collection';

  // Searching from any page lands on the collection results; a cleared search returns to page 1.
  const debouncedSearch = useMemo(
    () => debounce((searchTerm: string) => {
      navigateToRoute('collection', undefined, { searchTerm });
    }, 300),
    [navigateToRoute]
  );

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (value === '') {
      debouncedSearch.cancel();
      if (onCollection) navigateToRoute('collection', undefined, { searchTerm: '' });
    } else {
      debouncedSearch(value);
    }
  }, [debouncedSearch, navigateToRoute, onCollection]);

  const clearSearch = useCallback(() => {
    debouncedSearch.cancel();
    setSearchInput('');
    if (filters.searchTerm) navigateToRoute('collection', undefined, { searchTerm: '' });
  }, [debouncedSearch, filters.searchTerm, navigateToRoute]);

  const clearFilters = useCallback(() => {
    debouncedSearch.cancel();
    setSearchInput('');
    navigateToRoute('collection', undefined, { searchTerm: '', computedTag: null });
  }, [debouncedSearch, navigateToRoute]);

  useEffect(() => {
    // Route navigation can update the store independently of the local draft input.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(filters.searchTerm);
  }, [filters.searchTerm]);

  const handleComputedTagChange = (tag: string | null) => {
    navigateToRoute('collection', undefined, { computedTag: tag });
  };
  const closeMobileControls = useCallback(() => setShowMobileControls(false), []);

  const totalPages = Math.max(1, Math.ceil(filteredComics.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages - 1);
  const paginatedComics = useMemo(() => {
    const startIndex = safePage * itemsPerPage;
    return filteredComics.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredComics, safePage, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    navigateToRoute('collection', undefined, { page });
    window.scrollTo({ top: 0, behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [navigateToRoute]);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    try { window.localStorage.setItem(ITEMS_PER_PAGE_KEY, String(newItemsPerPage)); } catch { /* ignore quota/privacy errors */ }
    navigateToRoute('collection', undefined, { page: 0 }, true);
  }, [navigateToRoute]);

  // Tag counts within the active search, so each chip reflects the results it would show.
  const tagCounts = useMemo(() => {
    if (!filters.searchTerm.trim()) return computedTagCounts;
    const counts = new Map<string, number>();
    allComics.forEach((comic) => {
      if (!matchesSearch(comic, filters.searchTerm)) return;
      (computedTagsMap.get(comic.id) || []).forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
    });
    return counts;
  }, [allComics, computedTagCounts, computedTagsMap, filters.searchTerm]);

  const handleSaveComic = (comicData: Omit<Comic, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingComic) {
      updateComic(editingComic.id, comicData);
    } else {
      addComic(comicData);
    }
    setShowForm(false);
    setEditingComic(undefined);
  };

  const handleCancelComic = useCallback(() => {
    setShowForm(false);
    setEditingComic(undefined);
  }, []);

  const navigate = useCallback((destination: Destination) => {
    switch (destination.type) {
      case 'comic':
        setSelection({ ...emptySelection, comic: destination.comic });
        navigateToRoute('comic', createComicSlug(destination.comic));
        break;
      case 'series':
        setSelection({ ...emptySelection, series: destination.name });
        navigateToRoute('series', destination.name);
        break;
      case 'artist':
        setSelection({ ...emptySelection, coverArtist: destination.name });
        navigateToRoute('artist', destination.name);
        break;
      case 'storage':
        setSelection({ ...emptySelection, storageLocation: destination.name });
        navigateToRoute('storage', destination.name);
        break;
      case 'tag':
        setSelection({ ...emptySelection, tag: destination.name });
        navigateToRoute('tag', destination.name);
        break;
      case 'collection':
        setSelection(emptySelection);
        setActiveTab('collection');
        navigateToRoute('collection', undefined, { page: currentPage });
        break;
      case 'stats':
        setSelection(emptySelection);
        setActiveTab('stats');
        navigateToRoute('stats');
        break;
      case 'raw':
      case 'slabbed':
      case 'variants':
        setSelection({ ...emptySelection, condition: destination.type });
        navigateToRoute(destination.type);
        break;
      case 'boxes':
        setSelection({ ...emptySelection, showVirtualBoxes: true });
        navigateToRoute('boxes');
        break;
    }
  }, [currentPage, navigateToRoute]);

  const handleViewComic = useCallback((comic: Comic) => navigate({ type: 'comic', comic }), [navigate]);
  const handleViewSeries = useCallback((name: string) => navigate({ type: 'series', name }), [navigate]);
  const handleViewStorageLocation = useCallback((name: string) => navigate({ type: 'storage', name }), [navigate]);
  const handleViewCoverArtist = useCallback((name: string) => navigate({ type: 'artist', name }), [navigate]);
  const handleViewTag = useCallback((name: string) => navigate({ type: 'tag', name }), [navigate]);
  const handleBackToCollection = useCallback(() => navigate({ type: 'collection' }), [navigate]);

  const setCollectionViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    navigateToRoute('collection', undefined, { viewMode: mode, page: currentPage });
  };
  const setCollectionSortField = (field: SortField) => {
    setSortField(field);
    navigateToRoute('collection', undefined, { sortField: field });
  };
  const toggleCollectionSortDirection = () => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);
    navigateToRoute('collection', undefined, { sortDirection: newDirection });
  };

  const collectionCrumb: BreadcrumbItem = { label: 'Collection', href: destinationHref({ type: 'collection' }), onClick: handleBackToCollection };
  const breadcrumbItems: BreadcrumbItem[] = (() => {
    const items: BreadcrumbItem[] = [collectionCrumb];
    if (selection.condition === 'raw') items.push({ label: 'Raw Comics' });
    else if (selection.condition === 'slabbed') items.push({ label: 'Slabbed Comics' });
    else if (selection.condition === 'variants') items.push({ label: 'Variants' });
    else if (selection.showVirtualBoxes) items.push({ label: 'Virtual Boxes' });
    else if (selection.series) items.push({ label: selection.series });
    else if (selection.storageLocation) {
      items.push({ label: 'Virtual Boxes', href: destinationHref({ type: 'boxes' }), onClick: () => navigate({ type: 'boxes' }) });
      items.push({ label: selection.storageLocation });
    } else if (selection.coverArtist) items.push({ label: selection.coverArtist });
    else if (selection.tag) items.push({ label: selection.tag });
    else if (selection.comic) {
      const { seriesName, issueNumber, isVariant } = selection.comic;
      items.push({ label: seriesName, href: destinationHref({ type: 'series', name: seriesName }), onClick: () => handleViewSeries(seriesName) });
      items.push({ label: `#${issueNumber}${isVariant ? ' (Variant)' : ''}` });
    }
    return items;
  })();

  const top10Comics = useMemo(() => getTopValueComics(allComics, 10), [allComics]);
  const seriesPerformance = useMemo(() => getSeriesPerformance(allComics), [allComics]);
  const seriesCountSummaries = useMemo(() => getSeriesCountSummaries(allComics), [allComics]);
  const storageLocationSummaries = useMemo(() => getStorageLocationSummaries(allComics), [allComics]);
  const lastUpdated = useMemo(
    () => allComics.reduce<string | undefined>((latest, comic) => (!latest || comic.updatedAt > latest ? comic.updatedAt : latest), undefined),
    [allComics]
  );
  const collectionStructuredData = useMemo(() => generateCollectionStructuredData({
    totalComics: stats.totalComics,
    totalValue: stats.totalValue,
    uniqueSeries: allSeries.length,
  }), [allSeries.length, stats.totalComics, stats.totalValue]);

  const section: HeaderSection = loading || loadError || notFound
    ? null
    : selection.showVirtualBoxes || selection.storageLocation
      ? 'boxes'
      : hasSelectedRoute
        ? null
        : activeTab;

  const renderContent = () => {
    if (loading) return <CollectionLoading />;

    if (loadError) {
      return (
        <main id="main-content" className="grid flex-1 place-content-center gap-4 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">The collection could not be loaded.</h1>
          <p role="alert" className="text-slate-400">Please reload to try again.</p>
          <button className="rounded-xl bg-blue-600 px-4 py-3 text-white" onClick={() => window.location.reload()}>Reload collection</button>
        </main>
      );
    }

    if (notFound) {
      return (
        <main id="main-content" className="grid flex-1 place-items-center p-6">
          <SEO title="Page Not Found" description="This page is not in the collection." noindex />
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-bold text-white">That page is not in this collection.</h1>
            <p className="text-slate-400">The link may be outdated. Search above or return to browse the collection.</p>
            <button className="rounded-xl bg-blue-600 px-4 py-3 text-white" onClick={handleBackToCollection}>Return to the collection</button>
          </div>
        </main>
      );
    }

    if (hasSelectedRoute) {
      return (
        <AppRouteRenderer
          allComics={allComics}
          computedTagsMap={computedTagsMap}
          selection={selection}
          breadcrumbItems={breadcrumbItems}
          onBack={handleBackToCollection}
          onViewComic={handleViewComic}
          onViewSeries={handleViewSeries}
          onViewStorageLocation={handleViewStorageLocation}
          onViewCoverArtist={handleViewCoverArtist}
          onViewTag={handleViewTag}
        />
      );
    }

    const isStats = activeTab === 'stats';
    const pageUrl = isStats ? 'https://comics.banast.as/stats' : 'https://comics.banast.as/';

    return (
      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-8 sm:px-6 lg:px-8">
        <SEO
          title={isStats ? 'Collection Statistics' : 'Comic Collection'}
          description={isStats
            ? `Statistics for ${stats.totalComics} comics across ${allSeries.length} series: value, returns, grades, series, and acquisitions.`
            : `Browse ${stats.totalComics} comics across ${allSeries.length} series with cover art, grades, values, variants, artists, and storage details. Current value ${formatWholeCurrency(stats.totalValue)}.`}
          url={pageUrl}
          structuredData={collectionStructuredData}
          canonical={pageUrl}
        />

        {isStats ? (
          <StatsTab
            stats={stats}
            allComics={allComics}
            allSeriesCount={allSeries.length}
            allVirtualBoxesCount={allVirtualBoxes.length}
            variantsCount={variantsCount}
            top10Comics={top10Comics}
            seriesPerformance={seriesPerformance}
            seriesCountSummaries={seriesCountSummaries}
            storageLocationSummaries={storageLocationSummaries}
            showAllSeriesPerf={showAllSeriesPerf}
            showAllSeriesCount={showAllSeriesCount}
            onToggleSeriesPerf={() => setShowAllSeriesPerf(!showAllSeriesPerf)}
            onToggleSeriesCount={() => setShowAllSeriesCount(!showAllSeriesCount)}
            onViewComic={handleViewComic}
          />
        ) : (
          <CollectionTab
            stats={stats}
            allComics={allComics}
            filteredComics={filteredComics}
            paginatedComics={paginatedComics}
            viewMode={viewMode}
            currentPage={safePage}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
            allVirtualBoxesCount={allVirtualBoxes.length}
            variantsCount={variantsCount}
            allComputedTags={allComputedTags}
            tagCounts={tagCounts}
            activeComputedTag={activeComputedTag}
            searchTerm={filters.searchTerm}
            onViewComic={handleViewComic}
            onSetActiveComputedTag={handleComputedTagChange}
            onClearSearch={clearSearch}
            onClearFilters={clearFilters}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            onShowForm={() => setShowForm(true)}
          />
        )}
      </main>
    );
  };

  return (
    <NavigationProvider value={navigate}>
      <div className="flex min-h-screen flex-col bg-surface-base">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <SiteHeader
          section={section}
          totalComics={stats.totalComics}
          searchInput={searchInput}
          onSearchChange={handleSearchChange}
          onClearSearch={clearSearch}
          showCollectionControls={onCollection && !loading}
          viewMode={viewMode}
          onViewModeChange={setCollectionViewMode}
          sortField={sortField}
          onSortFieldChange={setCollectionSortField}
          sortDirection={sortDirection}
          onToggleSortDirection={toggleCollectionSortDirection}
          onOpenMobileControls={() => setShowMobileControls(true)}
        />

        {renderContent()}

        <SiteFooter lastUpdated={lastUpdated} />

        <MobileControls
          isOpen={showMobileControls}
          onClose={closeMobileControls}
          viewMode={viewMode}
          onViewModeChange={setCollectionViewMode}
          sortField={sortField}
          onSortFieldChange={setCollectionSortField}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleCollectionSortDirection}
        />

        <ToastContainer />

        {showForm && (
          <ErrorBoundary><React.Suspense fallback={<LoadingSpinner />}>
            <ComicForm
              key={editingComic?.id ?? 'new'}
              comic={editingComic}
              onSave={handleSaveComic}
              onCancel={handleCancelComic}
              allSeries={allSeries}
              allVirtualBoxes={allVirtualBoxes}
            />
          </React.Suspense></ErrorBoundary>
        )}
      </div>
    </NavigationProvider>
  );
}

export default App;

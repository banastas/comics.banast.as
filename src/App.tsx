import React, { useState, useEffect } from 'react';
import { Comic, SortField } from './types/Comic';
import { useComics } from './hooks/useComics';

// Core Components
import { Dashboard } from './components/Dashboard';
import { ComicCard } from './components/ComicCard';
import { ComicListView } from './components/ComicListView';

// Lazy-loaded components
const ComicForm = React.lazy(() => import('./components/ComicForm').then(module => ({ default: module.ComicForm })));
const ComicDetail = React.lazy(() => import('./components/ComicDetail').then(module => ({ default: module.ComicDetail })));
const SeriesDetail = React.lazy(() => import('./components/SeriesDetail').then(module => ({ default: module.SeriesDetail })));
const StorageLocationDetail = React.lazy(() => import('./components/StorageLocationDetail').then(module => ({ default: module.StorageLocationDetail })));
const StorageLocationsListing = React.lazy(() => import('./components/StorageLocationsListing').then(module => ({ default: module.StorageLocationsListing })));
const CoverArtistDetail = React.lazy(() => import('./components/CoverArtistDetail').then(module => ({ default: module.CoverArtistDetail })));
const TagDetail = React.lazy(() => import('./components/TagDetail').then(module => ({ default: module.TagDetail })));
const RawComicsDetail = React.lazy(() => import('./components/RawComicsDetail').then(module => ({ default: module.RawComicsDetail })));
const SlabbedComicsDetail = React.lazy(() => import('./components/SlabbedComicsDetail').then(module => ({ default: module.SlabbedComicsDetail })));
const VariantsDetail = React.lazy(() => import('./components/VariantsDetail').then(module => ({ default: module.VariantsDetail })));
const CsvConverter = React.lazy(() => import('./components/CsvConverter').then(module => ({ default: module.CsvConverter })));

// LoadingSpinner component defined inline
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-300">Loading...</p>
    </div>
  </div>
);

// Icons
import { 
  Search, 
  Plus, 
  Grid, 
  List, 
  SortAsc, 
  SortDesc, 
  FileText,
  BookOpen,
  BarChart3
} from 'lucide-react';

export default function App() {
  const {
    comics,           // This is the filtered comics from useComics
    allComics,        // This is all comics unfiltered
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
  } = useComics();

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
  const [showCsvConverter, setShowCsvConverter] = useState(false);

  // Safe array operations with fallbacks
  const safeAllComics = Array.isArray(allComics) ? allComics : [];
  const safeComics = Array.isArray(comics) ? comics : [];

  // Get unique values for filters with safe array operations
  const allSeries = Array.from(new Set(safeAllComics.map(comic => comic?.seriesName).filter(Boolean))).sort();
  const allVirtualBoxes = Array.from(new Set(safeAllComics.map(comic => comic?.storageLocation).filter(Boolean))).sort();
  const variantsCount = safeAllComics.filter(comic => comic?.isVariant).length;

  // URL management for virtual boxes
  useEffect(() => {
    // Listen for browser back/forward events
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        const { type, data } = event.state;
        switch (type) {
          case 'virtual-box':
            setSelectedStorageLocation(data);
            setSelectedComic(undefined);
            setSelectedSeries(null);
            setSelectedCoverArtist(null);
            setSelectedTag(null);
            setSelectedCondition(null);
            setShowVirtualBoxes(false);
            break;
          case 'virtual-boxes':
            setShowVirtualBoxes(true);
            setSelectedStorageLocation(null);
            setSelectedComic(undefined);
            setSelectedSeries(null);
            setSelectedCoverArtist(null);
            setSelectedTag(null);
            setSelectedCondition(null);
            break;
          case 'collection':
          default:
            handleBackToCollection();
            break;
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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

  const handleViewComic = (comic: Comic) => {
    setSelectedComic(comic);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setSelectedCondition(null);
    setShowVirtualBoxes(false);
  };

  const handleBackToCollection = () => {
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setSelectedCondition(null);
    setShowVirtualBoxes(false);
    setShowCsvConverter(false);
    // Update URL
    window.history.pushState({ type: 'collection' }, '', window.location.pathname);
  };

  const handleViewSeries = (seriesName: string) => {
    setSelectedSeries(seriesName);
    setSelectedComic(undefined);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setSelectedCondition(null);
    setShowVirtualBoxes(false);
  };

  const handleViewStorageLocation = (storageLocation: string) => {
    setSelectedStorageLocation(storageLocation);
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setSelectedCondition(null);
    setShowVirtualBoxes(false);
    // Update URL for virtual box
    const encodedName = encodeURIComponent(storageLocation);
    window.history.pushState(
      { type: 'virtual-box', data: storageLocation }, 
      '', 
      `${window.location.pathname}#virtual-box/${encodedName}`
    );
  };

  const handleViewCoverArtist = (coverArtist: string) => {
    setSelectedCoverArtist(coverArtist);
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedTag(null);
    setSelectedCondition(null);
    setShowVirtualBoxes(false);
  };

  const handleViewTag = (tag: string) => {
    setSelectedTag(tag);
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedCondition(null);
    setShowVirtualBoxes(false);
  };

  const handleViewRawComics = () => {
    setSelectedCondition('raw');
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setShowVirtualBoxes(false);
  };

  const handleViewSlabbedComics = () => {
    setSelectedCondition('slabbed');
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setShowVirtualBoxes(false);
  };

  const handleViewVariants = () => {
    setSelectedCondition('variants');
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setShowVirtualBoxes(false);
  };

  const handleViewVirtualBoxes = () => {
    setShowVirtualBoxes(true);
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setSelectedCondition(null);
    setShowCsvConverter(false);
    // Update URL for virtual boxes listing
    window.history.pushState(
      { type: 'virtual-boxes' }, 
      '', 
      `${window.location.pathname}#virtual-boxes`
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Show CSV converter if selected
  if (showCsvConverter) {
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <CsvConverter
          onBack={handleBackToCollection}
        />
      </React.Suspense>
    );
  }

  // Show virtual boxes listing if selected
  if (showVirtualBoxes) {
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <StorageLocationsListing
          allComics={safeAllComics}
          onBack={handleBackToCollection}
          onViewStorageLocation={handleViewStorageLocation}
        />
      </React.Suspense>
    );
  }

  // Show comic detail page if a comic is selected
  if (selectedComic) {
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <ComicDetail
          comic={selectedComic as Comic}
          allComics={safeAllComics}
          onBack={handleBackToCollection}
          onView={handleViewComic}
          onViewSeries={handleViewSeries}
          onViewStorageLocation={handleViewStorageLocation}
          onViewCoverArtist={handleViewCoverArtist}
          onViewTag={handleViewTag}
          onViewRawComics={handleViewRawComics}
          onViewSlabbedComics={handleViewSlabbedComics}
        />
      </React.Suspense>
    );
  }

  // Show series detail page if a series is selected
  if (selectedSeries) {
    const seriesComics = safeAllComics.filter(comic => comic.seriesName === selectedSeries);
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <SeriesDetail
          seriesName={selectedSeries || ''}
          seriesComics={seriesComics}
          onBack={handleBackToCollection}
          onView={handleViewComic}
        />
      </React.Suspense>
    );
  }

  // Show storage location detail page if a storage location is selected
  if (selectedStorageLocation) {
    const locationComics = safeAllComics.filter(comic => comic.storageLocation === selectedStorageLocation);
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <StorageLocationDetail
          storageLocation={selectedStorageLocation || ''}
          locationComics={locationComics}
          onBack={handleBackToCollection}
          onView={handleViewComic}
          onViewSeries={handleViewSeries}
        />
      </React.Suspense>
    );
  }

  // Show cover artist detail page if a cover artist is selected
  if (selectedCoverArtist) {
    const artistComics = safeAllComics.filter(comic => comic.coverArtist === selectedCoverArtist);
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <CoverArtistDetail
          coverArtist={selectedCoverArtist || ''}
          artistComics={artistComics}
          onBack={handleBackToCollection}
          onView={handleViewComic}
          onViewSeries={handleViewSeries}
        />
      </React.Suspense>
    );
  }

  // Show tag detail page if a tag is selected
  if (selectedTag) {
    const tagComics = safeAllComics.filter(comic => (comic.tags || []).includes(selectedTag));
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <TagDetail
          tag={selectedTag || ''}
          tagComics={tagComics}
          onBack={handleBackToCollection}
          onView={handleViewComic}
          onViewSeries={handleViewSeries}
        />
      </React.Suspense>
    );
  }

  // Show condition-based detail pages
  if (selectedCondition === 'raw') {
    const rawComics = safeAllComics.filter(comic => !comic.isSlabbed);
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <RawComicsDetail
          rawComics={rawComics}
          onBack={handleBackToCollection}
          onView={handleViewComic}
          onViewSeries={handleViewSeries}
        />
      </React.Suspense>
    );
  }

  if (selectedCondition === 'slabbed') {
    const slabbedComics = safeAllComics.filter(comic => comic.isSlabbed);
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <SlabbedComicsDetail
          slabbedComics={slabbedComics}
          onBack={handleBackToCollection}
          onView={handleViewComic}
          onViewSeries={handleViewSeries}
        />
      </React.Suspense>
    );
  }

  if (selectedCondition === 'variants') {
    const variantComics = safeAllComics.filter(comic => comic.isVariant);
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <VariantsDetail
          variantComics={variantComics}
          onBack={handleBackToCollection}
          onView={handleViewComic}
          onViewSeries={handleViewSeries}
        />
      </React.Suspense>
    );
  }

  // Main collection view
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 space-y-3 sm:space-y-0">
            <div className="flex items-center justify-between sm:justify-start">
              <div className="flex items-center space-x-3">
                <BookOpen size={32} className="text-blue-400" />
                <h1 className="text-xl sm:text-2xl font-bold text-white">Comic Collection</h1>
              </div>
              
              <div className="flex items-center space-x-2 sm:hidden">
                <button
                  onClick={() => setShowCsvConverter(true)}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                  title="CSV Converter"
                >
                  <FileText size={20} />
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  title="Add Comic"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search comics..."
                  value={filters?.searchTerm || ''}
                  onChange={(e) => setFilters({ searchTerm: e.target.value })}
                  className="w-full sm:w-64 bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Desktop Actions */}
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={() => setShowCsvConverter(true)}
                  className="p-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-gray-300"
                  title="CSV Converter"
                >
                  <FileText size={20} />
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus size={20} />
                  <span>Add Comic</span>
                </button>
              </div>
              
              {/* Mobile/Responsive Controls */}
              {activeTab === 'collection' && (
                <>
                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="flex border border-gray-600 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 sm:p-2 transition-colors ${
                          viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        <Grid size={16} />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 sm:p-2 rounded-r-lg transition-colors ${
                          viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        <List size={16} />
                      </button>
                    </div>
                    
                    {/* Sort Controls */}
                    <select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value as SortField)}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm text-white"
                    >
                      <option value="title">Sort by Title</option>
                      <option value="seriesName">Sort by Series</option>
                      <option value="issueNumber">Sort by Issue #</option>
                      <option value="releaseDate">Sort by Release Date</option>
                      <option value="grade">Sort by Grade</option>
                      <option value="purchasePrice">Sort by Purchase Price</option>
                      <option value="currentValue">Sort by Current Value</option>
                      <option value="purchaseDate">Sort by Purchase Date</option>
                    </select>
                    
                    <button
                      onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                      className="p-1.5 sm:p-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-gray-300"
                    >
                      {sortDirection === 'asc' ? <SortAsc size={14} className="sm:w-4 sm:h-4" /> : <SortDesc size={14} className="sm:w-4 sm:h-4" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('collection')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'collection'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
              } transition-colors whitespace-nowrap`}
            >
              Collection ({safeAllComics.length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
              } transition-colors whitespace-nowrap flex items-center space-x-1`}
            >
              <BarChart3 size={16} />
              <span>Statistics</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        {/* Only render Dashboard if we have stats */}
        {stats && (
          activeTab === 'stats' ? (
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
            />
          ) : (
            <>
              {/* Quick Stats Dashboard */}
              <Dashboard 
                stats={stats} 
                showDetailed={false}
                onViewComic={handleViewComic}
                onViewRawComics={handleViewRawComics}
                onViewSlabbedComics={handleViewSlabbedComics}
                onViewVariants={handleViewVariants}
                onViewVirtualBoxes={handleViewVirtualBoxes}
                virtualBoxesCount={allVirtualBoxes.length}
                variantsCount={variantsCount}
              />

              {/* Comics Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 md:gap-6">
                  {safeComics.map((comic) => (
                    <ComicCard
                      key={comic.id}
                      comic={comic}
                      onView={handleViewComic}
                      onEdit={(comic) => {
                        setEditingComic(comic);
                        setShowForm(true);
                      }}
                      onViewSeries={handleViewSeries}
                    />
                  ))}
                </div>
              ) : (
                <ComicListView
                  comics={safeComics}
                  onView={handleViewComic}
                  onEdit={(comic) => {
                    setEditingComic(comic);
                    setShowForm(true);
                  }}
                  onViewSeries={handleViewSeries}
                  onViewStorageLocation={handleViewStorageLocation}
                  onViewCoverArtist={handleViewCoverArtist}
                />
              )}

              {safeComics.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen size={48} className="mx-auto text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No comics found</h3>
                  <p className="text-gray-400 mb-4">
                    {safeAllComics.length === 0 
                      ? "Start building your collection by adding your first comic!"
                      : "Try adjusting your search or filters to find what you're looking for."
                    }
                  </p>
                  {safeAllComics.length === 0 && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Add Your First Comic
                    </button>
                  )}
                </div>
              )}
            </>
          )
        )}
      </main>

      {/* Comic Form Modal */}
      {showForm && (
        <React.Suspense fallback={<LoadingSpinner />}>
          <ComicForm
            comic={editingComic}
            onSave={handleSaveComic}
            onClose={() => {
              setShowForm(false);
              setEditingComic(undefined);
            }}
            allSeries={allSeries}
            allVirtualBoxes={allVirtualBoxes}
          />
        </React.Suspense>
      )}
    </div>
  );
}
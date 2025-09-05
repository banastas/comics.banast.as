import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { Comic, SortField } from './types/Comic';
import { useComics } from './hooks/useComics';
import { useComicFilters } from './hooks/useComicFilters';
import { generateVirtualBoxUrl, getVirtualBoxFromSlug } from './utils/urlUtils';

// Core Components
import Dashboard from './components/Dashboard';
import ComicCard from './components/ComicCard';
import ComicListView from './components/ComicListView';
import ComicForm from './components/ComicForm';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy-loaded Components
const ComicDetail = React.lazy(() => import('./components/ComicDetail'));
const SeriesDetail = React.lazy(() => import('./components/SeriesDetail'));
const StorageLocationDetail = React.lazy(() => import('./components/StorageLocationDetail'));
const StorageLocationsListing = React.lazy(() => import('./components/StorageLocationsListing'));
const CoverArtistDetail = React.lazy(() => import('./components/CoverArtistDetail'));
const TagDetail = React.lazy(() => import('./components/TagDetail'));
const RawComicsDetail = React.lazy(() => import('./components/RawComicsDetail'));
const SlabbedComicsDetail = React.lazy(() => import('./components/SlabbedComicsDetail'));
const VariantsDetail = React.lazy(() => import('./components/VariantsDetail'));
const CsvConverter = React.lazy(() => import('./components/CsvConverter'));

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

// Route Wrapper Components
const ComicDetailWrapper: React.FC<{ allComics: Comic[] }> = ({ allComics }) => {
  const { comicId } = useParams<{ comicId: string }>();
  const navigate = useNavigate();
  
  const comic = allComics.find(c => c.id === comicId);
  
  if (!comic) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <ComicDetail
      comic={comic}
      allComics={allComics}
      onBack={() => navigate(-1)}
      onView={(comic) => navigate(`/comic/${comic.id}`)}
      onViewSeries={(series) => navigate(`/series/${encodeURIComponent(series)}`)}
      onViewStorageLocation={(location) => navigate(`/virtual-box/${encodeURIComponent(location)}`)}
      onViewCoverArtist={(artist) => navigate(`/artist/${encodeURIComponent(artist)}`)}
      onViewTag={(tag) => navigate(`/tag/${encodeURIComponent(tag)}`)}
      onViewRawComics={() => navigate('/raw-comics')}
      onViewSlabbedComics={() => navigate('/slabbed-comics')}
    />
  );
};

const SeriesDetailWrapper: React.FC<{ allComics: Comic[] }> = ({ allComics }) => {
  const { seriesName } = useParams<{ seriesName: string }>();
  const navigate = useNavigate();
  
  if (!seriesName) {
    return <Navigate to="/" replace />;
  }
  
  const decodedSeriesName = decodeURIComponent(seriesName);
  const seriesComics = allComics.filter(comic => comic.seriesName === decodedSeriesName);
  
  if (seriesComics.length === 0) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <SeriesDetail
      seriesName={decodedSeriesName}
      seriesComics={seriesComics}
      onBack={() => navigate('/')}
      onView={(comic) => navigate(`/comic/${comic.id}`)}
    />
  );
};

const StorageLocationDetailWrapper: React.FC<{ allComics: Comic[] }> = ({ allComics }) => {
  const { boxName } = useParams<{ boxName: string }>();
  const navigate = useNavigate();
  
  if (!boxName) {
    return <Navigate to="/virtual-boxes" replace />;
  }
  
  // Get all virtual box names for slug matching
  const allVirtualBoxes = Array.from(new Set(allComics.map(comic => comic.storageLocation).filter(Boolean)));
  const decodedBoxName = getVirtualBoxFromSlug(boxName, allVirtualBoxes) || decodeURIComponent(boxName);
  const locationComics = allComics.filter(comic => comic.storageLocation === decodedBoxName);
  
  if (locationComics.length === 0) {
    return <Navigate to="/virtual-boxes" replace />;
  }
  
  return (
    <StorageLocationDetail
      storageLocation={decodedBoxName}
      locationComics={locationComics}
      onBack={() => navigate('/virtual-boxes')}
      onView={(comic) => navigate(`/comic/${comic.id}`)}
      onViewSeries={(series) => navigate(`/series/${encodeURIComponent(series)}`)}
    />
  );
};

const CoverArtistDetailWrapper: React.FC<{ allComics: Comic[] }> = ({ allComics }) => {
  const { artistName } = useParams<{ artistName: string }>();
  const navigate = useNavigate();
  
  if (!artistName) {
    return <Navigate to="/" replace />;
  }
  
  const decodedArtistName = decodeURIComponent(artistName);
  const artistComics = allComics.filter(comic => comic.coverArtist === decodedArtistName);
  
  if (artistComics.length === 0) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <CoverArtistDetail
      coverArtist={decodedArtistName}
      artistComics={artistComics}
      onBack={() => navigate('/')}
      onView={(comic) => navigate(`/comic/${comic.id}`)}
      onViewSeries={(series) => navigate(`/series/${encodeURIComponent(series)}`)}
    />
  );
};

const TagDetailWrapper: React.FC<{ allComics: Comic[] }> = ({ allComics }) => {
  const { tagName } = useParams<{ tagName: string }>();
  const navigate = useNavigate();
  
  if (!tagName) {
    return <Navigate to="/" replace />;
  }
  
  const decodedTagName = decodeURIComponent(tagName);
  const tagComics = allComics.filter(comic => comic.tags.includes(decodedTagName));
  
  if (tagComics.length === 0) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <TagDetail
      tag={decodedTagName}
      tagComics={tagComics}
      onBack={() => navigate('/')}
      onView={(comic) => navigate(`/comic/${comic.id}`)}
      onViewSeries={(series) => navigate(`/series/${encodeURIComponent(series)}`)}
    />
  );
};

// Main Collection Component
const Collection: React.FC<{ allComics: Comic[] }> = ({ allComics }) => {
  const navigate = useNavigate();
  const {
    addComic,
    updateComic,
    setFilters,
    setSortField,
    setSortDirection,
    filteredComics,
    sortField,
    sortDirection,
    filters,
  } = useComics();

  const [showForm, setShowForm] = useState(false);
  const [editingComic, setEditingComic] = useState<Comic | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'collection' | 'stats'>('collection');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get unique values for filters
  const allSeries = Array.from(new Set(allComics.map(comic => comic.seriesName))).sort();
  const allVirtualBoxes = Array.from(new Set(allComics.map(comic => comic.storageLocation).filter(Boolean))).sort();
  const variantsCount = allComics.filter(comic => comic.isVariant).length;

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
    navigate(`/comic/${comic.id}`);
  };

  const handleViewSeries = (seriesName: string) => {
    navigate(`/series/${encodeURIComponent(seriesName)}`);
  };

  const handleViewStorageLocation = (storageLocation: string) => {
    navigate(`/virtual-box/${encodeURIComponent(storageLocation)}`);
  };

  const handleViewCoverArtist = (coverArtist: string) => {
    navigate(`/artist/${encodeURIComponent(coverArtist)}`);
  };

  const handleViewTag = (tag: string) => {
    navigate(`/tag/${encodeURIComponent(tag)}`);
  };

  const handleViewRawComics = () => {
    navigate('/raw-comics');
  };

  const handleViewSlabbedComics = () => {
    navigate('/slabbed-comics');
  };

  const handleViewVariants = () => {
    navigate('/variants');
  };

  const handleViewVirtualBoxes = () => {
    navigate('/virtual-boxes');
  };

  const { stats } = useComicFilters(allComics, filters, sortField, sortDirection);

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
                  onClick={() => navigate('/csv-converter')}
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
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ searchTerm: e.target.value })}
                  className="w-full sm:w-64 bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Desktop Actions */}
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={() => navigate('/csv-converter')}
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
              Collection ({allComics.length})
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
        {activeTab === 'stats' ? (
          <Dashboard 
            stats={stats} 
            showDetailed={true}
            onViewComic={handleViewComic}
            onViewRawComics={handleViewRawComics}
            onViewSlabbedComics={handleViewSlabbedComics}
            onViewVariants={handleViewVariants}
            onViewVirtualBoxes={handleViewVirtualBoxes}
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
            />

            {/* Comics Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 md:gap-6">
                {filteredComics.map((comic) => (
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
                comics={filteredComics}
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

            {filteredComics.length === 0 && (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No comics found</h3>
                <p className="text-gray-400 mb-4">
                  {allComics.length === 0 
                    ? "Start building your collection by adding your first comic!"
                    : "Try adjusting your search or filters to find what you're looking for."
                  }
                </p>
                {allComics.length === 0 && (
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
        )}
      </main>

      {/* Comic Form Modal */}
      {showForm && (
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
      )}
    </div>
  );
};

// Main App Component with Router
function App() {
  const { allComics, loading } = useComics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your collection...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Main collection view */}
            <Route path="/" element={<Collection allComics={allComics} />} />
            
            {/* Virtual boxes listing */}
            <Route path="/virtual-boxes" element={
              <StorageLocationsListing allComics={allComics} />
            } />
            
            {/* Individual virtual box detail */}
            <Route path="/virtual-box/:boxName" element={
              <StorageLocationDetailWrapper allComics={allComics} />
            } />
            
            {/* Comic detail */}
            <Route path="/comic/:comicId" element={
              <ComicDetailWrapper allComics={allComics} />
            } />
            
            {/* Series detail */}
            <Route path="/series/:seriesName" element={
              <SeriesDetailWrapper allComics={allComics} />
            } />
            
            {/* Cover artist detail */}
            <Route path="/artist/:artistName" element={
              <CoverArtistDetailWrapper allComics={allComics} />
            } />
            
            {/* Tag detail */}
            <Route path="/tag/:tagName" element={
              <TagDetailWrapper allComics={allComics} />
            } />
            
            {/* Condition-based views */}
            <Route path="/raw-comics" element={
              <Suspense fallback={<LoadingSpinner />}>
                <RawComicsDetail 
                  rawComics={allComics.filter(comic => !comic.isSlabbed)}
                  onBack={() => window.history.back()}
                  onView={(comic) => window.location.href = `/comic/${comic.id}`}
                  onViewSeries={(series) => window.location.href = `/series/${encodeURIComponent(series)}`}
                />
              </Suspense>
            } />
            
            <Route path="/slabbed-comics" element={
              <Suspense fallback={<LoadingSpinner />}>
                <SlabbedComicsDetail 
                  slabbedComics={allComics.filter(comic => comic.isSlabbed)}
                  onBack={() => window.history.back()}
                  onView={(comic) => window.location.href = `/comic/${comic.id}`}
                  onViewSeries={(series) => window.location.href = `/series/${encodeURIComponent(series)}`}
                />
              </Suspense>
            } />
            
            <Route path="/variants" element={
              <Suspense fallback={<LoadingSpinner />}>
                <VariantsDetail 
                  variantComics={allComics.filter(comic => comic.isVariant)}
                  onBack={() => window.history.back()}
                  onView={(comic) => window.location.href = `/comic/${comic.id}`}
                  onViewSeries={(series) => window.location.href = `/series/${encodeURIComponent(series)}`}
                />
              </Suspense>
            } />
            
            {/* CSV Converter */}
            <Route path="/csv-converter" element={
              <Suspense fallback={<LoadingSpinner />}>
                <CsvConverter onBack={() => window.history.back()} />
              </Suspense>
            } />
            
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
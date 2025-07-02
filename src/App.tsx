import React, { useState } from 'react';
import { useComics } from './hooks/useComics';
import { Dashboard } from './components/Dashboard';
import { ComicCard } from './components/ComicCard';
import { ComicListView } from './components/ComicListView';
import { ComicForm } from './components/ComicForm';
import { ComicDetail } from './components/ComicDetail';
import { SeriesDetail } from './components/SeriesDetail';
import { StorageLocationDetail } from './components/StorageLocationDetail';
import { CoverArtistDetail } from './components/CoverArtistDetail';
import { TagDetail } from './components/TagDetail';
import { RawComicsDetail } from './components/RawComicsDetail';
import { SlabbedComicsDetail } from './components/SlabbedComicsDetail';
import { StorageLocationsListing } from './components/StorageLocationsListing';
import { Comic } from './types/Comic';
import { BookOpen, Plus, BarChart3, Grid, List, SortAsc, SortDesc, Search } from 'lucide-react';
import { SortField } from './types/Comic';

function App() {
  const {
    comics,
    allComics,
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
  const [selectedCondition, setSelectedCondition] = useState<'raw' | 'slabbed' | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showStorageLocations, setShowStorageLocations] = useState(false);

  // Get unique values for filters
  const allSeries = Array.from(new Set(allComics.map(comic => comic.seriesName))).sort();
  const allStorageLocations = Array.from(new Set(allComics.map(comic => comic.storageLocation).filter(Boolean))).sort();

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
    setShowStorageLocations(false);
  };

  const handleBackToCollection = () => {
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setSelectedCondition(null);
    setShowStorageLocations(false);
  };

  const handleViewSeries = (seriesName: string) => {
    setSelectedSeries(seriesName);
    setSelectedComic(undefined);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setSelectedCondition(null);
    setShowStorageLocations(false);
  };

  const handleViewStorageLocation = (storageLocation: string) => {
    setSelectedStorageLocation(storageLocation);
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setSelectedCondition(null);
    setShowStorageLocations(false);
  };

  const handleViewCoverArtist = (coverArtist: string) => {
    setSelectedCoverArtist(coverArtist);
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedTag(null);
    setSelectedCondition(null);
    setShowStorageLocations(false);
  };

  const handleViewTag = (tag: string) => {
    setSelectedTag(tag);
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedCondition(null);
    setShowStorageLocations(false);
  };

  const handleViewRawComics = () => {
    setSelectedCondition('raw');
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setShowStorageLocations(false);
  };

  const handleViewSlabbedComics = () => {
    setSelectedCondition('slabbed');
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setShowStorageLocations(false);
  };

  const handleViewStorageLocations = () => {
    setShowStorageLocations(true);
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setSelectedCondition(null);
  };

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

  // Show storage locations listing if selected
  if (showStorageLocations) {
    return (
      <StorageLocationsListing
        allComics={allComics}
        onBack={handleBackToCollection}
        onViewStorageLocation={handleViewStorageLocation}
      />
    );
  }

  // Show comic detail page if a comic is selected
  if (selectedComic) {
    return (
      <ComicDetail
        comic={selectedComic as Comic}
        allComics={allComics}
        onBack={handleBackToCollection}
        onView={handleViewComic}
        onViewSeries={handleViewSeries}
        onViewStorageLocation={handleViewStorageLocation}
        onViewCoverArtist={handleViewCoverArtist}
        onViewTag={handleViewTag}
        onViewRawComics={handleViewRawComics}
        onViewSlabbedComics={handleViewSlabbedComics}
      />
    );
  }

  // Show series detail page if a series is selected
  if (selectedSeries) {
    const seriesComics = allComics.filter(comic => comic.seriesName === selectedSeries);
    return (
      <SeriesDetail
        seriesName={selectedSeries || ''}
        seriesComics={seriesComics}
        onBack={handleBackToCollection}
        onView={handleViewComic}
      />
    );
  }

  // Show storage location detail page if a storage location is selected
  if (selectedStorageLocation) {
    const locationComics = allComics.filter(comic => comic.storageLocation === selectedStorageLocation);
    return (
      <StorageLocationDetail
        storageLocation={selectedStorageLocation || ''}
        locationComics={locationComics}
        onBack={handleBackToCollection}
        onView={handleViewComic}
        onViewSeries={handleViewSeries}
      />
    );
  }

  // Show cover artist detail page if a cover artist is selected
  if (selectedCoverArtist) {
    const artistComics = allComics.filter(comic => comic.coverArtist === selectedCoverArtist);
    return (
      <CoverArtistDetail
        coverArtist={selectedCoverArtist || ''}
        artistComics={artistComics}
        onBack={handleBackToCollection}
        onView={handleViewComic}
        onViewSeries={handleViewSeries}
        onViewStorageLocation={handleViewStorageLocation}
        onViewRawComics={handleViewRawComics}
        onViewSlabbedComics={handleViewSlabbedComics}
      />
    );
  }

  // Show tag detail page if a tag is selected
  if (selectedTag) {
    const tagComics = allComics.filter(comic => comic.tags.includes(selectedTag || ''));
    return (
      <TagDetail
        tag={selectedTag || ''}
        tagComics={tagComics}
        onBack={handleBackToCollection}
        onView={handleViewComic}
        onViewSeries={handleViewSeries}
        onViewTag={handleViewTag}
      />
    );
  }

  // Show raw comics detail page if selected
  if (selectedCondition === 'raw') {
    const rawComics = allComics.filter(comic => !comic.isSlabbed);
    return (
      <RawComicsDetail
        rawComics={rawComics}
        onBack={handleBackToCollection}
        onView={handleViewComic}
        onViewSeries={handleViewSeries}
      />
    );
  }

  // Show slabbed comics detail page if selected
  if (selectedCondition === 'slabbed') {
    const slabbedComics = allComics.filter(comic => comic.isSlabbed);
    return (
      <SlabbedComicsDetail
        slabbedComics={slabbedComics}
        onBack={handleBackToCollection}
        onView={handleViewComic}
        onViewSeries={handleViewSeries}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="p-2 bg-blue-500 rounded-lg shadow-lg">
                <BookOpen size={24} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">comics.banast.as</h1>
                <p className="text-xs sm:text-sm text-gray-300">{stats.totalComics} comics</p>
              </div>
            </div>
            
            {/* Search and Controls - Only show on collection tab */}
            {activeTab === 'collection' && (
              <div className="hidden sm:flex items-center space-x-2 sm:space-x-4 flex-1 max-w-2xl mx-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search comics..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400 text-sm"
                  />
                </div>
              </div>
            )}
            
            <div className="hidden sm:flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {activeTab === 'collection' && (
                <>
                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-2 border border-gray-600 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-l-lg transition-colors ${
                        viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      <Grid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-r-lg transition-colors ${
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
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              } transition-colors`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2 whitespace-nowrap">
                <BookOpen size={16} />
                <span>Collection</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              } transition-colors`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2 whitespace-nowrap">
                <BarChart3 size={16} />
                <span>Statistics</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
        {activeTab === 'collection' && (
          <>
            <div className="pt-4 sm:pt-6 lg:pt-8">
              <Dashboard 
                stats={stats} 
                onViewComic={handleViewComic}
                onViewRawComics={handleViewRawComics}
                onViewSlabbedComics={handleViewSlabbedComics}
                onViewStorageLocations={handleViewStorageLocations}
                storageLocationsCount={allStorageLocations.length}
              />
            </div>

            {/* Comics Grid */}
            {comics.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <BookOpen size={48} className="mx-auto text-gray-500 mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                  {allComics.length === 0 ? 'No comics in your collection' : 'No comics match your filters'}
                </h3>
                <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 px-4">
                  {allComics.length === 0 
                    ? 'Start building your collection by adding your first comic!'
                    : 'Try adjusting your search criteria or filters.'
                  }
                </p>
                {allComics.length === 0 && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mx-auto shadow-lg"
                  >
                    <Plus size={20} />
                    <span>Add Your First Comic</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                    {comics.map((comic) => (
                      <ComicCard
                        key={comic.id}
                        comic={comic}
                        onView={handleViewComic}
                      />
                    ))}
                  </div>
                ) : (
                  <ComicListView
                    comics={comics}
                    onView={handleViewComic}
                  />
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-8 pt-4 sm:pt-6 lg:pt-8">
            <Dashboard 
              stats={stats} 
              showDetailed={activeTab === 'stats'}
              onViewComic={handleViewComic}
              onViewStorageLocations={handleViewStorageLocations}
              storageLocationsCount={allStorageLocations.length}
            />
            
            {/* Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Value Performance by Series */}
              {stats.comicsWithCurrentValue > 0 && (
                <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Series Performance</h3>
                  {allSeries.length > 0 ? (
                    <div className="space-y-3">
                      {allSeries
                        .map(series => {
                          const seriesComics = allComics.filter(comic => comic.seriesName === series);
                          const seriesComicsWithValue = seriesComics.filter(comic => comic.currentValue !== undefined);
                          const purchaseValue = seriesComicsWithValue.reduce((sum, comic) => sum + comic.purchasePrice, 0);
                          const currentValue = seriesComicsWithValue.reduce((sum, comic) => sum + (comic.currentValue || 0), 0);
                          const gainLoss = currentValue - purchaseValue;
                          const gainLossPercentage = purchaseValue > 0 ? (gainLoss / purchaseValue) * 100 : 0;
                          
                          return {
                            name: series,
                            count: seriesComics.length,
                            countWithValue: seriesComicsWithValue.length,
                            purchaseValue,
                            currentValue,
                            gainLoss,
                            gainLossPercentage
                          };
                        })
                        .filter(series => series.countWithValue > 0)
                        .sort((a, b) => Math.abs(b.gainLossPercentage) - Math.abs(a.gainLossPercentage))
                        .slice(0, 8)
                        .map(series => (
                          <div 
                            key={series.name} 
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-700/50 rounded-lg p-2 transition-colors"
                            onClick={() => handleViewSeries(series.name)}
                          >
                            <div>
                              <p className="font-medium text-white">{series.name}</p>
                              <p className="text-sm text-gray-400">
                                {series.countWithValue} of {series.count} comics valued
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-white">
                                {series.currentValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                              </p>
                              <p className={`text-sm font-medium ${
                                series.gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {series.gainLoss >= 0 ? '+' : ''}{series.gainLoss.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} ({series.gainLossPercentage >= 0 ? '+' : ''}{series.gainLossPercentage.toFixed(1)}%)
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No series performance data available</p>
                  )}
                </div>
              )}

              {/* Series Breakdown */}
              <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Top Series by Count</h3>
                {allSeries.length > 0 ? (
                  <div className="space-y-3">
                    {allSeries
                      .map(series => ({
                        name: series,
                        count: allComics.filter(comic => comic.seriesName === series).length,
                        value: allComics
                          .filter(comic => comic.seriesName === series)
                          .reduce((sum, comic) => sum + comic.purchasePrice, 0)
                      }))
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 10)
                      .map(series => (
                        <div 
                          key={series.name} 
                          className="flex items-center justify-between cursor-pointer hover:bg-gray-700/50 rounded-lg p-2 transition-colors"
                          onClick={() => handleViewSeries(series.name)}
                        >
                          <div>
                            <p className="font-medium text-white">{series.name}</p>
                            <p className="text-sm text-gray-400">{series.count} comics</p>
                          </div>
                          <p className="font-semibold text-white">
                            {series.value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No series data available</p>
                )}
              </div>

              {/* Recent Additions */}
              <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Additions</h3>
                {allComics.length > 0 ? (
                  <div className="space-y-3">
                    {allComics
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map(comic => (
                        <div 
                          key={comic.id} 
                          className="flex items-center justify-between cursor-pointer hover:bg-gray-700/50 rounded-lg p-2 transition-colors"
                          onClick={() => handleViewComic(comic)}
                        >
                          <div>
                            <p 
                              className="font-medium text-white hover:text-blue-400 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewSeries(comic.seriesName);
                              }}
                            >
                              {comic.seriesName} #{comic.issueNumber}
                            </p>
                            <p className="text-sm text-gray-400">
                              Added {new Date(comic.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-white">
                              {comic.purchasePrice.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                            </p>
                            {comic.currentValue && (
                              <p className={`text-xs ${
                                comic.currentValue >= comic.purchasePrice ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                Now: {comic.currentValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                                {comic.purchasePrice > 0 && ` (${comic.currentValue >= comic.purchasePrice ? '+' : ''}${((comic.currentValue - comic.purchasePrice) / comic.purchasePrice * 100).toFixed(1)}%)`}
                          </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No comics added yet</p>
                )}
              </div>

              {/* Storage Locations */}
              <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Storage Locations</h3>
                {allStorageLocations.length > 0 ? (
                  <div className="space-y-3">
                    {allStorageLocations
                      .map(location => ({
                        name: location,
                        count: allComics.filter(comic => comic.storageLocation === location).length,
                        value: allComics
                          .filter(comic => comic.storageLocation === location)
                          .reduce((sum, comic) => sum + (comic.currentValue || comic.purchasePrice), 0)
                      }))
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 8)
                      .map(location => (
                        <div 
                          key={location.name} 
                          className="flex items-center justify-between cursor-pointer hover:bg-gray-700/50 rounded-lg p-2 transition-colors"
                          onClick={() => handleViewStorageLocation(location.name)}
                        >
                          <div>
                            <p className="font-medium text-white">{location.name}</p>
                            <p className="text-sm text-gray-400">{location.count} comics</p>
                          </div>
                          <p className="font-semibold text-white">
                            {location.value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No storage locations specified</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Comic Form Modal */}
      {showForm && (
        <ComicForm
          comic={editingComic}
          onSave={handleSaveComic}
          onCancel={() => {
            setShowForm(false);
            setEditingComic(undefined);
          }}
          allSeries={allSeries}
          allStorageLocations={allStorageLocations}
        />
      )}
    </div>
  );
}

export default App;
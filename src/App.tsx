import React, { useState } from 'react';
import { useComics } from './hooks/useComics';
import { Dashboard } from './components/Dashboard';
import { ComicCard } from './components/ComicCard';
import { FilterControls } from './components/FilterControls';
import { ComicForm } from './components/ComicForm';
import { DataManager } from './components/DataManager';
import { ComicDetail } from './components/ComicDetail';
import { Comic } from './types/Comic';
import { BookOpen, Plus, Settings, BarChart3 } from 'lucide-react';

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
    deleteComic,
    setFilters,
    setSortField,
    setSortDirection,
    exportData,
    importData,
  } = useComics();

  const [showForm, setShowForm] = useState(false);
  const [editingComic, setEditingComic] = useState<Comic | null>(null);
  const [showDataManager, setShowDataManager] = useState(false);
  const [activeTab, setActiveTab] = useState<'collection' | 'stats' | 'data'>('collection');
  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);

  // Get unique values for filters
  const allSeries = Array.from(new Set(allComics.map(comic => comic.seriesName))).sort();
  const allStorageLocations = Array.from(new Set(allComics.map(comic => comic.storageLocation).filter(Boolean))).sort();
  const allTags = Array.from(new Set(allComics.flatMap(comic => comic.tags))).sort();

  const handleSaveComic = (comicData: Omit<Comic, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingComic) {
      updateComic(editingComic.id, comicData);
    } else {
      addComic(comicData);
    }
    setShowForm(false);
    setEditingComic(null);
  };

  const handleEditComic = (comic: Comic) => {
    setEditingComic(comic);
    setShowForm(true);
  };

  const handleDeleteComic = (id: string) => {
    if (window.confirm('Are you sure you want to delete this comic?')) {
      deleteComic(id);
    }
  };

  const handleClearAll = () => {
    importData(new File(['[]'], 'empty.json', { type: 'application/json' }), false);
  };

  const handleViewComic = (comic: Comic) => {
    setSelectedComic(comic);
  };

  const handleBackToCollection = () => {
    setSelectedComic(null);
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

  // Show comic detail page if a comic is selected
  if (selectedComic) {
    return (
      <ComicDetail
        comic={selectedComic}
        allComics={allComics}
        onBack={handleBackToCollection}
        onEdit={handleEditComic}
        onDelete={handleDeleteComic}
        onView={handleViewComic}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg shadow-lg">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Comic Collection Manager</h1>
                <p className="text-sm text-gray-300">{stats.totalComics} comics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
              >
                <Plus size={16} />
                <span>Add Comic</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('collection')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'collection'
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              } transition-colors`}
            >
              <div className="flex items-center space-x-2">
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
              <div className="flex items-center space-x-2">
                <BarChart3 size={16} />
                <span>Statistics</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'data'
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              } transition-colors`}
            >
              <div className="flex items-center space-x-2">
                <Settings size={16} />
                <span>Data Management</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'collection' && (
          <>
            <Dashboard stats={stats} />
            
            <FilterControls
              filters={filters}
              sortField={sortField}
              sortDirection={sortDirection}
              onFiltersChange={setFilters}
              onSortChange={(field, direction) => {
                setSortField(field);
                setSortDirection(direction);
              }}
              allSeries={allSeries}
              allTags={allTags}
            />

            {/* Comics Grid */}
            {comics.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {allComics.length === 0 ? 'No comics in your collection' : 'No comics match your filters'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {allComics.length === 0 
                    ? 'Start building your collection by adding your first comic!'
                    : 'Try adjusting your search criteria or filters.'
                  }
                </p>
                {allComics.length === 0 && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mx-auto shadow-lg"
                  >
                    <Plus size={20} />
                    <span>Add Your First Comic</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {comics.map((comic) => (
                  <ComicCard
                    key={comic.id}
                    comic={comic}
                    onView={handleViewComic}
                    onEdit={handleEditComic}
                    onDelete={handleDeleteComic}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-8">
            <Dashboard stats={stats} />
            
            {/* Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Series Breakdown */}
              <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Top Series</h3>
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
                        <div key={series.name} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">{series.name}</p>
                            <p className="text-sm text-gray-400">{series.count} comics</p>
                          </div>
                          <p className="font-semibold text-blue-400">
                            ${series.value.toLocaleString()}
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
                        <div key={comic.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">
                              {comic.seriesName} #{comic.issueNumber}
                            </p>
                            <p className="text-sm text-gray-400">
                              Added {new Date(comic.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="font-semibold text-blue-400">
                            ${comic.purchasePrice.toLocaleString()}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No comics added yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <DataManager
            onExport={exportData}
            onImport={importData}
            onClearAll={handleClearAll}
            totalComics={allComics.length}
          />
        )}
      </main>

      {/* Comic Form Modal */}
      {showForm && (
        <ComicForm
          comic={editingComic}
          onSave={handleSaveComic}
          onCancel={() => {
            setShowForm(false);
            setEditingComic(null);
          }}
          allSeries={allSeries}
          allStorageLocations={allStorageLocations}
        />
      )}
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { useComics } from './hooks/useComics';
import { Dashboard } from './components/Dashboard';
import { ComicCard } from './components/ComicCard';
import { FilterControls } from './components/FilterControls';
import { ComicForm } from './components/ComicForm';
import { ComicDetail } from './components/ComicDetail';
import { SeriesDetail } from './components/SeriesDetail';
import { StorageLocationDetail } from './components/StorageLocationDetail';
import { CoverArtistDetail } from './components/CoverArtistDetail';
import { TagDetail } from './components/TagDetail';
import { RawComicsDetail } from './components/RawComicsDetail';
import { SlabbedComicsDetail } from './components/SlabbedComicsDetail';
import { Comic } from './types/Comic';
import { BookOpen, Plus, BarChart3, Settings } from 'lucide-react';

function App() {
  const { comics, addComic, updateComic, deleteComic } = useComics();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedArtist, setSelectedArtist] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingComic, setEditingComic] = useState<Comic | null>(null);
  const [filteredComics, setFilteredComics] = useState<Comic[]>(comics);

  const handleSaveComic = (comic: Comic) => {
    if (editingComic) {
      updateComic(comic);
    } else {
      addComic(comic);
    }
    setShowForm(false);
    setEditingComic(null);
  };

  const handleEditComic = (comic: Comic) => {
    setEditingComic(comic);
    setShowForm(true);
  };

  const handleDeleteComic = (id: string) => {
    deleteComic(id);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            comics={comics}
            onViewSeries={(series) => {
              setSelectedSeries(series);
              setCurrentView('series');
            }}
            onViewLocation={(location) => {
              setSelectedLocation(location);
              setCurrentView('location');
            }}
            onViewArtist={(artist) => {
              setSelectedArtist(artist);
              setCurrentView('artist');
            }}
            onViewTag={(tag) => {
              setSelectedTag(tag);
              setCurrentView('tag');
            }}
            onViewRawComics={() => setCurrentView('raw')}
            onViewSlabbedComics={() => setCurrentView('slabbed')}
          />
        );
      case 'comics':
        return (
          <div className="space-y-6">
            <FilterControls comics={comics} onFilter={setFilteredComics} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredComics.map((comic) => (
                <ComicCard
                  key={comic.id}
                  comic={comic}
                  onClick={() => {
                    setSelectedComic(comic);
                    setCurrentView('detail');
                  }}
                  onEdit={() => handleEditComic(comic)}
                  onDelete={() => handleDeleteComic(comic.id)}
                />
              ))}
            </div>
          </div>
        );
      case 'detail':
        return selectedComic ? (
          <ComicDetail
            comic={selectedComic}
            onBack={() => setCurrentView('comics')}
            onEdit={() => handleEditComic(selectedComic)}
            onDelete={() => {
              handleDeleteComic(selectedComic.id);
              setCurrentView('comics');
            }}
          />
        ) : null;
      case 'series':
        return (
          <SeriesDetail
            series={selectedSeries}
            comics={comics.filter(c => c.series === selectedSeries)}
            onBack={() => setCurrentView('dashboard')}
            onComicClick={(comic) => {
              setSelectedComic(comic);
              setCurrentView('detail');
            }}
          />
        );
      case 'location':
        return (
          <StorageLocationDetail
            location={selectedLocation}
            comics={comics.filter(c => c.storageLocation === selectedLocation)}
            onBack={() => setCurrentView('dashboard')}
            onComicClick={(comic) => {
              setSelectedComic(comic);
              setCurrentView('detail');
            }}
          />
        );
      case 'artist':
        return (
          <CoverArtistDetail
            artist={selectedArtist}
            comics={comics.filter(c => c.coverArtist === selectedArtist)}
            onBack={() => setCurrentView('dashboard')}
            onComicClick={(comic) => {
              setSelectedComic(comic);
              setCurrentView('detail');
            }}
          />
        );
      case 'tag':
        return (
          <TagDetail
            tag={selectedTag}
            comics={comics.filter(c => c.tags?.includes(selectedTag))}
            onBack={() => setCurrentView('dashboard')}
            onComicClick={(comic) => {
              setSelectedComic(comic);
              setCurrentView('detail');
            }}
          />
        );
      case 'raw':
        return (
          <RawComicsDetail
            comics={comics.filter(c => !c.isSlabbed)}
            onBack={() => setCurrentView('dashboard')}
            onComicClick={(comic) => {
              setSelectedComic(comic);
              setCurrentView('detail');
            }}
          />
        );
      case 'slabbed':
        return (
          <SlabbedComicsDetail
            comics={comics.filter(c => c.isSlabbed)}
            onBack={() => setCurrentView('dashboard')}
            onComicClick={(comic) => {
              setSelectedComic(comic);
              setCurrentView('detail');
            }}
          />
        );
      default:
        return <Dashboard comics={comics} onViewSeries={() => {}} onViewLocation={() => {}} onViewArtist={() => {}} onViewTag={() => {}} onViewRawComics={() => {}} onViewSlabbedComics={() => {}} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">Comic Collection</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setCurrentView('comics')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'comics'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Comics</span>
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Comic</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}

        {showForm && (
          <ComicForm
            comic={editingComic}
            onSave={handleSaveComic}
            onCancel={() => {
              setShowForm(false);
              setEditingComic(null);
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;
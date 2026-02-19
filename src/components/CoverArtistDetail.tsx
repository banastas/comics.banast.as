import React, { useState, useMemo } from 'react';
import { Comic } from '../types/Comic';
import { Dashboard } from './Dashboard';
import { DetailPageHeader } from './DetailPageHeader';
import { ComicGridList } from './ComicGridList';
import { SeriesBreakdown } from './SeriesBreakdown';
import { Palette } from 'lucide-react';
import { calculateComicStats } from '../utils/stats';
import { sortComics, DetailSortField } from '../utils/sorting';
import { useScrollToTop } from '../hooks/useScrollToTop';

interface CoverArtistDetailProps {
  coverArtist: string;
  artistComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  onViewSeries?: (seriesName: string) => void;
}

export const CoverArtistDetail: React.FC<CoverArtistDetailProps> = React.memo(({
  coverArtist,
  artistComics,
  onBack,
  onView,
  onViewSeries,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<DetailSortField>('series');

  useScrollToTop();

  const stats = useMemo(() => calculateComicStats(artistComics), [artistComics]);
  const sortedComics = useMemo(() => sortComics(artistComics, sortBy), [artistComics, sortBy]);

  const uniqueSeriesCount = useMemo(
    () => new Set(artistComics.map(c => c.seriesName)).size,
    [artistComics]
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <DetailPageHeader
        onBack={onBack}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={(s) => setSortBy(s as DetailSortField)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Cover Artist Header and Statistics */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Palette size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{coverArtist}</h1>
                  <p className="text-gray-300">
                    {artistComics.length} comic{artistComics.length !== 1 ? 's' : ''} with cover art
                    {uniqueSeriesCount > 0 && (
                      <span className="text-gray-400 ml-2">
                        • {uniqueSeriesCount} series
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <Dashboard
              stats={stats}
              showDetailed={true}
              onViewComic={onView}
            />

            <SeriesBreakdown
              comics={artistComics}
              title={`Series with ${coverArtist} Cover Art`}
              onViewSeries={onViewSeries}
            />
          </div>

          {/* Comics Grid/List */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Comics with {coverArtist} Cover Art</h3>
            <ComicGridList
              comics={sortedComics}
              viewMode={viewMode}
              onView={onView}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

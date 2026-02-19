import React, { useState, useMemo } from 'react';
import { Comic } from '../types/Comic';
import { Dashboard } from './Dashboard';
import { BookOpen } from 'lucide-react';
import { calculateComicStats } from '../utils/stats';
import { sortComics, DetailSortField } from '../utils/sorting';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { DetailPageHeader } from './DetailPageHeader';
import { ComicGridList } from './ComicGridList';
import { SeriesBreakdown } from './SeriesBreakdown';

interface RawComicsDetailProps {
  rawComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  onViewSeries?: (seriesName: string) => void;
}

const RawComicsDetailComponent: React.FC<RawComicsDetailProps> = ({
  rawComics,
  onBack,
  onView,
  onViewSeries,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<DetailSortField>('series');

  useScrollToTop();

  const stats = useMemo(() => calculateComicStats(rawComics), [rawComics]);
  const sortedComics = useMemo(() => sortComics(rawComics, sortBy), [rawComics, sortBy]);
  const uniqueSeriesCount = useMemo(
    () => new Set(rawComics.map(c => c.seriesName)).size,
    [rawComics]
  );

  const gridBadges = (comic: Comic) => (
    <>
      <span className="px-1 py-0.5 bg-indigo-500 text-white text-xs font-medium rounded">Raw</span>
      {comic.signedBy && <span className="px-1 py-0.5 bg-rose-500 text-white text-xs font-medium rounded">Signed</span>}
    </>
  );

  const listBadges = (comic: Comic) => (
    <>
      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs rounded border border-indigo-500/30">Raw</span>
      {comic.signedBy && <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-xs rounded border border-rose-500/30">Signed</span>}
    </>
  );

  const listExtraInfo = (comic: Comic) =>
    comic.coverArtist ? <>{comic.coverArtist}</> : null;

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
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-indigo-500 rounded-lg">
                  <BookOpen size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Raw Comics</h1>
                  <p className="text-gray-300">
                    {rawComics.length} raw comic{rawComics.length !== 1 ? 's' : ''} in collection
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
              hideRawCard={true}
            />

            <SeriesBreakdown
              comics={rawComics}
              title="Raw Comics by Series"
              maxItems={8}
              onViewSeries={onViewSeries}
            />
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Raw Comics Collection</h3>
            <ComicGridList
              comics={sortedComics}
              viewMode={viewMode}
              onView={onView}
              gridBadges={gridBadges}
              listBadges={listBadges}
              listExtraInfo={listExtraInfo}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const RawComicsDetail = React.memo(RawComicsDetailComponent);

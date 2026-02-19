import React, { useState, useMemo } from 'react';
import { Comic } from '../types/Comic';
import { Dashboard } from './Dashboard';
import { DetailPageHeader } from './DetailPageHeader';
import { ComicGridList } from './ComicGridList';
import { SeriesBreakdown } from './SeriesBreakdown';
import { Award } from 'lucide-react';
import { calculateComicStats } from '../utils/stats';
import { sortComics, DetailSortField } from '../utils/sorting';
import { useScrollToTop } from '../hooks/useScrollToTop';

interface VariantsDetailProps {
  variantComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  onViewSeries?: (seriesName: string) => void;
  onViewRawComics?: () => void;
  onViewSlabbedComics?: () => void;
}

const VariantsDetailInner: React.FC<VariantsDetailProps> = ({
  variantComics,
  onBack,
  onView,
  onViewSeries,
  onViewRawComics,
  onViewSlabbedComics,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<DetailSortField>('series');

  useScrollToTop();

  const stats = useMemo(() => calculateComicStats(variantComics), [variantComics]);
  const sortedComics = useMemo(() => sortComics(variantComics, sortBy), [variantComics, sortBy]);

  const uniqueSeriesCount = useMemo(
    () => new Set(variantComics.map(c => c.seriesName)).size,
    [variantComics]
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <DetailPageHeader
        onBack={onBack}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={(val) => setSortBy(val as DetailSortField)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Variants Header and Statistics */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-500 rounded-lg">
                  <Award size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Variant Comics</h1>
                  <p className="text-gray-300">
                    {variantComics.length} variant comic{variantComics.length !== 1 ? 's' : ''} in collection
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
              onViewRawComics={onViewRawComics}
              onViewSlabbedComics={onViewSlabbedComics}
            />

            <SeriesBreakdown
              comics={variantComics}
              title="Variant Comics by Series"
              maxItems={8}
              onViewSeries={onViewSeries}
              itemLabel="variant"
            />
          </div>

          {/* Comics Grid/List */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Variant Comics Collection</h3>

            <ComicGridList
              comics={sortedComics}
              viewMode={viewMode}
              onView={onView}
              gridBadges={(comic) => (
                <>
                  <span className="px-1 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded">Variant</span>
                  {comic.isSlabbed && <span className="px-1 py-0.5 bg-purple-500 text-white text-xs font-medium rounded">Slabbed</span>}
                  {comic.signedBy && <span className="px-1 py-0.5 bg-rose-500 text-white text-xs font-medium rounded">Signed</span>}
                </>
              )}
              listBadges={(comic) => (
                <>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded border border-emerald-500/30">Variant</span>
                  {comic.isSlabbed && <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30">Slabbed</span>}
                  {comic.signedBy && <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-xs rounded border border-rose-500/30">Signed</span>}
                </>
              )}
              listExtraInfo={(comic) =>
                comic.coverArtist ? <p className="text-xs text-gray-400">{comic.coverArtist}</p> : null
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const VariantsDetail = React.memo(VariantsDetailInner);

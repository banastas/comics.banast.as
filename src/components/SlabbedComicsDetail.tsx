import React, { useState, useMemo } from 'react';
import { Comic } from '../types/Comic';
import { Dashboard } from './Dashboard';
import { Archive } from 'lucide-react';
import { calculateComicStats } from '../utils/stats';
import { sortComics, DetailSortField } from '../utils/sorting';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { DetailPageHeader } from './DetailPageHeader';
import { ComicGridList } from './ComicGridList';
import { SeriesBreakdown } from './SeriesBreakdown';
import { BreadcrumbItem } from './Breadcrumb';

interface SlabbedComicsDetailProps {
  slabbedComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  onViewSeries?: (seriesName: string) => void;
  breadcrumbItems?: BreadcrumbItem[];
}

const SlabbedComicsDetailInner: React.FC<SlabbedComicsDetailProps> = ({
  slabbedComics,
  onBack,
  onView,
  onViewSeries,
  breadcrumbItems,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<DetailSortField>('series');

  useScrollToTop();

  const stats = useMemo(() => calculateComicStats(slabbedComics), [slabbedComics]);
  const sortedComics = useMemo(() => sortComics(slabbedComics, sortBy), [slabbedComics, sortBy]);
  const uniqueSeriesCount = useMemo(
    () => new Set(slabbedComics.map(c => c.seriesName)).size,
    [slabbedComics]
  );

  const gridBadges = (comic: Comic) => (
    <>
      <span className="px-1 py-0.5 bg-purple-500 text-white text-xs font-medium rounded">Slabbed</span>
      {comic.signedBy && <span className="px-1 py-0.5 bg-rose-500 text-white text-xs font-medium rounded">Signed</span>}
    </>
  );

  const listBadges = (comic: Comic) => (
    <>
      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30">Slabbed</span>
      {comic.signedBy && <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-xs rounded border border-rose-500/30">Signed</span>}
    </>
  );

  return (
    <div className="min-h-screen bg-surface-base">
      <DetailPageHeader
        onBack={onBack}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={(val) => setSortBy(val as DetailSortField)}
        breadcrumbItems={breadcrumbItems}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="bg-surface-primary rounded-lg shadow-lg border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Archive size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Slabbed Comics</h1>
                  <p className="text-slate-300">
                    {slabbedComics.length} slabbed comic{slabbedComics.length !== 1 ? 's' : ''} in collection
                    {uniqueSeriesCount > 0 && (
                      <span className="text-slate-400 ml-2">
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
              hideSlabbedCard={true}
            />

            <SeriesBreakdown
              comics={slabbedComics}
              title="Slabbed Comics by Series"
              maxItems={8}
              onViewSeries={onViewSeries}
            />
          </div>

          <div className="bg-surface-primary rounded-lg shadow-lg border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Slabbed Comics Collection</h3>
            <ComicGridList
              comics={sortedComics}
              viewMode={viewMode}
              onView={onView}
              gridBadges={gridBadges}
              listBadges={listBadges}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SlabbedComicsDetail = React.memo(SlabbedComicsDetailInner);

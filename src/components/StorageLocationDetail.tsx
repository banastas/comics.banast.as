import React, { useState, useMemo } from 'react';
import { Comic } from '../types/Comic';
import { Dashboard } from './Dashboard';
import { DetailPageHeader } from './DetailPageHeader';
import { ComicGridList } from './ComicGridList';
import { SeriesBreakdown } from './SeriesBreakdown';
import { MapPin } from 'lucide-react';
import { calculateComicStats } from '../utils/stats';
import { sortComics, DetailSortField } from '../utils/sorting';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { BreadcrumbItem } from './Breadcrumb';

interface StorageLocationDetailProps {
  storageLocation: string;
  locationComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  onViewSeries?: (seriesName: string) => void;
  breadcrumbItems?: BreadcrumbItem[];
}

const StorageLocationDetailInner: React.FC<StorageLocationDetailProps> = ({
  storageLocation,
  locationComics,
  onBack,
  onView,
  onViewSeries,
  breadcrumbItems,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<DetailSortField>('series');

  useScrollToTop();

  const stats = useMemo(() => calculateComicStats(locationComics), [locationComics]);
  const sortedComics = useMemo(() => sortComics(locationComics, sortBy), [locationComics, sortBy]);
  const uniqueSeriesCount = useMemo(
    () => new Set(locationComics.map(c => c.seriesName)).size,
    [locationComics]
  );

  return (
    <div className="min-h-screen bg-surface-base">
      <DetailPageHeader
        onBack={onBack}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={(s) => setSortBy(s as DetailSortField)}
        breadcrumbItems={breadcrumbItems}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Storage Location Header and Statistics */}
          <div className="bg-surface-primary rounded-lg shadow-lg border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-500 rounded-lg">
                  <MapPin size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Virtual Box: {storageLocation}</h1>
                  <p className="text-slate-300">
                    {locationComics.length} comic{locationComics.length !== 1 ? 's' : ''} stored here
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
            />

            <SeriesBreakdown
              comics={locationComics}
              title="Series in this Virtual Box"
              onViewSeries={onViewSeries}
            />
          </div>

          {/* Comics Grid/List */}
          <div className="bg-surface-primary rounded-lg shadow-lg border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Comics in Virtual Box: {storageLocation}</h3>
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
};

export const StorageLocationDetail = React.memo(StorageLocationDetailInner);

import React from 'react';
import { Comic } from '../types/Comic';
import { DetailPageLayout } from './DetailPageLayout';
import { SeriesBreakdown } from './SeriesBreakdown';
import { MapPin } from 'lucide-react';
import { BreadcrumbItem } from './Breadcrumb';

interface StorageLocationDetailProps {
  storageLocation: string;
  locationComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  onViewSeries?: (seriesName: string) => void;
  breadcrumbItems?: BreadcrumbItem[];
}

export const StorageLocationDetail: React.FC<StorageLocationDetailProps> = React.memo(({
  storageLocation,
  locationComics,
  onBack,
  onView,
  onViewSeries,
  breadcrumbItems,
}) => {
  const uniqueSeriesCount = new Set(locationComics.map(c => c.seriesName)).size;

  return (
    <DetailPageLayout
      comics={locationComics}
      onBack={onBack}
      onView={onView}
      breadcrumbItems={breadcrumbItems}
      icon={<MapPin size={24} className="text-white" />}
      iconBgColor="bg-orange-500"
      title={`Virtual Box: ${storageLocation}`}
      subtitle={
        <>
          {locationComics.length} comic{locationComics.length !== 1 ? 's' : ''} stored here
          {uniqueSeriesCount > 0 && (
            <span className="text-slate-400 ml-2">
              &bull; {uniqueSeriesCount} series
            </span>
          )}
        </>
      }
      comicsListTitle={`Comics in Virtual Box: ${storageLocation}`}
      afterDashboard={
        <SeriesBreakdown
          comics={locationComics}
          title="Series in this Virtual Box"
          onViewSeries={onViewSeries}
        />
      }
    />
  );
});

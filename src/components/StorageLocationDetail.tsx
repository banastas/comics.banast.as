import React from 'react';
import { MapPin } from 'lucide-react';
import type { Comic } from '../types/Comic';
import { DetailPageLayout } from './DetailPageLayout';
import { SEO } from './SEO';
import { SeriesBreakdown } from './SeriesBreakdown';
import type { BreadcrumbItem } from './Breadcrumb';
import { generateCollectionPageStructuredData } from '../utils/structured-data';
import { absoluteUrl, storagePath } from '../utils/paths';
import { seriesCountLabel } from './detailText';

interface StorageLocationDetailProps {
  storageLocation: string;
  locationComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  breadcrumbItems?: BreadcrumbItem[];
}

export const StorageLocationDetail: React.FC<StorageLocationDetailProps> = React.memo(({
  storageLocation,
  locationComics,
  onBack,
  onView,
  breadcrumbItems,
}) => {
  const uniqueSeriesCount = new Set(locationComics.map(c => c.seriesName)).size;
  const url = absoluteUrl(storagePath(storageLocation));
  const title = `${storageLocation} Storage`;

  return (
    <DetailPageLayout
      seo={
        <SEO
          title={title}
          description={`Browse ${locationComics.length} comics stored in ${storageLocation}.`}
          keywords={`${storageLocation}, comic storage, virtual box, comic collection organization`}
          url={url}
          canonical={url}
          structuredData={generateCollectionPageStructuredData({ name: title, url, comics: locationComics })}
        />
      }
      comics={locationComics}
      onBack={onBack}
      onView={onView}
      breadcrumbItems={breadcrumbItems}
      icon={<MapPin size={24} className="text-white" />}
      iconBgColor="bg-orange-600"
      title={`Box ${storageLocation}`}
      subtitle={`Virtual box · ${seriesCountLabel(locationComics.length, 'comic', uniqueSeriesCount)}`}
      defaultSortBy="series"
      comicsListTitle={`Comics in ${storageLocation}`}
      afterDashboard={<SeriesBreakdown comics={locationComics} title="Series in this box" maxItems={12} />}
    />
  );
});

StorageLocationDetail.displayName = 'StorageLocationDetail';

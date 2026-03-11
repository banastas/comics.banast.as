import React from 'react';
import { Comic } from '../types/Comic';
import { DetailPageLayout } from './DetailPageLayout';
import { SeriesBreakdown } from './SeriesBreakdown';
import { Palette } from 'lucide-react';
import { BreadcrumbItem } from './Breadcrumb';

interface CoverArtistDetailProps {
  coverArtist: string;
  artistComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  onViewSeries?: (seriesName: string) => void;
  breadcrumbItems?: BreadcrumbItem[];
}

export const CoverArtistDetail: React.FC<CoverArtistDetailProps> = React.memo(({
  coverArtist,
  artistComics,
  onBack,
  onView,
  onViewSeries,
  breadcrumbItems,
}) => {
  const uniqueSeriesCount = new Set(artistComics.map(c => c.seriesName)).size;

  return (
    <DetailPageLayout
      comics={artistComics}
      onBack={onBack}
      onView={onView}
      breadcrumbItems={breadcrumbItems}
      icon={<Palette size={24} className="text-white" />}
      iconBgColor="bg-purple-500"
      title={coverArtist}
      subtitle={
        <>
          {artistComics.length} comic{artistComics.length !== 1 ? 's' : ''} with cover art
          {uniqueSeriesCount > 0 && (
            <span className="text-slate-400 ml-2">
              &bull; {uniqueSeriesCount} series
            </span>
          )}
        </>
      }
      comicsListTitle={`Comics with ${coverArtist} Cover Art`}
      afterDashboard={
        <SeriesBreakdown
          comics={artistComics}
          title={`Series with ${coverArtist} Cover Art`}
          onViewSeries={onViewSeries}
        />
      }
    />
  );
});

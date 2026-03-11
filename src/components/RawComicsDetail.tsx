import React from 'react';
import { Comic } from '../types/Comic';
import { DetailPageLayout } from './DetailPageLayout';
import { SeriesBreakdown } from './SeriesBreakdown';
import { BookOpen } from 'lucide-react';
import { BreadcrumbItem } from './Breadcrumb';

interface RawComicsDetailProps {
  rawComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  onViewSeries?: (seriesName: string) => void;
  breadcrumbItems?: BreadcrumbItem[];
}

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

const RawComicsDetailComponent: React.FC<RawComicsDetailProps> = ({
  rawComics,
  onBack,
  onView,
  onViewSeries,
  breadcrumbItems,
}) => {
  const uniqueSeriesCount = new Set(rawComics.map(c => c.seriesName)).size;

  return (
    <DetailPageLayout
      comics={rawComics}
      onBack={onBack}
      onView={onView}
      breadcrumbItems={breadcrumbItems}
      icon={<BookOpen size={24} className="text-white" />}
      iconBgColor="bg-indigo-500"
      title="Raw Comics"
      subtitle={
        <>
          {rawComics.length} raw comic{rawComics.length !== 1 ? 's' : ''} in collection
          {uniqueSeriesCount > 0 && (
            <span className="text-slate-400 ml-2">
              &bull; {uniqueSeriesCount} series
            </span>
          )}
        </>
      }
      dashboardProps={{ hideRawCard: true }}
      comicsListTitle="Raw Comics Collection"
      gridBadges={gridBadges}
      listBadges={listBadges}
      listExtraInfo={listExtraInfo}
      afterDashboard={
        <SeriesBreakdown
          comics={rawComics}
          title="Raw Comics by Series"
          maxItems={8}
          onViewSeries={onViewSeries}
        />
      }
    />
  );
};

export const RawComicsDetail = React.memo(RawComicsDetailComponent);

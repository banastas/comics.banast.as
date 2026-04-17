import React from 'react';
import { Comic } from '../types/Comic';
import { DetailPageLayout } from './DetailPageLayout';
import { SEO } from './SEO';
import { SeriesBreakdown } from './SeriesBreakdown';
import { Archive } from 'lucide-react';
import { BreadcrumbItem } from './Breadcrumb';

interface SlabbedComicsDetailProps {
  slabbedComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  onViewSeries?: (seriesName: string) => void;
  breadcrumbItems?: BreadcrumbItem[];
}

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

const SlabbedComicsDetailInner: React.FC<SlabbedComicsDetailProps> = ({
  slabbedComics,
  onBack,
  onView,
  onViewSeries,
  breadcrumbItems,
}) => {
  const uniqueSeriesCount = new Set(slabbedComics.map(c => c.seriesName)).size;

  return (
    <DetailPageLayout
      seo={
        <SEO
          title="Slabbed Comics"
          description={`Browse ${slabbedComics.length} slabbed (graded) comics across ${uniqueSeriesCount} series.`}
          keywords="slabbed comics, graded comics, CGC, CBCS, comic book collection"
          url="https://comics.banast.as/#/slabbed"
          canonical="https://comics.banast.as/#/slabbed"
        />
      }
      comics={slabbedComics}
      onBack={onBack}
      onView={onView}
      breadcrumbItems={breadcrumbItems}
      icon={<Archive size={24} className="text-white" />}
      iconBgColor="bg-purple-500"
      title="Slabbed Comics"
      subtitle={
        <>
          {slabbedComics.length} slabbed comic{slabbedComics.length !== 1 ? 's' : ''} in collection
          {uniqueSeriesCount > 0 && (
            <span className="text-slate-400 ml-2">
              &bull; {uniqueSeriesCount} series
            </span>
          )}
        </>
      }
      dashboardProps={{ hideSlabbedCard: true }}
      comicsListTitle="Slabbed Comics Collection"
      gridBadges={gridBadges}
      listBadges={listBadges}
      afterDashboard={
        <SeriesBreakdown
          comics={slabbedComics}
          title="Slabbed Comics by Series"
          maxItems={8}
          onViewSeries={onViewSeries}
        />
      }
    />
  );
};

export const SlabbedComicsDetail = React.memo(SlabbedComicsDetailInner);

import React from 'react';
import { Comic } from '../types/Comic';
import { DetailPageLayout } from './DetailPageLayout';
import { SEO } from './SEO';
import { SeriesBreakdown } from './SeriesBreakdown';
import { Award } from 'lucide-react';
import { BreadcrumbItem } from './Breadcrumb';

interface VariantsDetailProps {
  variantComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  onViewSeries?: (seriesName: string) => void;
  onViewRawComics?: () => void;
  onViewSlabbedComics?: () => void;
  breadcrumbItems?: BreadcrumbItem[];
}

const VariantsDetailInner: React.FC<VariantsDetailProps> = ({
  variantComics,
  onBack,
  onView,
  onViewSeries,
  onViewRawComics,
  onViewSlabbedComics,
  breadcrumbItems,
}) => {
  const uniqueSeriesCount = new Set(variantComics.map(c => c.seriesName)).size;

  return (
    <DetailPageLayout
      seo={
        <SEO
          title="Variant Comics"
          description={`Browse ${variantComics.length} variant cover comics across ${uniqueSeriesCount} series.`}
          keywords="variant comics, variant covers, exclusive covers, comic book collection"
          url="https://comics.banast.as/#/variants"
          canonical="https://comics.banast.as/#/variants"
        />
      }
      comics={variantComics}
      onBack={onBack}
      onView={onView}
      breadcrumbItems={breadcrumbItems}
      icon={<Award size={24} className="text-white" />}
      iconBgColor="bg-emerald-500"
      title="Variant Comics"
      subtitle={
        <>
          {variantComics.length} variant comic{variantComics.length !== 1 ? 's' : ''} in collection
          {uniqueSeriesCount > 0 && (
            <span className="text-slate-400 ml-2">
              &bull; {uniqueSeriesCount} series
            </span>
          )}
        </>
      }
      dashboardProps={{ onViewRawComics, onViewSlabbedComics }}
      comicsListTitle="Variant Comics Collection"
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
        comic.coverArtist ? <p className="text-xs text-slate-400">{comic.coverArtist}</p> : null
      }
      afterDashboard={
        <SeriesBreakdown
          comics={variantComics}
          title="Variant Comics by Series"
          maxItems={8}
          onViewSeries={onViewSeries}
          itemLabel="variant"
        />
      }
    />
  );
};

export const VariantsDetail = React.memo(VariantsDetailInner);

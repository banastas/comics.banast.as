import React from 'react';
import { Palette } from 'lucide-react';
import type { Comic } from '../types/Comic';
import { DetailPageLayout } from './DetailPageLayout';
import { SEO } from './SEO';
import { SeriesBreakdown } from './SeriesBreakdown';
import type { BreadcrumbItem } from './Breadcrumb';
import { generateArtistStructuredData } from '../utils/structured-data';
import { artistPath, absoluteUrl } from '../utils/paths';
import { seriesCountLabel } from './detailText';

interface CoverArtistDetailProps {
  coverArtist: string;
  artistComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  breadcrumbItems?: BreadcrumbItem[];
}

export const CoverArtistDetail: React.FC<CoverArtistDetailProps> = React.memo(({
  coverArtist,
  artistComics,
  onBack,
  onView,
  breadcrumbItems,
}) => {
  const uniqueSeriesCount = new Set(artistComics.map(c => c.seriesName)).size;
  const url = absoluteUrl(artistPath(coverArtist));

  return (
    <DetailPageLayout
      seo={
        <SEO
          title={`${coverArtist} - Cover Artist`}
          description={`Browse ${artistComics.length} comics with cover art by ${coverArtist}.`}
          keywords={`${coverArtist}, comic book cover artist, ${coverArtist} comics, comic art`}
          url={url}
          canonical={url}
          structuredData={generateArtistStructuredData({ name: coverArtist, url })}
        />
      }
      comics={artistComics}
      onBack={onBack}
      onView={onView}
      breadcrumbItems={breadcrumbItems}
      icon={<Palette size={24} className="text-white" />}
      iconBgColor="bg-purple-600"
      title={coverArtist}
      subtitle={`Cover artist · ${seriesCountLabel(artistComics.length, 'cover', uniqueSeriesCount)}`}
      comicsListTitle={`Covers by ${coverArtist}`}
      afterDashboard={<SeriesBreakdown comics={artistComics} title="Series" maxItems={12} />}
    />
  );
});

CoverArtistDetail.displayName = 'CoverArtistDetail';

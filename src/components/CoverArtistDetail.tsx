import React from 'react';
import { Comic } from '../types/Comic';
import { DetailPageLayout } from './DetailPageLayout';
import { SEO } from './SEO';
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
  const artistUrl = `https://comics.banast.as/#/artist/${encodeURIComponent(coverArtist)}`;

  return (
    <DetailPageLayout
      seo={
        <SEO
          title={`${coverArtist} - Cover Artist`}
          description={`Browse ${artistComics.length} comics with cover art by ${coverArtist}${uniqueSeriesCount > 0 ? ` across ${uniqueSeriesCount} series` : ''}.`}
          keywords={`${coverArtist}, comic book cover artist, ${coverArtist} comics, comic art`}
          url={artistUrl}
          canonical={artistUrl}
          structuredData={{
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: coverArtist,
            jobTitle: 'Comic Book Cover Artist',
            url: artistUrl,
          }}
        />
      }
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

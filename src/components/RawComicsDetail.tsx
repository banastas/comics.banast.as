import React from 'react';
import { BookOpen } from 'lucide-react';
import type { Comic } from '../types/Comic';
import { DetailPageLayout } from './DetailPageLayout';
import { SEO } from './SEO';
import { SeriesBreakdown } from './SeriesBreakdown';
import type { BreadcrumbItem } from './Breadcrumb';
import { generateCollectionPageStructuredData } from '../utils/structured-data';
import { seriesCountLabel } from './detailText';

interface RawComicsDetailProps {
  rawComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  breadcrumbItems?: BreadcrumbItem[];
}

const RawComicsDetailComponent: React.FC<RawComicsDetailProps> = ({ rawComics, onBack, onView, breadcrumbItems }) => {
  const uniqueSeriesCount = new Set(rawComics.map(c => c.seriesName)).size;
  const url = 'https://comics.banast.as/raw';

  return (
    <DetailPageLayout
      seo={
        <SEO
          title="Raw Comics"
          description={`Browse ${rawComics.length} raw comics in the collection.`}
          keywords="raw comics, ungraded comics, comic book collection, non-slabbed comics"
          url={url}
          canonical={url}
          structuredData={generateCollectionPageStructuredData({ name: 'Raw Comics', url, comics: rawComics })}
        />
      }
      comics={rawComics}
      onBack={onBack}
      onView={onView}
      breadcrumbItems={breadcrumbItems}
      icon={<BookOpen size={24} className="text-white" />}
      iconBgColor="bg-indigo-600"
      title="Raw Comics"
      subtitle={seriesCountLabel(rawComics.length, 'raw comic', uniqueSeriesCount)}
      comicsListTitle="Raw comics"
      afterDashboard={<SeriesBreakdown comics={rawComics} title="Raw comics by series" maxItems={8} />}
    />
  );
};

export const RawComicsDetail = React.memo(RawComicsDetailComponent);

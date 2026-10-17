import React from 'react';
import { Archive } from 'lucide-react';
import type { Comic } from '../types/Comic';
import { DetailPageLayout } from './DetailPageLayout';
import { SEO } from './SEO';
import { SeriesBreakdown } from './SeriesBreakdown';
import type { BreadcrumbItem } from './Breadcrumb';
import { generateCollectionPageStructuredData } from '../utils/structured-data';
import { seriesCountLabel } from './detailText';

interface SlabbedComicsDetailProps {
  slabbedComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  breadcrumbItems?: BreadcrumbItem[];
}

const SlabbedComicsDetailInner: React.FC<SlabbedComicsDetailProps> = ({ slabbedComics, onBack, onView, breadcrumbItems }) => {
  const uniqueSeriesCount = new Set(slabbedComics.map(c => c.seriesName)).size;
  const url = 'https://comics.banast.as/slabbed';

  return (
    <DetailPageLayout
      seo={
        <SEO
          title="Slabbed Comics"
          description={`Browse ${slabbedComics.length} slabbed comics in the collection.`}
          keywords="slabbed comics, graded comics, CGC comics, comic book collection"
          url={url}
          canonical={url}
          structuredData={generateCollectionPageStructuredData({ name: 'Slabbed Comics', url, comics: slabbedComics })}
        />
      }
      comics={slabbedComics}
      onBack={onBack}
      onView={onView}
      breadcrumbItems={breadcrumbItems}
      icon={<Archive size={24} className="text-white" />}
      iconBgColor="bg-purple-600"
      title="Slabbed Comics"
      subtitle={seriesCountLabel(slabbedComics.length, 'slabbed comic', uniqueSeriesCount)}
      defaultSortBy="value"
      comicsListTitle="Slabbed comics"
      afterDashboard={<SeriesBreakdown comics={slabbedComics} title="Slabbed comics by series" maxItems={8} />}
    />
  );
};

export const SlabbedComicsDetail = React.memo(SlabbedComicsDetailInner);

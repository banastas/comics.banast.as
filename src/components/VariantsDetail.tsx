import React from 'react';
import { Layers } from 'lucide-react';
import type { Comic } from '../types/Comic';
import { DetailPageLayout } from './DetailPageLayout';
import { SEO } from './SEO';
import { SeriesBreakdown } from './SeriesBreakdown';
import type { BreadcrumbItem } from './Breadcrumb';
import { generateCollectionPageStructuredData } from '../utils/structured-data';
import { seriesCountLabel } from './detailText';

interface VariantsDetailProps {
  variantComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  breadcrumbItems?: BreadcrumbItem[];
}

const VariantsDetailInner: React.FC<VariantsDetailProps> = ({ variantComics, onBack, onView, breadcrumbItems }) => {
  const uniqueSeriesCount = new Set(variantComics.map(c => c.seriesName)).size;
  const url = 'https://comics.banast.as/variants';

  return (
    <DetailPageLayout
      seo={
        <SEO
          title="Variant Covers"
          description={`Browse ${variantComics.length} variant covers in the collection.`}
          keywords="variant comics, variant covers, exclusive covers, comic book collection"
          url={url}
          canonical={url}
          structuredData={generateCollectionPageStructuredData({ name: 'Variant Covers', url, comics: variantComics })}
        />
      }
      comics={variantComics}
      onBack={onBack}
      onView={onView}
      breadcrumbItems={breadcrumbItems}
      icon={<Layers size={24} className="text-white" />}
      iconBgColor="bg-orange-600"
      title="Variant Covers"
      subtitle={seriesCountLabel(variantComics.length, 'variant cover', uniqueSeriesCount)}
      comicsListTitle="Variant covers"
      afterDashboard={<SeriesBreakdown comics={variantComics} title="Variant covers by series" maxItems={8} itemLabel="variant" />}
    />
  );
};

export const VariantsDetail = React.memo(VariantsDetailInner);

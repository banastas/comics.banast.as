import React, { useMemo } from 'react';
import type { Comic } from '../types/Comic';
import { SEO } from './SEO';
import { generateSeriesStructuredData } from '../utils/structured-data';
import { DetailPageLayout } from './DetailPageLayout';
import { calculateComicStats } from '../utils/stats';
import type { BreadcrumbItem } from './Breadcrumb';
import { absoluteUrl, seriesPath } from '../utils/paths';
import { plural } from './detailText';

interface SeriesDetailProps {
  seriesName: string;
  seriesComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  breadcrumbItems?: BreadcrumbItem[];
}

const seriesSortOptions = [
  { value: 'issue', label: 'Sort by Issue #' },
  { value: 'grade', label: 'Sort by Grade' },
  { value: 'value', label: 'Sort by Value' },
  { value: 'dateDesc', label: 'Release Date: Newest' },
  { value: 'dateAsc', label: 'Release Date: Oldest' },
];

export const SeriesDetail: React.FC<SeriesDetailProps> = React.memo(({
  seriesName,
  seriesComics,
  onBack,
  onView,
  breadcrumbItems,
}) => {
  const issueNumbers = seriesComics.map(comic => comic.issueNumber).sort((a, b) => a - b);
  const lowestIssue = issueNumbers[0];
  const highestIssue = issueNumbers[issueNumbers.length - 1];
  const hasRange = seriesComics.length > 1 && lowestIssue !== highestIssue;
  const stats = useMemo(() => calculateComicStats(seriesComics), [seriesComics]);
  const url = absoluteUrl(seriesPath(seriesName));

  return (
    <DetailPageLayout
      comics={seriesComics}
      onBack={onBack}
      onView={onView}
      breadcrumbItems={breadcrumbItems}
      icon={null}
      iconBgColor=""
      title={seriesName}
      subtitle={
        <>
          {plural(seriesComics.length, 'issue')} in the collection
          {hasRange && <span className="ml-2 text-slate-400">(#{lowestIssue}–#{highestIssue})</span>}
        </>
      }
      defaultSortBy="issue"
      sortOptions={seriesSortOptions}
      comicsListTitle="Issues"
      showSeriesName={false}
      seo={
        <SEO
          title={`${seriesName} Series`}
          description={`Browse ${seriesComics.length} comics from the ${seriesName} series in the collection.`}
          keywords={`${seriesName}, comic book series, comic collection, ${seriesName} comics`}
          url={url}
          structuredData={generateSeriesStructuredData({
            name: seriesName,
            comics: seriesComics,
            totalValue: stats.totalCurrentValue,
          })}
          canonical={url}
        />
      }
    />
  );
});

SeriesDetail.displayName = 'SeriesDetail';

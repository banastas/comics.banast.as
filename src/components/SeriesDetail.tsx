import React from 'react';
import { Comic } from '../types/Comic';
import { SEO, generateSeriesStructuredData } from './SEO';
import { DetailPageLayout } from './DetailPageLayout';
import { calculateComicStats } from '../utils/stats';
import { BreadcrumbItem } from './Breadcrumb';

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
  { value: 'date', label: 'Sort by Release Date' },
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
  const stats = calculateComicStats(seriesComics);

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
          {seriesComics.length} issue{seriesComics.length !== 1 ? 's' : ''} in collection
          {lowestIssue && highestIssue && (
            <span className="text-slate-400 ml-2">
              (#{lowestIssue} - #{highestIssue})
            </span>
          )}
        </>
      }
      defaultSortBy="issue"
      sortOptions={seriesSortOptions}
      comicsListTitle="Issues in Collection"
      showSeriesName={false}
      seo={
        <SEO
          title={`${seriesName} Series`}
          description={`Browse ${seriesComics.length} comics from the ${seriesName} series. Total value: $${stats.totalCurrentValue.toFixed(0)}. Issues ${lowestIssue}-${highestIssue}.`}
          keywords={`${seriesName}, comic book series, comic collection, ${seriesName} comics`}
          url={`https://comics.banast.as/#/series/${encodeURIComponent(seriesName)}`}
          structuredData={generateSeriesStructuredData({
            name: seriesName,
            comics: seriesComics,
            totalValue: stats.totalCurrentValue,
          })}
          canonical={`https://comics.banast.as/#/series/${encodeURIComponent(seriesName)}`}
        />
      }
    />
  );
});

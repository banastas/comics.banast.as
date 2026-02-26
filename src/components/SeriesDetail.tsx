import React, { useState } from 'react';
import { Comic } from '../types/Comic';
import { Dashboard } from './Dashboard';
import { SEO, generateSeriesStructuredData } from './SEO';
import { DetailPageHeader } from './DetailPageHeader';
import { ComicGridList } from './ComicGridList';
import { calculateComicStats } from '../utils/stats';
import { sortComics, DetailSortField } from '../utils/sorting';
import { useScrollToTop } from '../hooks/useScrollToTop';

interface SeriesDetailProps {
  seriesName: string;
  seriesComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
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
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<DetailSortField>('issue');

  useScrollToTop();

  const stats = calculateComicStats(seriesComics);

  // Find highest and lowest issue numbers
  const issueNumbers = seriesComics.map(comic => comic.issueNumber).sort((a, b) => a - b);
  const lowestIssue = issueNumbers[0];
  const highestIssue = issueNumbers[issueNumbers.length - 1];

  const sortedComics = sortComics(seriesComics, sortBy);

  return (
    <div className="min-h-screen bg-surface-base">
      {/* SEO Meta Tags */}
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

      {/* Header */}
      <DetailPageHeader
        onBack={onBack}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={(value) => setSortBy(value as DetailSortField)}
        sortOptions={seriesSortOptions}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Series Header and Statistics */}
          <div className="bg-surface-primary rounded-lg shadow-lg border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{seriesName}</h1>
                <p className="text-slate-300">
                  {seriesComics.length} issue{seriesComics.length !== 1 ? 's' : ''} in collection
                  {lowestIssue && highestIssue && (
                    <span className="text-slate-400 ml-2">
                      (#{lowestIssue} - #{highestIssue})
                    </span>
                  )}
                </p>
              </div>
            </div>

            <Dashboard
              stats={stats}
              showDetailed={true}
              onViewComic={onView}
            />
          </div>

          {/* Issues Grid/List */}
          <div className="bg-surface-primary rounded-lg shadow-lg border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Issues in Collection</h3>
            <ComicGridList
              comics={sortedComics}
              viewMode={viewMode}
              onView={onView}
              showSeriesName={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

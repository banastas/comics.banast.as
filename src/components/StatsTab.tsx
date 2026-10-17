import React from 'react';
import { Trophy } from 'lucide-react';
import { AcquisitionTimeline } from './AcquisitionTimeline';
import { CollectionHealth } from './CollectionHealth';
import { CollectorInsights } from './CollectorInsights';
import { PerformanceHighlights, PortfolioOverview } from './Dashboard';
import { GradeDistribution } from './GradeDistribution';
import type { Comic, ComicStats } from '../types/Comic';
import type { SeriesCountSummary, SeriesPerformance, StorageLocationSummary } from '../utils/collection-analytics';
import { formatComicLabel, formatCurrency, formatDate, formatPercentage, formatWholeCurrency } from '../utils/formatting';
import { SiteLink } from './SiteLink';
import { CoverImage } from './CoverImage';

interface StatsTabProps {
  stats: ComicStats;
  allComics: Comic[];
  allSeriesCount: number;
  allVirtualBoxesCount: number;
  variantsCount: number;
  top10Comics: Comic[];
  seriesPerformance: SeriesPerformance[];
  seriesCountSummaries: SeriesCountSummary[];
  storageLocationSummaries: StorageLocationSummary[];
  showAllSeriesPerf: boolean;
  showAllSeriesCount: boolean;
  onToggleSeriesPerf: () => void;
  onToggleSeriesCount: () => void;
  onViewComic: (comic: Comic) => void;
}

const panelClass = 'rounded-xl border border-slate-800 bg-surface-primary p-5 sm:p-6';
const rowLinkClass = 'flex items-center justify-between gap-3 rounded-lg p-2.5 transition-colors hover:bg-surface-secondary/60';

const ShowMoreButton: React.FC<{ expanded: boolean; total: number; onClick: () => void }> = ({ expanded, total, onClick }) => (
  <button onClick={onClick} aria-expanded={expanded} className="w-full py-2 text-center text-sm text-blue-300 transition-colors hover:text-blue-200">
    {expanded ? 'Show fewer' : `Show all ${total}`}
  </button>
);

export const StatsTab = ({
  stats,
  allComics,
  allSeriesCount,
  allVirtualBoxesCount,
  variantsCount,
  top10Comics,
  seriesPerformance,
  seriesCountSummaries,
  storageLocationSummaries,
  showAllSeriesPerf,
  showAllSeriesCount,
  onToggleSeriesPerf,
  onToggleSeriesCount,
}: StatsTabProps) => {
  const recentAdditions = [...allComics]
    .sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  return (
    <div className="animate-fade-in space-y-6 pt-5 sm:pt-7">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Collection Statistics</h1>
        <p className="mt-1 text-sm text-slate-300 sm:text-base">
          {stats.totalComics.toLocaleString('en-US')} comics across {allSeriesCount.toLocaleString('en-US')} series and {allVirtualBoxesCount} boxes.
        </p>
      </div>

      <PortfolioOverview stats={stats} variantsCount={variantsCount} />

      <section aria-labelledby="highlights-heading" className="space-y-4">
        <h2 id="highlights-heading" className="sr-only">Highlights</h2>
        <PerformanceHighlights stats={stats} />
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <GradeDistribution comics={allComics} />
        <AcquisitionTimeline comics={allComics} />
        <CollectorInsights comics={allComics} />
        <CollectionHealth comics={allComics} />
      </div>

      {top10Comics.length > 0 && (
        <section aria-labelledby="top-value-heading" className={panelClass}>
          <h2 id="top-value-heading" className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
            <Trophy size={18} className="text-amber-400" aria-hidden="true" />
            Top 10 most valuable
          </h2>
          <ol className="space-y-1">
            {top10Comics.map((comic, i) => (
              <li key={comic.id}>
                <SiteLink to={{ type: 'comic', comic }} className={`${rowLinkClass} justify-start sm:gap-4`}>
                  <span className="w-7 text-right text-lg font-bold tabular-nums text-slate-400">{i + 1}</span>
                  <span className="h-11 w-8 flex-shrink-0 overflow-hidden rounded bg-surface-secondary">
                    <CoverImage comic={comic} displayWidth={32} sizes="32px" decorative compact />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-white">{formatComicLabel(comic)}</span>
                    <span className="block text-xs text-slate-400">Grade {comic.grade} · {comic.isSlabbed ? 'Slabbed' : 'Raw'}</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-white">{formatCurrency(comic.currentValue ?? 0)}</span>
                </SiteLink>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {seriesPerformance.length > 0 && (
          <section aria-labelledby="series-performance-heading" className={panelClass}>
            <h2 id="series-performance-heading" className="text-base font-semibold text-white">Series performance</h2>
            <p className="mb-4 mt-1 text-xs text-slate-400">Return on comics with both a recorded price and current value, largest change first.</p>
            <ul className="space-y-1">
              {seriesPerformance.slice(0, showAllSeriesPerf ? undefined : 8).map((series) => (
                <li key={series.name}>
                  <SiteLink to={{ type: 'series', name: series.name }} className={rowLinkClass}>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">{series.name}</span>
                      <span className="block text-xs text-slate-400">Based on {series.countWithKnownReturn} of {series.count} comics</span>
                    </span>
                    <span className="flex-shrink-0 text-right">
                      <span className="block text-sm font-semibold tabular-nums text-white">{formatWholeCurrency(series.currentValue)}</span>
                      <span className={`block text-xs font-medium tabular-nums ${series.gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {series.gainLoss >= 0 ? '+' : '-'}{formatCurrency(Math.abs(series.gainLoss))} ({formatPercentage(series.gainLossPercentage)})
                      </span>
                    </span>
                  </SiteLink>
                </li>
              ))}
            </ul>
            {seriesPerformance.length > 8 && <ShowMoreButton expanded={showAllSeriesPerf} total={seriesPerformance.length} onClick={onToggleSeriesPerf} />}
          </section>
        )}

        <section aria-labelledby="series-count-heading" className={panelClass}>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 id="series-count-heading" className="text-base font-semibold text-white">Largest series</h2>
            <span className="text-xs text-slate-400">Current value</span>
          </div>
          {seriesCountSummaries.length > 0 ? (
            <>
              <ul className="space-y-1">
                {seriesCountSummaries.slice(0, showAllSeriesCount ? undefined : 10).map((series) => (
                  <li key={series.name}>
                    <SiteLink to={{ type: 'series', name: series.name }} className={rowLinkClass}>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-white">{series.name}</span>
                        <span className="block text-xs text-slate-400">{series.count} comics</span>
                      </span>
                      <span className="flex-shrink-0 text-sm font-semibold tabular-nums text-white">{formatWholeCurrency(series.value)}</span>
                    </SiteLink>
                  </li>
                ))}
              </ul>
              {seriesCountSummaries.length > 10 && <ShowMoreButton expanded={showAllSeriesCount} total={seriesCountSummaries.length} onClick={onToggleSeriesCount} />}
            </>
          ) : (
            <p className="text-sm text-slate-400">No series yet.</p>
          )}
        </section>

        <section aria-labelledby="recent-heading" className={panelClass}>
          <h2 id="recent-heading" className="mb-4 text-base font-semibold text-white">Recent additions</h2>
          {recentAdditions.length > 0 ? (
            <ul className="space-y-1">
              {recentAdditions.map((comic) => (
                <li key={comic.id}>
                  <SiteLink to={{ type: 'comic', comic }} className={rowLinkClass}>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">{formatComicLabel(comic)}</span>
                      <span className="block truncate text-xs text-slate-400">
                        Purchased {formatDate(comic.purchaseDate)}{comic.coverArtist ? ` · ${comic.coverArtist}` : ''}
                      </span>
                    </span>
                    <span className="flex-shrink-0 text-right">
                      <span className="block text-sm font-semibold tabular-nums text-white">
                        {comic.purchasePrice === undefined ? <span className="text-xs font-normal text-slate-400">Price not recorded</span> : `Paid ${formatCurrency(comic.purchasePrice)}`}
                      </span>
                      {comic.currentValue !== undefined && comic.currentValue !== comic.purchasePrice && (
                        <span className="block text-xs tabular-nums text-slate-300">Now {formatCurrency(comic.currentValue)}</span>
                      )}
                    </span>
                  </SiteLink>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No comics added yet.</p>
          )}
        </section>

        <section aria-labelledby="boxes-summary-heading" className={panelClass}>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 id="boxes-summary-heading" className="text-base font-semibold text-white">Virtual boxes</h2>
            <SiteLink to={{ type: 'boxes' }} className="text-sm text-blue-300 hover:text-blue-200">View all</SiteLink>
          </div>
          {storageLocationSummaries.length > 0 ? (
            <ul className="space-y-1">
              {storageLocationSummaries.slice(0, 8).map((location) => (
                <li key={location.name}>
                  <SiteLink to={{ type: 'storage', name: location.name }} className={rowLinkClass}>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">{location.name}</span>
                      <span className="block text-xs text-slate-400">{location.count} comics</span>
                    </span>
                    <span className="flex-shrink-0 text-sm font-semibold tabular-nums text-white">{formatCurrency(location.value)}</span>
                  </SiteLink>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No storage boxes recorded.</p>
          )}
        </section>
      </div>
    </div>
  );
};

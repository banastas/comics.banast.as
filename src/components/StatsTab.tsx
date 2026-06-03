import { Trophy } from 'lucide-react';
import { AcquisitionTimeline } from './AcquisitionTimeline';
import { CollectionHealth } from './CollectionHealth';
import { CollectorInsights } from './CollectorInsights';
import { Dashboard } from './Dashboard';
import { GradeDistribution } from './GradeDistribution';
import type { Comic, ComicStats } from '../types/Comic';
import type { SeriesCountSummary, SeriesPerformance, StorageLocationSummary } from '../utils/collection-analytics';
import { formatCurrency } from '../utils/formatting';

interface StatsTabProps {
  stats: ComicStats;
  allComics: Comic[];
  allSeriesCount: number;
  allVirtualBoxesCount: number;
  variantsCount: number;
  selectedCondition: 'raw' | 'slabbed' | 'variants' | null;
  top10Comics: Comic[];
  seriesPerformance: SeriesPerformance[];
  valuedSeriesCount: number;
  seriesCountSummaries: SeriesCountSummary[];
  storageLocationSummaries: StorageLocationSummary[];
  showAllSeriesPerf: boolean;
  showAllSeriesCount: boolean;
  onToggleSeriesPerf: () => void;
  onToggleSeriesCount: () => void;
  onViewComic: (comic: Comic) => void;
  onViewSeries: (seriesName: string) => void;
  onViewStorageLocation: (storageLocation: string) => void;
  onViewRawComics: () => void;
  onViewSlabbedComics: () => void;
  onViewVariants: () => void;
  onViewVirtualBoxes: () => void;
}

export const StatsTab = ({
  stats,
  allComics,
  allSeriesCount,
  allVirtualBoxesCount,
  variantsCount,
  selectedCondition,
  top10Comics,
  seriesPerformance,
  valuedSeriesCount,
  seriesCountSummaries,
  storageLocationSummaries,
  showAllSeriesPerf,
  showAllSeriesCount,
  onToggleSeriesPerf,
  onToggleSeriesCount,
  onViewComic,
  onViewSeries,
  onViewStorageLocation,
  onViewRawComics,
  onViewSlabbedComics,
  onViewVariants,
  onViewVirtualBoxes,
}: StatsTabProps) => (
  <div className="space-y-6 pt-4 sm:pt-6 lg:pt-8 animate-fade-in">
    <Dashboard
      stats={stats}
      showDetailed={true}
      onViewComic={onViewComic}
      onViewRawComics={onViewRawComics}
      onViewSlabbedComics={onViewSlabbedComics}
      onViewVariants={onViewVariants}
      onViewVirtualBoxes={onViewVirtualBoxes}
      virtualBoxesCount={allVirtualBoxesCount}
      variantsCount={variantsCount}
      hideSlabbedCard={selectedCondition === 'slabbed'}
      hideRawCard={selectedCondition === 'raw'}
    />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <GradeDistribution comics={allComics} />
      <AcquisitionTimeline comics={allComics} />
      <CollectorInsights comics={allComics} />
      <CollectionHealth comics={allComics} />
    </div>

    {top10Comics.length > 0 && (
      <div className="bg-surface-primary rounded-xl border border-slate-800 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-amber-400" />
          Top 10 Most Valuable
        </h3>
        <div className="space-y-2">
          {top10Comics.map((comic, i) => (
            <div
              key={comic.id}
              className="flex items-center gap-3 sm:gap-4 p-2 rounded-lg hover:bg-surface-secondary/50 cursor-pointer transition-colors"
              onClick={() => onViewComic(comic)}
            >
              <span className="text-lg font-bold text-slate-600 w-7 text-right tabular-nums">{i + 1}</span>
              <div className="w-8 h-11 bg-surface-secondary rounded overflow-hidden flex-shrink-0">
                {comic.coverImageUrl && (
                  <img src={comic.coverImageUrl} alt="" width={32} height={44} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{comic.seriesName} #{comic.issueNumber}</p>
                <p className="text-xs text-slate-500">Grade: {comic.grade} &middot; {comic.isSlabbed ? 'Slabbed' : 'Raw'}</p>
              </div>
              <p className="font-semibold text-white tabular-nums text-sm">{formatCurrency(comic.currentValue || 0)}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {stats.comicsWithCurrentValue > 0 && (
        <div className="bg-surface-primary rounded-xl border border-slate-800 p-5 sm:p-6">
          <h3 className="text-base font-semibold text-white mb-4">Series Performance</h3>
          {allSeriesCount > 0 ? (
            <div className="space-y-1">
              {seriesPerformance
                .slice(0, showAllSeriesPerf ? undefined : 8)
                .map((series) => (
                  <div
                    key={series.name}
                    className="flex items-center justify-between cursor-pointer hover:bg-surface-secondary/50 rounded-lg p-2.5 transition-colors"
                    onClick={() => onViewSeries(series.name)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white text-sm truncate">{series.name}</p>
                      <p className="text-xs text-slate-500">{series.countWithValue} of {series.count} valued</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="font-semibold text-white text-sm tabular-nums">
                        {(series.currentValue || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                      </p>
                      <p className={`text-xs font-medium tabular-nums ${series.gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {series.gainLoss >= 0 ? '+' : ''}{(series.gainLoss || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} ({(series.gainLossPercentage || 0) >= 0 ? '+' : ''}{(series.gainLossPercentage || 0).toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                ))}
              {valuedSeriesCount > 8 && (
                <button
                  onClick={onToggleSeriesPerf}
                  className="w-full text-center py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showAllSeriesPerf ? 'Show Less' : 'Show All'}
                </button>
              )}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No series performance data available</p>
          )}
        </div>
      )}

      <div className="bg-surface-primary rounded-xl border border-slate-800 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-white mb-4">Top Series by Count</h3>
        {allSeriesCount > 0 ? (
          <div className="space-y-1">
            {seriesCountSummaries
              .slice(0, showAllSeriesCount ? undefined : 10)
              .map((series) => (
                <div
                  key={series.name}
                  className="flex items-center justify-between cursor-pointer hover:bg-surface-secondary/50 rounded-lg p-2.5 transition-colors"
                  onClick={() => onViewSeries(series.name)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white text-sm truncate">{series.name}</p>
                    <p className="text-xs text-slate-500">{series.count} comics</p>
                  </div>
                  <p className="font-semibold text-white text-sm tabular-nums flex-shrink-0 ml-3">
                    {(series.value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                  </p>
                </div>
              ))}
            {allSeriesCount > 10 && (
              <button
                onClick={onToggleSeriesCount}
                className="w-full text-center py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showAllSeriesCount ? 'Show Less' : 'Show All'}
              </button>
            )}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No series data available</p>
        )}
      </div>

      <div className="bg-surface-primary rounded-xl border border-slate-800 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-white mb-4">Recent Additions</h3>
        {allComics.length > 0 ? (
          <div className="space-y-1">
            {[...allComics]
              .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
              .slice(0, 5)
              .map((comic) => (
                <div
                  key={comic.id}
                  className="flex items-center justify-between cursor-pointer hover:bg-surface-secondary/50 rounded-lg p-2.5 transition-colors"
                  onClick={() => onViewComic(comic)}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="font-medium text-white text-sm hover:text-blue-400 transition-colors truncate"
                      onClick={(e) => { e.stopPropagation(); onViewSeries(comic.seriesName); }}
                    >
                      {comic.seriesName} #{comic.issueNumber}
                    </p>
                    <p className="text-xs text-slate-500">
                      Purchased {new Date(comic.purchaseDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="font-semibold text-white text-sm tabular-nums">
                      {(comic.purchasePrice || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                    </p>
                    {comic.currentValue && (
                      <p className={`text-xs tabular-nums ${(comic.currentValue || 0) >= (comic.purchasePrice || 0) ? 'text-emerald-400' : 'text-red-400'}`}>
                        Now: {(comic.currentValue || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No comics added yet</p>
        )}
      </div>

      <div className="bg-surface-primary rounded-xl border border-slate-800 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-white mb-4">Virtual Boxes</h3>
        {allVirtualBoxesCount > 0 ? (
          <div className="space-y-1">
            {storageLocationSummaries
              .slice(0, 8)
              .map((location) => (
                <div
                  key={location.name}
                  className="flex items-center justify-between cursor-pointer hover:bg-surface-secondary/50 rounded-lg p-2.5 transition-colors"
                  onClick={() => onViewStorageLocation(location.name)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white text-sm truncate">{location.name}</p>
                    <p className="text-xs text-slate-500">{location.count} comics</p>
                  </div>
                  <p className="font-semibold text-white text-sm tabular-nums flex-shrink-0 ml-3">
                    {formatCurrency(location.value)}
                  </p>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No virtual boxes specified</p>
        )}
      </div>
    </div>
  </div>
);

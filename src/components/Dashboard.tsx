import React from 'react';
import type { Comic, ComicStats } from '../types/Comic';
import { Award, BookOpen, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { formatComicLabel, formatCurrency, formatPercentage, formatSignedCurrency, formatValueChange, formatWholeCurrency, getValueChange } from '../utils/formatting';
import { SiteLink } from './SiteLink';
import { hasMeaningfulReturn } from '../utils/stats';

const coverageNote = (stats: ComicStats) =>
  `${stats.comicsWithKnownReturn.toLocaleString('en-US')} of ${stats.totalComics.toLocaleString('en-US')} comics that have both a recorded price and a current value`;

const ReturnValue: React.FC<{ stats: ComicStats; size: 'lg' | 'sm' }> = ({ stats, size }) => {
  const positive = stats.totalGainLoss >= 0;
  const change = { amount: stats.totalGainLoss, percentage: stats.totalGainLossPercentage, trend: positive ? 'up' as const : 'down' as const };
  if (size === 'lg') {
    return (
      <span className={`flex flex-wrap items-baseline gap-x-2 font-bold tabular-nums ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
        <span className="text-2xl sm:text-3xl lg:text-4xl">{formatSignedCurrency(change.amount)}</span>
        <span className="text-base sm:text-lg">({formatPercentage(change.percentage)})</span>
      </span>
    );
  }
  return (
    <span className={`text-lg font-bold tabular-nums ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
      {formatValueChange(change)}
    </span>
  );
};

/** Compact summary for detail-page headers. */
export const KeyStats: React.FC<{ stats: ComicStats }> = ({ stats }) => (
  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-wrap sm:gap-x-10">
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">Comics</dt>
      <dd className="text-lg font-bold tabular-nums text-white">{stats.totalComics.toLocaleString('en-US')}</dd>
    </div>
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">Current value</dt>
      <dd className="text-lg font-bold tabular-nums text-white">
        {stats.comicsWithCurrentValue > 0 ? formatWholeCurrency(stats.totalCurrentValue) : '—'}
      </dd>
    </div>
    <div className="col-span-2 sm:col-span-1">
      <dt className="text-xs uppercase tracking-wide text-slate-400">Return on known costs</dt>
      <dd>
        {hasMeaningfulReturn(stats)
          ? <ReturnValue stats={stats} size="sm" />
          : <span className="text-sm text-slate-400" title={`Only ${coverageNote(stats)}`}>Not enough recorded costs ({stats.comicsWithKnownReturn} of {stats.totalComics} priced)</span>}
      </dd>
    </div>
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">Avg grade</dt>
      <dd className="text-lg font-bold tabular-nums text-white">{stats.totalComics ? stats.averageGrade.toFixed(1) : '—'}</dd>
    </div>
  </dl>
);

/** Headline numbers for the statistics page. */
export const PortfolioOverview: React.FC<{ stats: ComicStats; variantsCount: number }> = ({ stats, variantsCount }) => {
  return (
    <section aria-labelledby="portfolio-heading" className="rounded-xl border border-slate-800 bg-surface-primary p-5 sm:p-8">
      <h2 id="portfolio-heading" className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400">Portfolio overview</h2>
      <dl className="mb-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-8 lg:grid-cols-3">
        <div>
          <dt className="sr-only">Current value</dt>
          <dd className="text-2xl font-extrabold tabular-nums tracking-tight text-white sm:text-3xl lg:text-4xl">{formatWholeCurrency(stats.totalCurrentValue)}</dd>
          <dd className="mt-1 text-xs text-slate-400 sm:text-sm">Current value</dd>
        </div>
        <div>
          <dt className="sr-only">Return on known costs</dt>
          <dd>{hasMeaningfulReturn(stats) ? <ReturnValue stats={stats} size="lg" /> : <span className="text-lg text-slate-400">—</span>}</dd>
          <dd className="mt-1 text-xs text-slate-400 sm:text-sm">
            Return on {formatCurrency(stats.knownCostBasis)} of recorded costs
          </dd>
        </div>
        <div>
          <dt className="sr-only">Comics</dt>
          <dd className="text-2xl font-extrabold tabular-nums tracking-tight text-white sm:text-3xl lg:text-4xl">{stats.totalComics.toLocaleString('en-US')}</dd>
          <dd className="mt-1 text-xs text-slate-400 sm:text-sm">Comics</dd>
        </div>
      </dl>

      {stats.comicsWithKnownReturn < stats.totalComics && (
        <p className="mb-4 text-xs text-slate-400">Returns use only the {coverageNote(stats)}.</p>
      )}

      <dl className="flex flex-wrap gap-x-8 gap-y-2 border-t border-slate-800 pt-4 text-sm">
        {[
          ['Total paid (all recorded prices)', formatCurrency(stats.totalPurchaseValue)],
          ['Avg grade', stats.averageGrade.toFixed(1)],
          ['Raw', stats.rawComics.toLocaleString('en-US')],
          ['Slabbed', stats.slabbedComics.toLocaleString('en-US')],
          ['Variants', variantsCount.toLocaleString('en-US')],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center gap-2">
            <dt className="text-slate-400">{label}</dt>
            <dd className="font-medium tabular-nums text-slate-200">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

const HighlightCard: React.FC<{
  comic: Comic;
  label: string;
  icon: LucideIcon;
  accent: 'emerald' | 'red' | 'purple' | 'blue';
  showChange?: boolean;
}> = ({ comic, label, icon: Icon, accent, showChange }) => {
  const change = getValueChange(comic.purchasePrice, comic.currentValue);
  const accents = {
    emerald: 'border-l-emerald-400 text-emerald-300',
    red: 'border-l-red-400 text-red-300',
    purple: 'border-l-purple-400 text-purple-300',
    blue: 'border-l-blue-400 text-blue-300',
  } as const;
  return (
    <SiteLink
      to={{ type: 'comic', comic }}
      className={`block rounded-xl border border-l-4 border-slate-800 bg-surface-primary p-5 transition-colors hover:border-slate-600 ${accents[accent].split(' ')[0]}`}
    >
      <p className={`mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${accents[accent].split(' ')[1]}`}>
        <Icon size={15} aria-hidden="true" />
        {label}
      </p>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-bold text-white">{formatComicLabel(comic)}</p>
          <p className="mt-0.5 text-xs text-slate-400">Grade {comic.grade} · {comic.isSlabbed ? 'Slabbed' : 'Raw'}</p>
        </div>
        <div className="text-right">
          {showChange && comic.purchasePrice !== undefined && (
            <p className="text-xs text-slate-400">Paid {formatCurrency(comic.purchasePrice)}</p>
          )}
          <p className="text-xl font-bold tabular-nums text-white">{formatCurrency(comic.currentValue ?? comic.purchasePrice ?? 0)}</p>
          {showChange && change && (
            <p className={`text-xs font-medium tabular-nums ${change.trend === 'down' ? 'text-red-400' : 'text-emerald-400'}`}>{formatValueChange(change)}</p>
          )}
        </div>
      </div>
    </SiteLink>
  );
};

/** Biggest movers and most valuable comics for a set of comics. */
export const PerformanceHighlights: React.FC<{ stats: ComicStats }> = ({ stats }) => {
  const cards = [
    stats.biggestGainer && <HighlightCard key="gain" comic={stats.biggestGainer} label="Biggest gainer" icon={TrendingUp} accent="emerald" showChange />,
    stats.biggestLoser && <HighlightCard key="loss" comic={stats.biggestLoser} label="Biggest decline" icon={TrendingDown} accent="red" showChange />,
    stats.highestValuedSlabbedComic && <HighlightCard key="slab" comic={stats.highestValuedSlabbedComic} label="Most valuable slabbed" icon={Award} accent="purple" />,
    stats.highestValuedRawComic && <HighlightCard key="raw" comic={stats.highestValuedRawComic} label="Most valuable raw" icon={BookOpen} accent="blue" />,
  ].filter(Boolean);

  if (cards.length === 0) return null;
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{cards}</div>;
};

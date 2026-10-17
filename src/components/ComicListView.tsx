import React from 'react';
import type { Comic } from '../types/Comic';
import { formatCurrency, formatDate, formatValueChange, getValueChange } from '../utils/formatting';
import { comicPath } from '../utils/paths';
import { AppLink } from './AppLink';
import { GradeBadge } from './ComicCard';
import { comicAccessibleName } from '../utils/comic-labels';
import { CoverImage } from './CoverImage';

interface ComicListItemProps {
  comic: Comic;
  onView: (comic: Comic) => void;
  extraInfo?: React.ReactNode;
}

export const ComicListItem: React.FC<ComicListItemProps> = React.memo(({ comic, onView, extraInfo }) => {
  const change = getValueChange(comic.purchasePrice, comic.currentValue);
  const value = comic.currentValue ?? comic.purchasePrice;

  return (
    <li>
      <AppLink
        href={comicPath(comic)}
        onNavigate={() => onView(comic)}
        aria-label={comicAccessibleName(comic)}
        className="flex items-center gap-3 rounded-xl border border-slate-800 bg-surface-primary p-3 transition-colors hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:gap-4 sm:p-4"
      >
        <div className="h-14 w-10 flex-shrink-0 overflow-hidden rounded-md bg-surface-secondary sm:h-16 sm:w-11">
          <CoverImage comic={comic} displayWidth={48} sizes="48px" decorative compact />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold text-white sm:text-base">{comic.seriesName} #{comic.issueNumber}</h3>
            {comic.isSlabbed && <span className="rounded-md border border-purple-500/30 bg-purple-500/15 px-1.5 py-0.5 text-[10px] text-purple-200 sm:text-xs">Slabbed</span>}
            {comic.isVariant && <span className="rounded-md border border-orange-500/30 bg-orange-500/15 px-1.5 py-0.5 text-[10px] text-orange-200 sm:text-xs">Variant</span>}
            {comic.isGraphicNovel && <span className="rounded-md border border-emerald-500/30 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-200 sm:text-xs">GN</span>}
            {comic.signedBy.trim() && <span className="rounded-md border border-rose-500/30 bg-rose-500/15 px-1.5 py-0.5 text-[10px] text-rose-200 sm:text-xs">Signed</span>}
          </div>
          <p className="flex flex-wrap gap-x-2 text-xs text-slate-400">
            <span>{formatDate(comic.releaseDate)}</span>
            {comic.coverArtist && <span className="truncate">· {comic.coverArtist}</span>}
            {comic.storageLocation && <span className="hidden md:inline">· {comic.storageLocation}</span>}
          </p>
          {extraInfo && <div className="mt-1 text-xs text-slate-400">{extraInfo}</div>}
        </div>

        <div className="hidden w-20 flex-shrink-0 justify-end sm:flex">
          <GradeBadge comic={comic} />
        </div>

        <div className="min-w-[88px] flex-shrink-0 text-right">
          <p className="text-sm font-semibold tabular-nums text-white">
            {value === undefined ? <span className="text-xs font-normal text-slate-400">No value</span> : formatCurrency(value)}
          </p>
          {change && change.trend !== 'flat' && (
            <p className={`text-[11px] tabular-nums sm:text-xs ${change.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatValueChange(change)}
            </p>
          )}
          <p className="text-[11px] tabular-nums text-slate-400 sm:text-xs">
            <span className="sm:hidden">Grade {comic.grade} · </span>
            Paid {comic.purchasePrice === undefined ? '—' : formatCurrency(comic.purchasePrice)}
          </p>
        </div>
      </AppLink>
    </li>
  );
});

ComicListItem.displayName = 'ComicListItem';

interface ComicListViewProps {
  comics: Comic[];
  onView: (comic: Comic) => void;
  extraInfo?: (comic: Comic) => React.ReactNode;
}

export const ComicListView: React.FC<ComicListViewProps> = React.memo(({ comics, onView, extraInfo }) => (
  <div>
    <div className="mb-1 hidden items-center gap-4 px-4 py-2 text-xs font-medium uppercase tracking-wider text-slate-400 sm:flex" aria-hidden="true">
      <div className="w-11 flex-shrink-0" />
      <div className="flex-1">Comic</div>
      <div className="w-20 text-right">Grade</div>
      <div className="min-w-[88px] text-right">Value</div>
    </div>
    <ul className="space-y-2">
      {comics.map((comic) => (
        <ComicListItem key={comic.id} comic={comic} onView={onView} extraInfo={extraInfo?.(comic)} />
      ))}
    </ul>
  </div>
));

ComicListView.displayName = 'ComicListView';

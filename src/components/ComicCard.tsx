import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { Comic } from '../types/Comic';
import { formatCurrency, getCalendarYear, getValueChange } from '../utils/formatting';
import { comicAccessibleName } from '../utils/comic-labels';
import { comicPath } from '../utils/paths';
import { AppLink } from './AppLink';
import { CoverImage } from './CoverImage';

export const GradeBadge: React.FC<{ comic: Pick<Comic, 'grade' | 'isSlabbed'>; size?: 'sm' | 'md' }> = ({ comic, size = 'sm' }) => (
  <span
    className={`inline-flex items-baseline gap-1 rounded-md border border-slate-600 bg-slate-800 font-semibold tabular-nums text-white ${
      size === 'md' ? 'px-2 py-1 text-base' : 'px-1.5 py-0.5 text-xs'
    }`}
  >
    <span className={`font-medium uppercase tracking-wide text-slate-300 ${size === 'md' ? 'text-xs' : 'text-[10px]'}`}>
      {comic.isSlabbed ? 'Slab' : 'Raw'}
    </span>
    {comic.grade}
  </span>
);

interface ComicCardProps {
  comic: Comic;
  onView: (comic: Comic) => void;
  showSeriesName?: boolean;
  priority?: boolean;
}

export const ComicCard: React.FC<ComicCardProps> = React.memo(({ comic, onView, showSeriesName = true, priority = false }) => {
  const change = getValueChange(comic.purchasePrice, comic.currentValue);
  const value = comic.currentValue ?? comic.purchasePrice;

  return (
    <AppLink
      href={comicPath(comic)}
      onNavigate={() => onView(comic)}
      aria-label={comicAccessibleName(comic)}
      className="group flex w-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-surface-primary shadow-card transition-colors duration-200 hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-surface-secondary">
        <CoverImage
          comic={comic}
          displayWidth={240}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 200px"
          decorative
          priority={priority}
          className="transition-transform duration-300 motion-safe:group-hover:scale-[1.03]"
        />

        <div className="absolute left-1.5 top-1.5 flex flex-col items-start gap-1 sm:left-2 sm:top-2">
          {comic.isSlabbed && <span className="rounded-md bg-purple-600 px-1.5 py-0.5 text-[10px] font-medium text-white shadow sm:text-xs">Slabbed</span>}
          {comic.signedBy.trim() && <span className="rounded-md bg-rose-600 px-1.5 py-0.5 text-[10px] font-medium text-white shadow sm:text-xs">Signed</span>}
        </div>
        <div className="absolute bottom-1.5 left-1.5 flex flex-col items-start gap-1 sm:bottom-2 sm:left-2">
          {comic.isVariant && <span className="rounded-md bg-orange-600 px-1.5 py-0.5 text-[10px] font-medium text-white shadow sm:text-xs">Variant</span>}
          {comic.isGraphicNovel && <span className="rounded-md bg-emerald-700 px-1.5 py-0.5 text-[10px] font-medium text-white shadow sm:text-xs">GN</span>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        {showSeriesName ? (
          <>
            <h3 className="mb-0.5 line-clamp-2 text-sm font-semibold leading-snug text-white">{comic.seriesName}</h3>
            <p className="text-xs text-slate-400">#{comic.issueNumber} · {getCalendarYear(comic.releaseDate)}</p>
          </>
        ) : (
          <h3 className="text-sm font-semibold text-white">
            #{comic.issueNumber} <span className="font-normal text-slate-400">· {getCalendarYear(comic.releaseDate)}</span>
          </h3>
        )}
        <p className="mb-2 truncate text-xs text-slate-400" title={comic.coverArtist || undefined}>
          {comic.coverArtist ? `${comic.isVariant ? 'Variant by' : 'Cover by'} ${comic.coverArtist}` : ' '}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2">
          <GradeBadge comic={comic} />
          <span className="flex items-center gap-1 text-sm font-semibold tabular-nums text-white">
            {change?.trend === 'up' && <TrendingUp size={12} className="text-emerald-400" aria-hidden="true" />}
            {change?.trend === 'down' && <TrendingDown size={12} className="text-red-400" aria-hidden="true" />}
            {value === undefined ? <span className="text-xs font-normal text-slate-400">No value</span> : formatCurrency(value)}
          </span>
        </div>
      </div>
    </AppLink>
  );
});

ComicCard.displayName = 'ComicCard';

import React from 'react';
import { Comic } from '../types/Comic';
import { Star, Award, TrendingUp, TrendingDown } from 'lucide-react';

interface ComicListViewProps {
  comics: Comic[];
  onView: (comic: Comic) => void;
}

export const ComicListView: React.FC<ComicListViewProps> = React.memo(({ comics, onView }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-0">
      {/* Column Headers (desktop) */}
      <div className="hidden sm:flex items-center px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-800 mb-1">
        <div className="flex-1 min-w-0">Comic</div>
        <div className="w-24 text-right">Grade</div>
        <div className="w-32 text-right">Value</div>
      </div>

      {comics.map((comic, index) => {
        const hasGainLoss = comic.currentValue !== undefined && comic.purchasePrice !== undefined && comic.purchasePrice > 0;
        const gainLoss = hasGainLoss ? (comic.currentValue! - comic.purchasePrice!) : 0;
        const isPositive = gainLoss >= 0;

        return (
          <div
            key={comic.id}
            className={`rounded-xl border border-slate-800 p-3 sm:p-4 hover:border-slate-600 transition-all cursor-pointer group active:scale-[0.995] ${
              index % 2 === 0 ? 'bg-surface-primary' : 'bg-surface-primary/50'
            }`}
            onClick={() => onView(comic)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <div className="w-10 h-14 sm:w-12 sm:h-16 bg-surface-secondary rounded-lg overflow-hidden flex-shrink-0">
                  {comic.coverImageUrl ? (
                    <img
                      src={comic.coverImageUrl}
                      alt={`${comic.seriesName} #${comic.issueNumber}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Award size={16} className="text-slate-600" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h4 className="font-semibold text-white text-sm sm:text-base truncate">{comic.seriesName} #{comic.issueNumber}</h4>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {comic.isSlabbed && (
                        <span className="px-1.5 py-0.5 bg-purple-500/15 text-purple-300 text-[10px] sm:text-xs rounded-md border border-purple-500/20">
                          Slabbed
                        </span>
                      )}
                      {comic.isVariant && (
                        <span className="px-1.5 py-0.5 bg-orange-500/15 text-orange-300 text-[10px] sm:text-xs rounded-md border border-orange-500/20">
                          Variant
                        </span>
                      )}
                      {comic.isGraphicNovel && (
                        <span className="px-1.5 py-0.5 bg-emerald-500/15 text-emerald-300 text-[10px] sm:text-xs rounded-md border border-emerald-500/20">
                          GN
                        </span>
                      )}
                      {comic.signedBy && (
                        <span className="px-1.5 py-0.5 bg-rose-500/15 text-rose-300 text-[10px] sm:text-xs rounded-md border border-rose-500/20">
                          Signed
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 truncate mb-0.5">{comic.title}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{formatDate(comic.releaseDate)}</span>
                    {comic.coverArtist && <span className="hidden sm:inline">&middot; {comic.coverArtist}</span>}
                    {comic.storageLocation && <span className="hidden md:inline">&middot; {comic.storageLocation}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 ml-3">
                {/* Grade */}
                <div className="hidden sm:flex items-center gap-1 w-16 justify-end">
                  <Star size={12} className="text-amber-400" />
                  <span className="text-sm text-white font-medium tabular-nums">{comic.grade}</span>
                </div>

                {/* Value */}
                <div className="text-right min-w-[80px]">
                  <div className="flex items-center justify-end gap-1">
                    {hasGainLoss && (
                      isPositive ? (
                        <TrendingUp size={12} className="text-emerald-400" />
                      ) : (
                        <TrendingDown size={12} className="text-red-400" />
                      )
                    )}
                    <p className="font-semibold text-white tabular-nums text-sm">
                      {formatCurrency(comic.currentValue || comic.purchasePrice || 0)}
                    </p>
                  </div>
                  {hasGainLoss && (
                    <p className={`text-[10px] sm:text-xs tabular-nums ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{formatCurrency(gainLoss)}
                      {comic.purchasePrice && comic.purchasePrice > 0 && ` (${((gainLoss / comic.purchasePrice) * 100).toFixed(1)}%)`}
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs text-slate-500 tabular-nums">
                    Paid: {formatCurrency(comic.purchasePrice || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

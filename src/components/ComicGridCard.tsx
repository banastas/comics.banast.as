import React from 'react';
import { Comic } from '../types/Comic';
import { Star, Award } from 'lucide-react';
import { formatCurrency } from '../utils/formatting';

interface ComicGridCardProps {
  comic: Comic;
  onView: (comic: Comic) => void;
  badges?: React.ReactNode;
  showSeriesName?: boolean;
}

export const ComicGridCard: React.FC<ComicGridCardProps> = React.memo(({
  comic,
  onView,
  badges,
  showSeriesName = true,
}) => (
  <div
    className="bg-gray-700/50 rounded-lg border border-gray-600 overflow-hidden hover:border-blue-500 transition-all cursor-pointer group"
    onClick={() => onView(comic)}
  >
    <div className="relative aspect-[2/3] bg-gray-600">
      {comic.coverImageUrl ? (
        <img
          src={comic.coverImageUrl}
          alt={`${comic.seriesName} #${comic.issueNumber}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Award size={32} className="text-gray-500" />
        </div>
      )}

      <div className="absolute top-1 left-1 flex flex-col space-y-1">
        {badges || (
          <>
            {comic.isSlabbed && (
              <span className="px-1 py-0.5 bg-purple-500 text-white text-xs font-medium rounded">
                Slab
              </span>
            )}
            {comic.signedBy && (
              <span className="px-1 py-0.5 bg-rose-500 text-white text-xs font-medium rounded">
                Signed
              </span>
            )}
          </>
        )}
      </div>
    </div>

    <div className="p-3">
      {showSeriesName && (
        <p className="font-medium text-white text-sm truncate mb-1">{comic.seriesName}</p>
      )}
      <div className="flex items-center justify-between mb-1">
        <p className={showSeriesName ? 'text-xs text-gray-400' : 'font-bold text-white'}>#{comic.issueNumber}</p>
        <div className="flex items-center space-x-1">
          <Star size={10} className="text-amber-400" />
          <span className="text-xs text-white">{comic.grade}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-1">
        {new Date(comic.releaseDate).getFullYear()}
      </p>
      <p className="text-xs font-semibold text-green-400">
        {formatCurrency(comic.currentValue || comic.purchasePrice || 0)}
      </p>
    </div>
  </div>
));

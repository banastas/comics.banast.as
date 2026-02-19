import React from 'react';
import { Comic } from '../types/Comic';
import { Star, Award } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatting';

interface ComicListRowProps {
  comic: Comic;
  onView: (comic: Comic) => void;
  badges?: React.ReactNode;
  extraInfo?: React.ReactNode;
}

export const ComicListRow: React.FC<ComicListRowProps> = React.memo(({
  comic,
  onView,
  badges,
  extraInfo,
}) => (
  <div
    className="bg-gray-700/50 rounded-lg border border-gray-600 p-4 hover:border-blue-500 transition-all cursor-pointer group"
    onClick={() => onView(comic)}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-16 bg-gray-600 rounded overflow-hidden flex-shrink-0">
          {comic.coverImageUrl ? (
            <img
              src={comic.coverImageUrl}
              alt={`${comic.seriesName} #${comic.issueNumber}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Award size={16} className="text-gray-500" />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center space-x-3">
            <h4 className="font-bold text-white">{comic.seriesName} #{comic.issueNumber}</h4>
            <div className="flex items-center space-x-1">
              <Star size={12} className="text-amber-400" />
              <span className="text-sm text-white">{comic.grade}</span>
            </div>
            {badges || (
              <>
                {comic.isSlabbed && (
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30">
                    Slabbed
                  </span>
                )}
                {comic.signedBy && (
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-xs rounded border border-rose-500/30">
                    Signed
                  </span>
                )}
              </>
            )}
          </div>
          <p className="text-sm text-gray-300">{comic.title}</p>
          <p className="text-xs text-gray-400">
            {formatDate(comic.releaseDate)}
            {comic.coverArtist && ` \u2022 ${comic.coverArtist}`}
          </p>
          {extraInfo}
        </div>
      </div>

      <div className="text-right">
        <p className="font-semibold text-white">
          {formatCurrency(comic.currentValue || comic.purchasePrice || 0)}
        </p>
        {comic.currentValue && comic.currentValue !== (comic.purchasePrice || 0) && (
          <p className={`text-xs ${
            comic.currentValue > (comic.purchasePrice || 0) ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {comic.currentValue > (comic.purchasePrice || 0) ? '+' : ''}
            {formatCurrency(comic.currentValue - (comic.purchasePrice || 0))}
            {(comic.purchasePrice || 0) > 0 && ` (${((comic.currentValue - (comic.purchasePrice || 0)) / (comic.purchasePrice || 0) * 100).toFixed(1)}%)`}
          </p>
        )}
      </div>
    </div>
  </div>
));

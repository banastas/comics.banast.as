import React from 'react';
import { Comic } from '../types/Comic';
import { Star, Award } from 'lucide-react';

interface ComicListViewProps {
  comics: Comic[];
  onView: (comic: Comic) => void;
}

export const ComicListView: React.FC<ComicListViewProps> = ({ comics, onView }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
    <div className="space-y-2">
      {comics.map((comic) => (
        <div
          key={comic.id}
          className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-blue-500 transition-all cursor-pointer group"
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
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Award size={16} className="text-gray-500" />
                  </div>
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <h4 className="font-bold text-white truncate">{comic.seriesName} #{comic.issueNumber}</h4>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Star size={12} className="text-amber-400" />
                    <span className="text-sm text-white">{comic.grade}</span>
                  </div>
                  {comic.isSlabbed && (
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30 flex-shrink-0">
                      Slabbed
                    </span>
                  )}
                  {comic.signedBy && (
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-xs rounded border border-rose-500/30 flex-shrink-0">
                      Signed
                    </span>
                  )}
                  {comic.isVariant && (
                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 text-xs rounded border border-orange-500/30 flex-shrink-0">
                      Variant
                    </span>
                  )}
                  {comic.isGraphicNovel && (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded border border-emerald-500/30 flex-shrink-0">
                      GN
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 truncate mb-1">{comic.title}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span>{formatDate(comic.releaseDate)}</span>
                  {comic.coverArtist && <span>• {comic.coverArtist}</span>}
                  {comic.storageLocation && <span>• {comic.storageLocation}</span>}
                </div>
                {comic.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {comic.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                    {comic.tags.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{comic.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4 flex-shrink-0">
              <div className="text-right">
                <p className="font-semibold text-white">
                  {formatCurrency(comic.currentValue || comic.purchasePrice)}
                </p>
                {comic.currentValue && comic.currentValue !== comic.purchasePrice && (
                  <p className={`text-xs ${
                    comic.currentValue > comic.purchasePrice ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {comic.currentValue > comic.purchasePrice ? '+' : ''}
                    {formatCurrency(comic.currentValue - comic.purchasePrice)}
                    {comic.purchasePrice > 0 && ` (${((comic.currentValue - comic.purchasePrice) / comic.purchasePrice * 100).toFixed(1)}%)`}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  Paid: {formatCurrency(comic.purchasePrice)}
                </p>
              </div>
              
              {/* Action buttons removed as per current application behavior */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
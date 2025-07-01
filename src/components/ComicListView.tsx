import React from 'react';
import { Comic } from '../types/Comic';
import { TouchTarget } from './TouchTarget';
import { FluidTypography } from './FluidTypography';
import { ResponsiveImage } from './ResponsiveImage';
import { Star, Award } from 'lucide-react';

interface ComicListViewProps {
  comics: Comic[];
  onView: (comic: Comic) => void;
  onEdit: (comic: Comic) => void;
  onDelete: (id: string) => void;
}

export const ComicListView: React.FC<ComicListViewProps> = ({ 
  comics, 
  onView, 
  onEdit, 
  onDelete 
}) => {
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
        <TouchTarget
          key={comic.id}
          onClick={() => onView(comic)}
          variant="link"
          className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-blue-500 transition-all group w-full min-h-0"
          ariaLabel={`View ${comic.seriesName} #${comic.issueNumber}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ResponsiveImage
                src={comic.coverImageUrl}
                alt={`${comic.seriesName} #${comic.issueNumber} cover`}
                className="w-12 h-16 rounded overflow-hidden flex-shrink-0"
                aspectRatio="aspect-[3/4]"
                sizes="48px"
              />
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <FluidTypography
                    variant="h4"
                    className="font-bold text-white truncate"
                  >
                    {comic.seriesName} #{comic.issueNumber}
                  </FluidTypography>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Star size={12} className="text-amber-400" />
                    <FluidTypography
                      variant="caption"
                      className="text-white"
                    >
                      {comic.grade}
                    </FluidTypography>
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
                <FluidTypography
                  variant="body"
                  className="text-gray-300 truncate mb-1"
                >
                  {comic.title}
                </FluidTypography>
                <div className="flex items-center space-x-4">
                  <FluidTypography
                    variant="caption"
                    className="text-gray-400"
                  >
                    {formatDate(comic.releaseDate)}
                  </FluidTypography>
                  {comic.coverArtist && (
                    <FluidTypography
                      variant="caption"
                      className="text-gray-400"
                    >
                      • {comic.coverArtist}
                    </FluidTypography>
                  )}
                  {comic.storageLocation && (
                    <FluidTypography
                      variant="caption"
                      className="text-gray-400"
                    >
                      • {comic.storageLocation}
                    </FluidTypography>
                  )}
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
                <FluidTypography
                  variant="h4"
                  className="font-semibold text-white"
                >
                  {formatCurrency(comic.currentValue || comic.purchasePrice)}
                </FluidTypography>
                {comic.currentValue && comic.currentValue !== comic.purchasePrice && (
                  <FluidTypography
                    variant="caption"
                    className={`${
                    comic.currentValue > comic.purchasePrice ? 'text-emerald-400' : 'text-red-400'
                  }`}
                  >
                    {comic.currentValue > comic.purchasePrice ? '+' : ''}
                    {formatCurrency(comic.currentValue - comic.purchasePrice)}
                    {comic.purchasePrice > 0 && ` (${((comic.currentValue - comic.purchasePrice) / comic.purchasePrice * 100).toFixed(1)}%)`}
                  </FluidTypography>
                )}
                <FluidTypography
                  variant="caption"
                  className="text-gray-400"
                >
                  Paid: {formatCurrency(comic.purchasePrice)}
                </FluidTypography>
              </div>
              
              {/* Action buttons removed as per current application behavior */}
            </div>
          </div>
        </TouchTarget>
      ))}
    </div>
  );
};
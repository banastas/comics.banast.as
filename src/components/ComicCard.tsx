import React, { useState } from 'react';
import { Comic } from '../types/Comic';
import { Calendar, Star, DollarSign, MapPin, Trash2, Award, PenTool, Palette } from 'lucide-react';

interface ComicCardProps {
  comic: Comic;
  onView: (comic: Comic) => void;
  onEdit: (comic: Comic) => void;
  onDelete: (id: string) => void;
}

export const ComicCard: React.FC<ComicCardProps> = ({ comic, onView, onEdit, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

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

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden hover:shadow-xl hover:border-gray-600 transition-all duration-300 group cursor-pointer w-full">
      {/* Cover Image */}
      <div className="relative aspect-[2/3] bg-gray-700" onClick={() => onView(comic)}>
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-700 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-600 border-t-blue-400 rounded-full animate-spin"></div>
          </div>
        )}
        {!imageError && comic.coverImageUrl ? (
          <img
            src={comic.coverImageUrl}
            alt={`${comic.seriesName} #${comic.issueNumber}`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Award size={32} className="mx-auto mb-2" />
              <p className="text-sm font-medium">No Cover</p>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        {/* Action Buttons - Edit button removed */}

        {/* Slabbed Indicator */}
        {comic.isSlabbed && (
          <div className="absolute top-1 sm:top-2 left-1 sm:left-2">
            <span className="px-1 sm:px-2 py-0.5 sm:py-1 bg-purple-500 text-white text-xs font-medium rounded shadow-lg backdrop-blur-sm">
              Slabbed
            </span>
          </div>
        )}

        {/* Variant and Graphic Novel Indicators */}
        <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 flex flex-col space-y-1">
          {comic.isVariant && (
            <span className="px-1 sm:px-2 py-0.5 sm:py-1 bg-orange-500 text-white text-xs font-medium rounded shadow-lg backdrop-blur-sm">
              Variant
            </span>
          )}
          {comic.isGraphicNovel && (
            <span className="px-1 sm:px-2 py-0.5 sm:py-1 bg-emerald-500 text-white text-xs font-medium rounded shadow-lg backdrop-blur-sm">
              GN
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3" onClick={() => onView(comic)}>
        {/* Series Title */}
        <h3 className="font-bold text-white text-xs sm:text-sm mb-1 line-clamp-2">
          {comic.seriesName}
        </h3>
        
        {/* Issue # and Year */}
        <p className="text-xs text-gray-400 mb-1 sm:mb-2">
          #{comic.issueNumber} ({new Date(comic.releaseDate).getFullYear()})
        </p>

        {/* Grade and Value on same line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star size={10} className="text-amber-400 sm:w-3 sm:h-3" />
            <span className="text-xs sm:text-sm font-semibold text-white">{comic.grade}</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign size={10} className="text-green-400 sm:w-3 sm:h-3" />
            <span className="text-xs sm:text-sm font-semibold text-white">
              {comic.currentValue ? formatCurrency(comic.currentValue) : formatCurrency(comic.purchasePrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
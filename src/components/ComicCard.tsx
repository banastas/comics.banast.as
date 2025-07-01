import React, { useState } from 'react';
import { Comic } from '../types/Comic';
import { ResponsiveImage } from './ResponsiveImage';
import { TouchTarget } from './TouchTarget';
import { FluidTypography } from './FluidTypography';
import { Calendar, Star, DollarSign, MapPin, Trash2, Award, PenTool, Palette } from 'lucide-react';

interface ComicCardProps {
  comic: Comic;
  onView: (comic: Comic) => void;
  onEdit: (comic: Comic) => void;
  onDelete: (id: string) => void;
}

export const ComicCard: React.FC<ComicCardProps> = ({ comic, onView, onEdit, onDelete }) => {
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
    <TouchTarget
      onClick={() => onView(comic)}
      variant="link"
      className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden hover:shadow-xl hover:border-gray-600 transition-all duration-300 group w-full p-0 min-h-0"
      ariaLabel={`View details for ${comic.seriesName} #${comic.issueNumber}`}
    >
      {/* Cover Image */}
      <div className="relative">
        <ResponsiveImage
          src={comic.coverImageUrl}
          alt={`${comic.seriesName} #${comic.issueNumber} cover`}
          aspectRatio="aspect-[2/3]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        
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
      <div className="p-2 sm:p-3">
        {/* Series Title */}
        <FluidTypography
          variant="h4"
          className="font-bold text-white mb-1 line-clamp-2 text-xs sm:text-sm"
        >
          {comic.seriesName}
        </FluidTypography>
        
        {/* Issue # and Year */}
        <FluidTypography
          variant="caption"
          className="text-gray-400 mb-1 sm:mb-2"
        >
          #{comic.issueNumber} ({new Date(comic.releaseDate).getFullYear()})
        </FluidTypography>

        {/* Grade and Value on same line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star size={10} className="text-amber-400 sm:w-3 sm:h-3" />
            <span className="text-xs sm:text-sm font-semibold text-white">{comic.grade}</span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-green-400">
            {comic.currentValue ? formatCurrency(comic.currentValue) : formatCurrency(comic.purchasePrice)}
          </span>
        </div>
      </div>
    </TouchTarget>
  );
};
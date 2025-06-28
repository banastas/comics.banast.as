import React, { useState } from 'react';
import { Comic } from '../types/Comic';
import { Calendar, Star, DollarSign, MapPin, Edit, Trash2, Award, PenTool, Palette } from 'lucide-react';

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
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden hover:shadow-xl hover:border-gray-600 transition-all duration-300 group cursor-pointer">
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
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
          <div className="flex space-x-1">
            <button
              onClick={() => onEdit(comic)}
              className="p-1.5 bg-gray-900/80 text-white rounded hover:bg-gray-900/90 transition-colors backdrop-blur-sm"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => onDelete(comic.id)}
              className="p-1.5 bg-red-500/80 text-white rounded hover:bg-red-500/90 transition-colors backdrop-blur-sm"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Slabbed Indicator */}
        {comic.isSlabbed && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded shadow-lg backdrop-blur-sm">
              Slabbed
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3" onClick={() => onView(comic)}>
        {/* Series Title */}
        <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">
          {comic.seriesName}
        </h3>
        
        {/* Issue # and Year */}
        <p className="text-xs text-gray-400 mb-2">
          #{comic.issueNumber} ({new Date(comic.releaseDate).getFullYear()})
        </p>

        {/* Grade */}
        <div className="flex items-center space-x-1 mb-2">
          <Star size={12} className="text-amber-400" />
          <span className="text-sm font-semibold text-white">{comic.grade}</span>
        </div>

        {/* Current Value */}
        <div className="flex items-center space-x-1">
          <DollarSign size={12} className="text-green-400" />
          <span className="text-sm font-semibold text-white">
            {comic.currentValue ? formatCurrency(comic.currentValue) : formatCurrency(comic.purchasePrice)}
          </span>
        </div>
      </div>
    </div>
  );
};
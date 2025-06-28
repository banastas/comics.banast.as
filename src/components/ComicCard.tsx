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

        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {comic.isSlabbed && (
            <span className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded shadow-lg backdrop-blur-sm">
              Slabbed
            </span>
          )}
          {comic.signedBy && (
            <span className="px-2 py-1 bg-rose-500 text-white text-xs font-medium rounded flex items-center shadow-lg backdrop-blur-sm">
              <PenTool size={10} className="mr-1" />
              Signed
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4" onClick={() => onView(comic)}>
        {/* Title and Issue */}
        <div className="mb-3">
          <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">
            {comic.seriesName} #{comic.issueNumber}
          </h3>
          <p className="text-xs text-gray-400 line-clamp-2">{comic.title}</p>
        </div>

        {/* Grade and Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <Star size={14} className="text-amber-400" />
            <span className="text-sm font-semibold text-white">{comic.grade}</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign size={14} className="text-green-400" />
            <span className="text-sm font-semibold text-white">
              {formatCurrency(comic.purchasePrice)}
            </span>
          </div>
        </div>

        {/* Release Date */}
        <div className="flex items-center space-x-1 mb-2">
          <Calendar size={12} className="text-gray-500" />
          <span className="text-xs text-gray-400">{formatDate(comic.releaseDate)}</span>
        </div>

        {/* Cover Artist */}
        {comic.coverArtist && (
          <div className="flex items-center space-x-1 mb-2">
            <Palette size={12} className="text-gray-500" />
            <span className="text-xs text-gray-400 truncate">{comic.coverArtist}</span>
          </div>
        )}

        {/* Storage Location */}
        {comic.storageLocation && (
          <div className="flex items-center space-x-1 mb-3">
            <MapPin size={12} className="text-gray-500" />
            <span className="text-xs text-gray-400 truncate">{comic.storageLocation}</span>
          </div>
        )}

        {/* Tags */}
        {comic.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {comic.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30"
              >
                {tag}
              </span>
            ))}
            {comic.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-600/30 text-gray-300 text-xs rounded border border-gray-600/50">
                +{comic.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
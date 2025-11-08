import React, { useState, useRef, useEffect } from 'react';
import { Comic } from '../types/Comic';
import { Star, Award } from 'lucide-react';

interface ComicCardProps {
  comic: Comic;
  onView: (comic: Comic) => void;
}

export const ComicCard: React.FC<ComicCardProps> = React.memo(({ comic, onView }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Check if we have a valid cover image URL
  const hasValidCoverUrl = comic.coverImageUrl && comic.coverImageUrl.trim() !== '';
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden hover:shadow-xl hover:border-blue-500 transition-all duration-300 group cursor-pointer w-full">
      {/* Cover Image */}
      <div ref={imgRef} className="relative aspect-[2/3] bg-gray-700" onClick={() => onView(comic)}>
        {hasValidCoverUrl && imageLoading && isVisible && (
          <div className="absolute inset-0 bg-gray-700 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-600 border-t-blue-400 rounded-full animate-spin"></div>
          </div>
        )}
        {hasValidCoverUrl && !imageError && isVisible ? (
          <img
            src={comic.coverImageUrl}
            alt={`${comic.seriesName} Issue #${comic.issueNumber} comic book cover${comic.coverArtist ? ` - Cover art by ${comic.coverArtist}` : ''}${comic.isVariant ? ' (Variant Cover)' : ''}${comic.isSlabbed ? ' (Slabbed)' : ''}`}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Award size={32} className="mx-auto mb-2" />
              <p className="text-sm font-medium">
                {!isVisible ? 'Loading...' : 'No Cover'}
              </p>
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
          <span className="text-xs sm:text-sm font-semibold text-green-400">
            {comic.currentValue ? formatCurrency(comic.currentValue) : formatCurrency(comic.purchasePrice || 0)}
          </span>
        </div>
      </div>
    </div>
  );
});
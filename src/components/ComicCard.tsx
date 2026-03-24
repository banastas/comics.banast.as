import React, { useState, useRef, useEffect } from 'react';
import { Comic } from '../types/Comic';
import { Star, Award, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../utils/formatting';

interface ComicCardProps {
  comic: Comic;
  onView: (comic: Comic) => void;
}

export const ComicCard: React.FC<ComicCardProps> = React.memo(({ comic, onView }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const handleImageLoad = () => setImageLoading(false);
  const handleImageError = () => { setImageError(true); setImageLoading(false); };

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
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  const hasValidCoverUrl = comic.coverImageUrl && comic.coverImageUrl.trim() !== '';
  const displayValue = comic.currentValue || comic.purchasePrice || 0;
  const hasGainLoss = comic.currentValue !== undefined && comic.purchasePrice !== undefined && comic.purchasePrice > 0;
  const gainLoss = hasGainLoss ? ((comic.currentValue ?? 0) - (comic.purchasePrice ?? 0)) : 0;
  const isPositive = gainLoss >= 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onView(comic);
    }
  };

  return (
    <div
      className="bg-surface-primary rounded-xl shadow-card border border-slate-800 overflow-hidden hover:shadow-card-hover hover:border-slate-600 transition-all duration-300 group cursor-pointer w-full active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`${comic.seriesName} #${comic.issueNumber} — Grade ${comic.grade}, Value ${formatCurrency(displayValue)}`}
    >
      {/* Cover Image */}
      <div ref={imgRef} className="relative aspect-[2/3] bg-surface-secondary overflow-hidden" onClick={() => onView(comic)}>
        {hasValidCoverUrl && imageLoading && isVisible && (
          <div className="absolute inset-0 bg-surface-secondary animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-400 rounded-full animate-spin"></div>
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
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <Award size={32} className="mx-auto mb-2" />
              <p className="text-sm font-medium">
                {!isVisible ? 'Loading...' : 'No Cover'}
              </p>
            </div>
          </div>
        )}

        {/* Slabbed Indicator */}
        {comic.isSlabbed && (
          <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2">
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-500/90 text-white text-[10px] sm:text-xs font-medium rounded-md shadow-lg backdrop-blur-sm">
              Slabbed
            </span>
          </div>
        )}

        {/* Variant and Graphic Novel Indicators */}
        <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 flex flex-col space-y-1 sm:group-hover:opacity-0 transition-opacity">
          {comic.isVariant && (
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-orange-500/90 text-white text-[10px] sm:text-xs font-medium rounded-md shadow-lg backdrop-blur-sm">
              Variant
            </span>
          )}
          {comic.isGraphicNovel && (
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-500/90 text-white text-[10px] sm:text-xs font-medium rounded-md shadow-lg backdrop-blur-sm">
              GN
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3" onClick={() => onView(comic)}>
        <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2 leading-snug">
          {comic.seriesName}
        </h3>

        <p className="text-xs text-slate-500 mb-2">
          #{comic.issueNumber} ({new Date(comic.releaseDate).getFullYear()})
        </p>

        {/* Grade and Value */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star size={11} className="text-amber-400" />
            <span className="text-sm font-semibold text-white tabular-nums">{comic.grade}</span>
          </div>
          <div className="flex items-center gap-1">
            {hasGainLoss && (
              <span className="flex-shrink-0">
                {isPositive ? (
                  <TrendingUp size={11} className="text-emerald-400" />
                ) : (
                  <TrendingDown size={11} className="text-red-400" />
                )}
              </span>
            )}
            <span className={`text-sm font-semibold tabular-nums ${
              hasGainLoss ? (isPositive ? 'text-emerald-400' : 'text-red-400') : 'text-emerald-400'
            }`}>
              {formatCurrency(displayValue)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

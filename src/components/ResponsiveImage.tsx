import React, { useState, useCallback } from 'react';
import { BookOpen, Image as ImageIcon } from 'lucide-react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  fallbackText?: string;
  onError?: () => void;
  onLoad?: () => void;
  aspectRatio?: '2/3' | '1/1' | '16/9' | '4/3';
  priority?: 'high' | 'low';
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  fallbackIcon,
  fallbackText,
  onError,
  onLoad,
  aspectRatio = '2/3',
  priority = 'low'
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setImageState('loaded');
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setImageState('error');
    onError?.();
  }, [onError]);

  const aspectRatioClasses = {
    '2/3': 'aspect-[2/3]',
    '1/1': 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
  };

  const defaultFallbackIcon = fallbackIcon || <BookOpen size={24} className="text-slate-500" />;

  if (imageState === 'error') {
    return (
      <div className={`${aspectRatioClasses[aspectRatio]} bg-surface-secondary rounded-lg flex flex-col items-center justify-center ${className}`}>
        <div className="text-slate-400 mb-2">
          {defaultFallbackIcon}
        </div>
        {fallbackText && (
          <p className="text-xs text-slate-500 text-center px-2">{fallbackText}</p>
        )}
        <p className="text-xs text-slate-500 text-center px-2">Image unavailable</p>
      </div>
    );
  }

  return (
    <div className={`${aspectRatioClasses[aspectRatio]} bg-surface-secondary rounded-lg overflow-hidden ${className}`}>
      {imageState === 'loading' && (
        <div className="w-full h-full flex items-center justify-center bg-surface-secondary">
          <div className="animate-pulse flex flex-col items-center space-y-2">
            <ImageIcon size={24} className="text-slate-500" />
            <div className="w-16 h-2 bg-slate-700 rounded"></div>
          </div>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority === 'high' ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
};

// Specialized comic cover image component
interface ComicCoverImageProps {
  src: string;
  seriesName: string;
  issueNumber: number;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  priority?: 'high' | 'low';
}

export const ComicCoverImage: React.FC<ComicCoverImageProps> = ({
  src,
  seriesName,
  issueNumber,
  className = '',
  size = 'medium',
  priority = 'low'
}) => {
  const sizeClasses = {
    small: 'w-12 h-16',
    medium: 'w-16 h-24',
    large: 'w-20 h-32',
  };

  const fallbackText = `${seriesName} #${issueNumber}`;

  return (
    <ResponsiveImage
      src={src}
      alt={`${seriesName} #${issueNumber}`}
      className={`${sizeClasses[size]} ${className}`}
      fallbackIcon={<BookOpen size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} className="text-slate-500" />}
      fallbackText={fallbackText}
      aspectRatio="2/3"
      priority={priority}
    />
  );
};
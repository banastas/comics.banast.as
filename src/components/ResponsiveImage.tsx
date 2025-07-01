import React, { useState } from 'react';
import { Award } from 'lucide-react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  sizes?: string;
  priority?: boolean;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'aspect-[2/3]',
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  priority = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  // Generate responsive image URLs (in a real app, these would come from your image service)
  const generateSrcSet = (baseSrc: string) => {
    if (!baseSrc) return '';
    
    // For demo purposes, we'll use the same image
    // In production, you'd have different sizes: 200w, 400w, 800w
    return `${baseSrc} 400w`;
  };

  return (
    <div className={`relative ${aspectRatio} bg-gray-700 overflow-hidden ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-700 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-gray-600 border-t-blue-400 rounded-full animate-spin"></div>
        </div>
      )}
      
      {!imageError && src ? (
        <img
          src={src}
          srcSet={generateSrcSet(src)}
          sizes={sizes}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Award size={24} className="mx-auto mb-2 sm:w-8 sm:h-8" />
            <p className="text-xs sm:text-sm font-medium">No Cover</p>
          </div>
        </div>
      )}
    </div>
  );
};
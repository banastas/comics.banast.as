import React from 'react';

interface LoadingSkeletonProps {
  variant: 'card' | 'list' | 'detail' | 'stats';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant,
  count = 1,
  className = ''
}) => {
  const CardSkeleton = () => (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-gray-700"></div>
      <div className="p-2 sm:p-3 space-y-2">
        <div className="h-3 sm:h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-2 sm:h-3 bg-gray-700 rounded w-1/2"></div>
        <div className="flex justify-between items-center">
          <div className="h-2 sm:h-3 bg-gray-700 rounded w-1/4"></div>
          <div className="h-3 sm:h-4 bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );

  const ListSkeleton = () => (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-16 bg-gray-700 rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/3"></div>
          <div className="h-3 bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="text-right space-y-2">
          <div className="h-4 bg-gray-700 rounded w-20"></div>
          <div className="h-3 bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    </div>
  );

  const DetailSkeleton = () => (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-48 aspect-[2/3] bg-gray-700 rounded-lg"></div>
        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="h-6 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const StatsSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-gray-800 rounded-lg border border-gray-700 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-gray-700 rounded w-3/4"></div>
              <div className="h-5 bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-lg mt-2 sm:mt-0"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const skeletonComponents = {
    card: CardSkeleton,
    list: ListSkeleton,
    detail: DetailSkeleton,
    stats: StatsSkeleton
  };

  const SkeletonComponent = skeletonComponents[variant];

  if (variant === 'stats' || variant === 'detail') {
    return <div className={className}><SkeletonComponent /></div>;
  }

  return (
    <div className={className}>
      {[...Array(count)].map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
};
import React from 'react';

// Consistent lazy loading pattern for all components
export const ComicForm = React.lazy(() => 
  import('./ComicForm').then(module => ({ default: module.ComicForm }))
);

export const ComicDetail = React.lazy(() => 
  import('./ComicDetail').then(module => ({ default: module.ComicDetail }))
);

export const SeriesDetail = React.lazy(() => 
  import('./SeriesDetail').then(module => ({ default: module.SeriesDetail }))
);

export const StorageLocationDetail = React.lazy(() => 
  import('./StorageLocationDetail').then(module => ({ default: module.StorageLocationDetail }))
);

export const CoverArtistDetail = React.lazy(() => 
  import('./CoverArtistDetail').then(module => ({ default: module.CoverArtistDetail }))
);

export const TagDetail = React.lazy(() => 
  import('./TagDetail').then(module => ({ default: module.TagDetail }))
);

export const RawComicsDetail = React.lazy(() => 
  import('./RawComicsDetail').then(module => ({ default: module.RawComicsDetail }))
);

export const SlabbedComicsDetail = React.lazy(() => 
  import('./SlabbedComicsDetail').then(module => ({ default: module.SlabbedComicsDetail }))
);

export const StorageLocationsListing = React.lazy(() => 
  import('./StorageLocationsListing').then(module => ({ default: module.StorageLocationsListing }))
);

export const VariantsDetail = React.lazy(() => 
  import('./VariantsDetail').then(module => ({ default: module.VariantsDetail }))
);


// Loading component for Suspense
export const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-300">Loading...</p>
    </div>
  </div>
);

// Error boundary component
export const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto px-4">
      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-gray-300 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Try again
      </button>
    </div>
  </div>
);

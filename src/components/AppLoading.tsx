export const LoadingSpinner = () => (
  <div className="min-h-screen bg-surface-base flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-400">Loading...</p>
    </div>
  </div>
);

export const CollectionLoading = () => (
  <div className="min-h-screen bg-surface-base flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-400">Loading your collection...</p>
    </div>
  </div>
);

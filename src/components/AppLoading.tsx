export const LoadingSpinner = () => (
  <div className="flex flex-1 items-center justify-center py-24" role="status">
    <div className="text-center">
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" aria-hidden="true"></div>
      <p className="text-slate-400">Loading…</p>
    </div>
  </div>
);

export const CollectionLoading = () => (
  <div className="flex flex-1 items-center justify-center py-24" role="status">
    <div className="text-center">
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" aria-hidden="true"></div>
      <p className="text-slate-400">Loading the collection…</p>
    </div>
  </div>
);

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
}

export const Pagination = ({ currentPage, totalPages, onPageChange, label = 'Collection pages' }: PaginationProps) => {
  if (totalPages <= 1) return null;
  return (
          <nav aria-label={label} className="flex max-w-full flex-wrap justify-center items-center gap-1 sm:gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-1.5 bg-surface-secondary border border-slate-700 rounded-xl text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-elevated transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i;
                else if (currentPage < 3) pageNum = i;
                else if (currentPage >= totalPages - 3) pageNum = totalPages - 5 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`px-2 sm:px-3 py-1.5 rounded-xl text-sm transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white'
                        : 'bg-surface-secondary text-slate-400 hover:bg-surface-elevated hover:text-white'
                    }`}
                    aria-current={currentPage === pageNum ? 'page' : undefined}
                    aria-label={`Page ${pageNum + 1}`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1.5 bg-surface-secondary border border-slate-700 rounded-xl text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-elevated transition-colors"
            >
              Next
            </button>
          </nav>
  );
};

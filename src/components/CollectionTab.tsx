import { Pagination } from './Pagination';
import { BookOpen, Plus } from 'lucide-react';
import { Dashboard } from './Dashboard';
import { ComicCard } from './ComicCard';
import { ComicListView } from './ComicListView';
import type { Comic, ComicStats } from '../types/Comic';

interface CollectionTabProps {
  stats: ComicStats;
  allComics: Comic[];
  filteredComics: Comic[];
  paginatedComics: Comic[];
  viewMode: 'grid' | 'list';
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  allVirtualBoxesCount: number;
  variantsCount: number;
  allComputedTags: string[];
  computedTagCounts: Map<string, number>;
  activeComputedTag: string | null;
  onViewComic: (comic: Comic) => void;
  onViewRawComics: () => void;
  onViewSlabbedComics: () => void;
  onViewVariants: () => void;
  onViewVirtualBoxes: () => void;
  onSetActiveComputedTag: (tag: string | null) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onShowForm: () => void;
}

export const CollectionTab = ({
  stats,
  allComics,
  filteredComics,
  paginatedComics,
  viewMode,
  currentPage,
  itemsPerPage,
  totalPages,
  allVirtualBoxesCount,
  variantsCount,
  allComputedTags,
  computedTagCounts,
  activeComputedTag,
  onViewComic,
  onViewRawComics,
  onViewSlabbedComics,
  onViewVariants,
  onViewVirtualBoxes,
  onSetActiveComputedTag,
  onPageChange,
  onItemsPerPageChange,
  onShowForm,
}: CollectionTabProps) => (
  <div className="animate-fade-in">
    <div className="pt-4 sm:pt-6 lg:pt-8">
      <Dashboard
        stats={stats}
        onViewComic={onViewComic}
        onViewRawComics={onViewRawComics}
        onViewSlabbedComics={onViewSlabbedComics}
        onViewVariants={onViewVariants}
        onViewVirtualBoxes={onViewVirtualBoxes}
        virtualBoxesCount={allVirtualBoxesCount}
        variantsCount={variantsCount}
      />
    </div>

    <div className="flex items-center gap-2 flex-wrap pt-5 pb-3">
      {allComputedTags
        .filter((tag) => (computedTagCounts.get(tag) || 0) >= 5)
        .slice(0, 10)
        .map((tag) => {
          const count = computedTagCounts.get(tag) || 0;
          const isActive = activeComputedTag === tag;

          return (
            <button
              key={tag}
              onClick={() => onSetActiveComputedTag(isActive ? null : tag)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500 text-white shadow-glow'
                  : 'bg-surface-secondary text-slate-400 border border-slate-700/50 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              {tag}
              <span className={`tabular-nums ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>{count}</span>
            </button>
          );
        })}
    </div>

    {filteredComics.length > 0 && (
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-3 md:space-y-0">
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
          <span role="status" className="text-sm text-slate-400">
            Showing {currentPage * itemsPerPage + 1} to {Math.min((currentPage + 1) * itemsPerPage, filteredComics.length)} of {filteredComics.length}
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            aria-label="Comics per page"
            className="bg-surface-secondary border border-slate-700 rounded-xl px-3 py-1 text-sm text-white cursor-pointer"
          >
            <option value={48}>48 per page</option>
            <option value={96}>96 per page</option>
            <option value={192}>192 per page</option>
          </select>
        </div>

        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        )}
      </div>
    )}

    {filteredComics.length === 0 ? (
      <div className="text-center py-12 sm:py-16">
        <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">
          {allComics.length === 0 ? 'No comics in your collection' : 'No comics match your filters'}
        </h3>
        <p className="text-sm text-slate-400 mb-6 px-4">
          {allComics.length === 0
            ? 'Start building your collection by adding your first comic!'
            : 'Try adjusting your search criteria or filters.'
          }
        </p>
        {allComics.length === 0 && (
          <button
            onClick={onShowForm}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
          >
            <Plus size={20} />
            <span>Add Your First Comic</span>
          </button>
        )}
      </div>
    ) : (
      <>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {paginatedComics.map((comic) => (
              <ComicCard key={comic.id} comic={comic} onView={onViewComic} />
            ))}
          </div>
        ) : (
          <ComicListView comics={paginatedComics} onView={onViewComic} />
        )}
        <div className="flex justify-center pt-6">
          <Pagination label="More collection pages" currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      </>
    )}
  </div>
);

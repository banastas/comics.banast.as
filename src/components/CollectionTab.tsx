import { useMemo } from 'react';
import { BookOpen, Plus, X } from 'lucide-react';
import { Pagination } from './Pagination';
import { ComicGridList } from './ComicGridList';
import { SiteLink } from './SiteLink';
import type { Comic, ComicStats } from '../types/Comic';
import { formatWholeCurrency } from '../utils/formatting';

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
  /** Tag counts within the current search, so each chip says how many results it would show. */
  tagCounts: Map<string, number>;
  activeComputedTag: string | null;
  searchTerm: string;
  onViewComic: (comic: Comic) => void;
  onSetActiveComputedTag: (tag: string | null) => void;
  onClearSearch: () => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onShowForm: () => void;
}

const quickLinkClass = 'inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-surface-primary px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-slate-500 hover:text-white';

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
  tagCounts,
  activeComputedTag,
  searchTerm,
  onViewComic,
  onSetActiveComputedTag,
  onClearSearch,
  onClearFilters,
  onPageChange,
  onItemsPerPageChange,
  onShowForm,
}: CollectionTabProps) => {
  const isFiltered = Boolean(searchTerm || activeComputedTag);
  const filteredValue = useMemo(
    () => filteredComics.reduce((sum, comic) => sum + (comic.currentValue ?? 0), 0),
    [filteredComics],
  );
  const visibleTags = allComputedTags
    .filter((tag) => tag === activeComputedTag || (tagCounts.get(tag) || 0) > 0)
    .filter((tag) => tag === activeComputedTag || isFiltered || (tagCounts.get(tag) || 0) >= 5)
    .slice(0, 12);
  const firstShown = currentPage * itemsPerPage + 1;
  const lastShown = Math.min((currentPage + 1) * itemsPerPage, filteredComics.length);

  return (
    <div className="animate-fade-in space-y-4 pt-5 sm:space-y-5 sm:pt-7">
      <section aria-labelledby="collection-heading" className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 id="collection-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Comic Collection</h1>
          <p className="mt-1 text-sm text-slate-300 sm:text-base">
            {isFiltered ? (
              <>
                <span className="font-semibold text-white">{filteredComics.length.toLocaleString('en-US')}</span> of {stats.totalComics.toLocaleString('en-US')} comics match
                {' · '}<span className="font-semibold text-white">{formatWholeCurrency(filteredValue)}</span> current value
              </>
            ) : (
              <>
                <span className="font-semibold text-white">{stats.totalComics.toLocaleString('en-US')}</span> comics
                {' · '}<span className="font-semibold text-white">{formatWholeCurrency(stats.totalCurrentValue)}</span> current value
              </>
            )}
          </p>
        </div>

        <nav aria-label="Browse by type" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex gap-2 sm:flex-wrap [&>li]:shrink-0">
            {stats.slabbedComics > 0 && (
              <li><SiteLink to={{ type: 'slabbed' }} className={quickLinkClass}>Slabbed <span className="tabular-nums text-slate-400">{stats.slabbedComics}</span></SiteLink></li>
            )}
            {stats.rawComics > 0 && (
              <li><SiteLink to={{ type: 'raw' }} className={quickLinkClass}>Raw <span className="tabular-nums text-slate-400">{stats.rawComics}</span></SiteLink></li>
            )}
            {variantsCount > 0 && (
              <li><SiteLink to={{ type: 'variants' }} className={quickLinkClass}>Variants <span className="tabular-nums text-slate-400">{variantsCount}</span></SiteLink></li>
            )}
            {allVirtualBoxesCount > 0 && (
              <li><SiteLink to={{ type: 'boxes' }} className={quickLinkClass}>Boxes <span className="tabular-nums text-slate-400">{allVirtualBoxesCount}</span></SiteLink></li>
            )}
          </ul>
        </nav>
      </section>

      {visibleTags.length > 0 && (
        <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0 [&>button]:shrink-0" role="group" aria-label="Filter by tag">
          {visibleTags.map((tag) => {
            const count = tagCounts.get(tag) || 0;
            const isActive = activeComputedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => onSetActiveComputedTag(isActive ? null : tag)}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-glow'
                    : 'border border-slate-700/70 bg-surface-secondary text-slate-300 hover:border-slate-500 hover:text-white'
                }`}
              >
                {tag}
                <span className={`tabular-nums ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {isFiltered && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">Filtered by:</span>
          {searchTerm && (
            <button onClick={onClearSearch} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-blue-200 transition-colors hover:bg-blue-500/20" aria-label={`Remove search: ${searchTerm}`}>
              Search: {searchTerm}<X size={12} aria-hidden="true" />
            </button>
          )}
          {activeComputedTag && (
            <button onClick={() => onSetActiveComputedTag(null)} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-blue-200 transition-colors hover:bg-blue-500/20" aria-label={`Remove tag: ${activeComputedTag}`}>
              Tag: {activeComputedTag}<X size={12} aria-hidden="true" />
            </button>
          )}
          {searchTerm && activeComputedTag && (
            <button onClick={onClearFilters} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1 text-slate-300 transition-colors hover:border-slate-500 hover:text-white" aria-label="Clear all filters">
              Clear all<X size={12} aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {filteredComics.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span role="status" className="text-sm text-slate-300">
              Showing {firstShown.toLocaleString('en-US')}–{lastShown.toLocaleString('en-US')} of {filteredComics.length.toLocaleString('en-US')}
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              aria-label="Comics per page"
              className="cursor-pointer rounded-xl border border-slate-700 bg-surface-secondary px-3 py-1 text-sm text-white"
            >
              <option value={48}>48 per page</option>
              <option value={96}>96 per page</option>
              <option value={192}>192 per page</option>
            </select>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}

      <h2 className="sr-only">Comics</h2>
      {filteredComics.length === 0 ? (
        <div className="py-12 text-center sm:py-16">
          <BookOpen size={48} className="mx-auto mb-4 text-slate-500" aria-hidden="true" />
          <p className="mb-2 text-lg font-medium text-white">
            {allComics.length === 0 ? 'No comics in the collection yet' : 'No comics match these filters'}
          </p>
          <p className="mb-6 px-4 text-sm text-slate-400">
            {allComics.length === 0 ? 'Add a comic to start the collection.' : 'Try a different search or remove a filter.'}
          </p>
          {allComics.length === 0 ? (
            <button
              onClick={onShowForm}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white shadow-lg transition-colors hover:bg-blue-500"
            >
              <Plus size={20} aria-hidden="true" />
              Add a comic
            </button>
          ) : (
            <button onClick={onClearFilters} className="rounded-xl border border-slate-600 px-4 py-2 text-sm text-white hover:border-slate-400">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <ComicGridList comics={paginatedComics} viewMode={viewMode} onView={onViewComic} />
          <div className="flex justify-center pt-2">
            <Pagination label="More collection pages" currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
          </div>
        </>
      )}
    </div>
  );
};

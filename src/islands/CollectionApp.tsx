import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Comic, ComicStats, SortField } from '../types/Comic';
import { CollectionTab } from '../components/CollectionTab';
import { MobileControls } from '../components/MobileControls';
import { SiteHeader } from '../components/SiteHeader';
import { applyFilters, defaultFilters, matchesSearch } from '../utils/collection-filter';
import { computeTagData } from '../utils/computed-tags';
import { loadComicIndex } from '../utils/comic-index';
import { buildQueryString, DEFAULT_SORT_DIRECTION, DEFAULT_SORT_FIELD, isSortField } from '../utils/routing';
import { trackPageViewOnce } from '../utils/analytics';

const ITEMS_PER_PAGE_KEY = 'comics:itemsPerPage';
export const DEFAULT_ITEMS_PER_PAGE = 48;

export interface CollectionAppProps {
  stats: ComicStats;
  variantsCount: number;
  boxesCount: number;
  /** Computed tags, most common first. */
  computedTags: string[];
  tagCounts: Record<string, number>;
  /** The default view (newest releases first), rendered at build time. */
  firstPage: Comic[];
}

interface ViewState {
  searchTerm: string;
  tag: string | null;
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  page: number;
}

const DEFAULT_STATE: ViewState = {
  searchTerm: '',
  tag: null,
  sortField: DEFAULT_SORT_FIELD,
  sortDirection: DEFAULT_SORT_DIRECTION,
  viewMode: 'grid',
  page: 0,
};

/** Reads the collection view from the query string; unknown values fall back to defaults. */
export const readViewState = (search: string): ViewState => {
  const params = new URLSearchParams(search);
  const sort = params.get('sort');
  const page = Number.parseInt(params.get('page') ?? '', 10);
  return {
    searchTerm: params.get('search')?.trim() ?? '',
    tag: params.get('filter') || null,
    sortField: isSortField(sort) ? sort : DEFAULT_SORT_FIELD,
    sortDirection: params.get('order') === 'asc' ? 'asc' : 'desc',
    viewMode: params.get('view') === 'list' ? 'list' : 'grid',
    page: Number.isSafeInteger(page) && page > 1 ? page - 1 : 0,
  };
};

const queryFor = (state: ViewState) => buildQueryString({
  searchTerm: state.searchTerm,
  computedTag: state.tag,
  sortField: state.sortField,
  sortDirection: state.sortDirection,
  viewMode: state.viewMode,
  page: state.page,
});

const readItemsPerPage = () => {
  let stored: string | null = null;
  try { stored = window.localStorage.getItem(ITEMS_PER_PAGE_KEY); } catch { /* storage can be blocked */ }
  const parsed = stored ? Number.parseInt(stored, 10) : NaN;
  return [48, 96, 192].includes(parsed) ? parsed : DEFAULT_ITEMS_PER_PAGE;
};

const scrollToTop = () => window.scrollTo({
  top: 0,
  behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
});

/** The home page: header search, view and sort controls, tag filters and the paged collection. */
export default function CollectionApp({ stats, variantsCount, boxesCount, computedTags, tagCounts: initialTagCounts, firstPage }: CollectionAppProps) {
  const [state, setState] = useState<ViewState>(DEFAULT_STATE);
  const [searchInput, setSearchInput] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [comics, setComics] = useState<Comic[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  // How the next state change is written to the URL: a new history entry, a replacement, or not at all
  // (the URL itself was the source, on load and on back/forward).
  const historyMode = useRef<'push' | 'replace' | null>(null);

  // Apply the URL and the saved page size after hydration (the static HTML is the default view).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tab') === 'stats') {
      window.location.replace('/stats');
      return;
    }
    const fromUrl = readViewState(window.location.search);
    /* eslint-disable react-hooks/set-state-in-effect */
    setState(fromUrl);
    setSearchInput(fromUrl.searchTerm);
    setItemsPerPage(readItemsPerPage());
    /* eslint-enable react-hooks/set-state-in-effect */
    const onPopState = () => {
      const next = readViewState(window.location.search);
      setState(next);
      setSearchInput(next.searchTerm);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Load the whole collection right after the first paint; search and filters need it.
  useEffect(() => {
    let cancelled = false;
    loadComicIndex()
      .then((loaded) => { if (!cancelled) setComics(loaded); })
      .catch(() => { if (!cancelled) setLoadFailed(true); });
    return () => { cancelled = true; };
  }, []);

  const commit = useCallback((patch: Partial<ViewState>, { replace = false } = {}) => {
    historyMode.current = replace ? 'replace' : 'push';
    setState((previous) => ({ ...previous, ...patch }));
  }, []);

  useEffect(() => {
    const mode = historyMode.current;
    if (!mode) return;
    historyMode.current = null;
    const query = queryFor(state);
    const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
    if (url === `${window.location.pathname}${window.location.search}`) return;
    window.history[mode === 'replace' ? 'replaceState' : 'pushState'](null, '', url);
    trackPageViewOnce(url, document.title);
  }, [state]);

  // Search as the reader types, 300 ms after the last keystroke.
  useEffect(() => {
    const term = searchInput.trim();
    if (term === state.searchTerm) return;
    const timer = window.setTimeout(() => commit({ searchTerm: term, page: 0 }, { replace: true }), term ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [searchInput, state.searchTerm, commit]);

  const handleSearchChange = (value: string) => setSearchInput(value);
  const clearSearch = () => {
    setSearchInput('');
    commit({ searchTerm: '', page: 0 });
  };
  const clearFilters = () => {
    setSearchInput('');
    commit({ searchTerm: '', tag: null, page: 0 });
  };

  const tagData = useMemo(() => (comics ? computeTagData(comics) : null), [comics]);
  const filtered = useMemo(() => (comics && tagData
    ? applyFilters(comics, { ...defaultFilters, searchTerm: state.searchTerm }, state.sortField, state.sortDirection, state.tag, tagData.computedTagsMap)
    : null), [comics, tagData, state.searchTerm, state.sortField, state.sortDirection, state.tag]);

  // Tag counts within the active search, so each chip reflects the results it would show.
  const tagCounts = useMemo(() => {
    if (!comics || !tagData) return new Map(Object.entries(initialTagCounts));
    if (!state.searchTerm) return tagData.computedTagCounts;
    const counts = new Map<string, number>();
    comics.forEach((comic) => {
      if (!matchesSearch(comic, state.searchTerm)) return;
      (tagData.computedTagsMap.get(comic.id) ?? []).forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
    });
    return counts;
  }, [comics, tagData, initialTagCounts, state.searchTerm]);

  const isDefaultView = !state.searchTerm && !state.tag && state.sortField === DEFAULT_SORT_FIELD
    && state.sortDirection === DEFAULT_SORT_DIRECTION && state.page === 0 && itemsPerPage === DEFAULT_ITEMS_PER_PAGE;
  // Until the collection arrives, only the prerendered default view can be shown.
  const loading = !filtered && !isDefaultView && !loadFailed;
  const filteredCount = filtered ? filtered.length : stats.totalComics;
  const filteredValue = filtered ? filtered.reduce((sum, comic) => sum + (comic.currentValue ?? 0), 0) : stats.totalCurrentValue;
  const totalPages = Math.max(1, Math.ceil(filteredCount / itemsPerPage));
  const currentPage = Math.min(state.page, totalPages - 1);
  const paginatedComics = filtered
    ? filtered.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
    : firstPage.slice(0, itemsPerPage);

  const setViewMode = (viewMode: 'grid' | 'list') => commit({ viewMode });
  const setSortField = (sortField: SortField) => commit({ sortField, page: 0 });
  const toggleSortDirection = () => commit({ sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc', page: 0 });
  const closeMobileControls = useCallback(() => setShowMobileControls(false), []);

  return (
    <>
      <SiteHeader
        section="collection"
        totalComics={stats.totalComics}
        searchInput={searchInput}
        onSearchChange={handleSearchChange}
        onClearSearch={clearSearch}
        showCollectionControls
        viewMode={state.viewMode}
        onViewModeChange={setViewMode}
        sortField={state.sortField}
        onSortFieldChange={setSortField}
        sortDirection={state.sortDirection}
        onToggleSortDirection={toggleSortDirection}
        onOpenMobileControls={() => setShowMobileControls(true)}
      />

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-8 sm:px-6 lg:px-8">
        {loadFailed && !isDefaultView && (
          <p role="alert" className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
            The collection could not be loaded. Reload the page to try again.
          </p>
        )}
        <CollectionTab
          stats={stats}
          filteredCount={filteredCount}
          filteredValue={filteredValue}
          paginatedComics={paginatedComics}
          loading={loading}
          viewMode={state.viewMode}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          allVirtualBoxesCount={boxesCount}
          variantsCount={variantsCount}
          allComputedTags={computedTags}
          tagCounts={tagCounts}
          activeComputedTag={state.tag}
          searchTerm={state.searchTerm}
          onSetActiveComputedTag={(tag) => commit({ tag, page: 0 })}
          onClearSearch={clearSearch}
          onClearFilters={clearFilters}
          onPageChange={(page) => { commit({ page }); scrollToTop(); }}
          onItemsPerPageChange={(count) => {
            setItemsPerPage(count);
            try { window.localStorage.setItem(ITEMS_PER_PAGE_KEY, String(count)); } catch { /* ignore quota/privacy errors */ }
            commit({ page: 0 }, { replace: true });
          }}
        />
      </main>

      <MobileControls
        isOpen={showMobileControls}
        onClose={closeMobileControls}
        viewMode={state.viewMode}
        onViewModeChange={setViewMode}
        sortField={state.sortField}
        onSortFieldChange={setSortField}
        sortDirection={state.sortDirection}
        onSortDirectionChange={toggleSortDirection}
      />
    </>
  );
}

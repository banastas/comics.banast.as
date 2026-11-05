import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Comic, ComicStats } from '../types/Comic';
import { Pagination } from './Pagination';
import { KeyStats, PerformanceHighlights } from './Dashboard';
import { DetailPageHeader } from './DetailPageHeader';
import { ComicGridList } from './ComicGridList';
import { sortComics, type DetailSortField } from '../utils/sorting';
import { loadComicIndex, matchesSource, type ListSource } from '../utils/comic-index';
import type { BreadcrumbItem } from './Breadcrumb';

export const DETAIL_PAGE_SIZE = 48;

export interface DetailPageLayoutProps {
  /** Which comics this page lists; used to load the rest of the list on demand. */
  source: ListSource;
  /** The first page of comics in the default sort order, rendered at build time. */
  firstPage: Comic[];
  total: number;
  stats: ComicStats;
  breadcrumbItems: BreadcrumbItem[];

  icon?: React.ReactNode;
  iconBgColor?: string;
  title: string;
  /** Usually an Astro slot (`slot="subtitle"`). */
  subtitle?: React.ReactNode;

  defaultSortBy?: DetailSortField;
  sortOptions?: { value: string; label: string }[];

  /** Extra sections shown below the comics, e.g. series breakdowns or related tags. */
  afterDashboard?: React.ReactNode;

  comicsListTitle: string;
  showSeriesName?: boolean;
  /** Unnamed Astro slot content; unused, declared so slot children type-check. */
  children?: React.ReactNode;
}

/** Sorts a page's comics the same way at build time and in the browser. */
export const firstDetailPage = (comics: Comic[], sortBy: DetailSortField = 'series') =>
  sortComics(comics, sortBy).slice(0, DETAIL_PAGE_SIZE);

const readViewMode = (): 'grid' | 'list' => {
  if (typeof window === 'undefined') return 'grid';
  return new URLSearchParams(window.location.search).get('view') === 'list' ? 'list' : 'grid';
};

// Comics come first; aggregate statistics follow the list so phones reach covers without scrolling
// past two screens of numbers.
export const DetailPageLayout: React.FC<DetailPageLayoutProps> = ({
  source,
  firstPage,
  total,
  stats,
  breadcrumbItems,
  icon,
  iconBgColor = '',
  title,
  subtitle,
  defaultSortBy = 'series',
  sortOptions,
  afterDashboard,
  comicsListTitle,
  showSeriesName,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<DetailSortField>(defaultSortBy);
  const [requestedPage, setRequestedPage] = useState(0);
  const [allComics, setAllComics] = useState<Comic[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const listRef = useRef<HTMLElement>(null);

  // The static page always renders the grid; apply ?view=list after hydration.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setViewMode(readViewMode()), []);

  const needsAll = sortBy !== defaultSortBy || requestedPage > 0;
  useEffect(() => {
    if (!needsAll || allComics) return;
    let cancelled = false;
    loadComicIndex()
      .then((comics) => { if (!cancelled) setAllComics(comics.filter((comic) => matchesSource(comic, source))); })
      .catch(() => { if (!cancelled) setLoadFailed(true); });
    return () => { cancelled = true; };
  }, [needsAll, allComics, source]);

  const totalPages = Math.ceil(total / DETAIL_PAGE_SIZE);
  const currentPage = allComics ? Math.min(requestedPage, Math.max(0, totalPages - 1)) : 0;
  const pageComics = useMemo(() => {
    if (!allComics) return firstPage;
    return sortComics(allComics, sortBy).slice(currentPage * DETAIL_PAGE_SIZE, (currentPage + 1) * DETAIL_PAGE_SIZE);
  }, [allComics, firstPage, sortBy, currentPage]);

  const changePage = (page: number) => {
    setRequestedPage(page);
    listRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
  };
  const changeView = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    const url = new URL(window.location.href);
    if (mode === 'list') url.searchParams.set('view', 'list');
    else url.searchParams.delete('view');
    window.history.replaceState(null, '', url);
  };

  const hasHighlights = Boolean(stats.biggestGainer || stats.biggestLoser || stats.highestValuedSlabbedComic || stats.highestValuedRawComic);
  const loading = needsAll && !allComics && !loadFailed;

  return (
    <main id="main-content" className="flex-1">
      <DetailPageHeader
        onBack={() => window.location.assign('/')}
        viewMode={viewMode}
        onViewModeChange={changeView}
        sortBy={sortBy}
        onSortChange={(value) => { setSortBy(value as DetailSortField); setRequestedPage(0); }}
        sortOptions={sortOptions}
        breadcrumbItems={breadcrumbItems}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <section className="rounded-lg panel bg-surface-primary p-4 sm:p-6">
          <div className="mb-5 flex min-w-0 items-center gap-3">
            {/* Astro passes an empty icon slot when a page has none; pages with an icon set its color. */}
            {icon && iconBgColor && <div className={`shrink-0 rounded-lg p-3 ${iconBgColor}`} aria-hidden="true">{icon}</div>}
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-bold text-white sm:text-3xl">{title}</h1>
              <p className="mt-1 text-slate-300">{subtitle}</p>
            </div>
          </div>
          <KeyStats stats={stats} />
        </section>

        <section ref={listRef} aria-labelledby="detail-comics-heading" aria-busy={loading} className="scroll-mt-32 rounded-lg panel bg-surface-primary p-3 sm:p-6">
          <h2 id="detail-comics-heading" className="mb-3 text-lg font-semibold text-white">{comicsListTitle}</h2>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p role="status" className="text-sm text-slate-300">
              {loadFailed
                ? 'The rest of this list could not be loaded. Reload the page to try again.'
                : <>Showing {total ? currentPage * DETAIL_PAGE_SIZE + 1 : 0}–{Math.min((currentPage + 1) * DETAIL_PAGE_SIZE, total)} of {total}</>}
            </p>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={changePage} />
          </div>
          <ComicGridList comics={pageComics} viewMode={viewMode} showSeriesName={showSeriesName} />
          <div className="flex justify-center pt-6">
            <Pagination label="More pages of comics" currentPage={currentPage} totalPages={totalPages} onPageChange={changePage} />
          </div>
        </section>

        {(hasHighlights || afterDashboard) && (
          <section aria-labelledby="detail-highlights-heading" className="space-y-6 rounded-lg panel bg-surface-primary p-4 sm:p-6">
            <h2 id="detail-highlights-heading" className="text-lg font-semibold text-white">Highlights</h2>
            <PerformanceHighlights stats={stats} />
            {afterDashboard}
          </section>
        )}
      </div>
    </main>
  );
};

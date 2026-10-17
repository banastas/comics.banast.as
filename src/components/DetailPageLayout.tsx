import React, { useState, useMemo, useRef } from 'react';
import type { Comic } from '../types/Comic';
import { Pagination } from './Pagination';
import { KeyStats, PerformanceHighlights } from './Dashboard';
import { DetailPageHeader } from './DetailPageHeader';
import { ComicGridList } from './ComicGridList';
import { calculateComicStats } from '../utils/stats';
import { sortComics, type DetailSortField } from '../utils/sorting';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { parseCurrentUrl } from '../utils/routing';
import type { BreadcrumbItem } from './Breadcrumb';

const PAGE_SIZE = 48;

interface DetailPageLayoutProps {
  comics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  breadcrumbItems?: BreadcrumbItem[];

  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  subtitle: React.ReactNode;

  defaultSortBy?: DetailSortField;
  sortOptions?: { value: string; label: string }[];

  /** Extra sections shown below the comics, e.g. series breakdowns or related tags. */
  afterDashboard?: React.ReactNode;

  comicsListTitle: string;
  listExtraInfo?: (comic: Comic) => React.ReactNode;
  showSeriesName?: boolean;

  seo?: React.ReactNode;
}

// Comics come first; aggregate statistics follow the list so phones reach covers without scrolling
// past two screens of numbers.
export const DetailPageLayout: React.FC<DetailPageLayoutProps> = React.memo(({
  comics,
  onBack,
  onView,
  breadcrumbItems,
  icon,
  iconBgColor,
  title,
  subtitle,
  defaultSortBy = 'series',
  sortOptions,
  afterDashboard,
  comicsListTitle,
  listExtraInfo,
  showSeriesName,
  seo,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => parseCurrentUrl().params.viewMode || 'grid');
  const [sortBy, setSortBy] = useState<DetailSortField>(defaultSortBy);

  const [requestedPage, setRequestedPage] = useState(0);
  const listRef = useRef<HTMLElement>(null);
  const totalPages = Math.ceil(comics.length / PAGE_SIZE);
  const currentPage = Math.min(requestedPage, Math.max(0, totalPages - 1));
  const changePage = (page: number) => {
    setRequestedPage(page);
    listRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
  };

  useScrollToTop();

  const stats = useMemo(() => calculateComicStats(comics), [comics]);
  const sortedComics = useMemo(() => sortComics(comics, sortBy), [comics, sortBy]);
  const hasHighlights = Boolean(stats.biggestGainer || stats.biggestLoser || stats.highestValuedSlabbedComic || stats.highestValuedRawComic);

  return (
    <main id="main-content" className="flex-1">
      {seo}

      <DetailPageHeader
        onBack={onBack}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={(value) => { setSortBy(value as DetailSortField); setRequestedPage(0); }}
        sortOptions={sortOptions}
        breadcrumbItems={breadcrumbItems}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <section className="rounded-xl border border-slate-800 bg-surface-primary p-4 sm:p-6">
          <div className="mb-5 flex min-w-0 items-center gap-3">
            {icon && <div className={`shrink-0 rounded-lg p-3 ${iconBgColor}`} aria-hidden="true">{icon}</div>}
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-bold text-white sm:text-3xl">{title}</h1>
              <p className="mt-1 text-slate-300">{subtitle}</p>
            </div>
          </div>
          <KeyStats stats={stats} />
        </section>

        <section ref={listRef} aria-labelledby="detail-comics-heading" className="scroll-mt-32 rounded-xl border border-slate-800 bg-surface-primary p-3 sm:p-6">
          <h2 id="detail-comics-heading" className="mb-3 text-lg font-semibold text-white">{comicsListTitle}</h2>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p role="status" className="text-sm text-slate-300">
              Showing {comics.length ? currentPage * PAGE_SIZE + 1 : 0}–{Math.min((currentPage + 1) * PAGE_SIZE, comics.length)} of {comics.length}
            </p>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={changePage} />
          </div>
          <ComicGridList
            comics={sortedComics.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)}
            viewMode={viewMode}
            onView={onView}
            listExtraInfo={listExtraInfo}
            showSeriesName={showSeriesName}
          />
          <div className="flex justify-center pt-6">
            <Pagination label="More pages of comics" currentPage={currentPage} totalPages={totalPages} onPageChange={changePage} />
          </div>
        </section>

        {(hasHighlights || afterDashboard) && (
          <section aria-labelledby="detail-highlights-heading" className="space-y-6 rounded-xl border border-slate-800 bg-surface-primary p-4 sm:p-6">
            <h2 id="detail-highlights-heading" className="text-lg font-semibold text-white">Highlights</h2>
            <PerformanceHighlights stats={stats} />
            {afterDashboard}
          </section>
        )}
      </div>
    </main>
  );
});

DetailPageLayout.displayName = 'DetailPageLayout';

import { Pagination } from './Pagination';
import React, { useState, useMemo, useRef } from 'react';
import { Comic } from '../types/Comic';
import { Dashboard } from './Dashboard';
import { DetailPageHeader } from './DetailPageHeader';
import { ComicGridList } from './ComicGridList';
import { calculateComicStats } from '../utils/stats';
import { sortComics, DetailSortField } from '../utils/sorting';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { parseCurrentUrl } from '../utils/routing';
import { BreadcrumbItem } from './Breadcrumb';

interface DetailPageLayoutProps {
  comics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  breadcrumbItems?: BreadcrumbItem[];

  // Header
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  subtitle: React.ReactNode;

  // Sort
  defaultSortBy?: DetailSortField;
  sortOptions?: { value: string; label: string }[];

  // Dashboard extra props
  dashboardProps?: Record<string, unknown>;

  // Custom content after dashboard (e.g. SeriesBreakdown, related tags)
  afterDashboard?: React.ReactNode;

  // Comics list section
  comicsListTitle: string;
  gridBadges?: (comic: Comic) => React.ReactNode;
  listBadges?: (comic: Comic) => React.ReactNode;
  listExtraInfo?: (comic: Comic) => React.ReactNode;
  showSeriesName?: boolean;

  // Optional SEO element
  seo?: React.ReactNode;
}

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
  dashboardProps,
  afterDashboard,
  comicsListTitle,
  gridBadges,
  listBadges,
  listExtraInfo,
  showSeriesName,
  seo,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => parseCurrentUrl().params.viewMode || 'grid');
  const [sortBy, setSortBy] = useState<DetailSortField>(defaultSortBy);

  const [requestedPage, setRequestedPage] = useState(0);
  const listRef = useRef<HTMLElement>(null);
  const totalPages = Math.ceil(comics.length / 48);
  const currentPage = Math.min(requestedPage, Math.max(0, totalPages - 1));
  const changePage = (page: number) => {
    setRequestedPage(page);
    listRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
  };

  useScrollToTop();

  const stats = useMemo(() => calculateComicStats(comics), [comics]);
  const sortedComics = useMemo(() => sortComics(comics, sortBy), [comics, sortBy]);

  return (
    <div className="min-h-screen bg-surface-base">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="space-y-8">
          <div className="bg-surface-primary rounded-lg shadow-lg border border-slate-800 p-3 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex min-w-0 items-center space-x-3">
                {icon && (
                  <div className={`shrink-0 p-3 ${iconBgColor} rounded-lg`}>
                    {icon}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl sm:text-3xl break-words font-bold text-white mb-2">{title}</h1>
                  <p className="text-slate-300">{subtitle}</p>
                </div>
              </div>
            </div>

            <Dashboard
              stats={stats}
              showDetailed={true}
              variantsCount={comics.filter((comic) => comic.isVariant).length}
              onViewComic={onView}
              {...dashboardProps}
            />

            {afterDashboard}
          </div>

          <section ref={listRef} className="bg-surface-primary rounded-lg shadow-lg border border-slate-800 p-3 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{comicsListTitle}</h3>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <p role="status" className="text-sm text-slate-400">Showing {comics.length ? currentPage * 48 + 1 : 0} to {Math.min((currentPage + 1) * 48, comics.length)} of {comics.length}</p>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={changePage} />
            </div>
            <ComicGridList
              comics={sortedComics.slice(currentPage * 48, (currentPage + 1) * 48)}
              viewMode={viewMode}
              onView={onView}
              gridBadges={gridBadges}
              listBadges={listBadges}
              listExtraInfo={listExtraInfo}
              showSeriesName={showSeriesName}
            />
            <div className="flex justify-center pt-6">
              <Pagination label="More collection pages" currentPage={currentPage} totalPages={totalPages} onPageChange={changePage} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
});

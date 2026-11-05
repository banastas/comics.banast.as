import React, { useEffect, useState } from 'react';
import { Archive, BarChart3, BookOpen, Grid, List, Search, SlidersHorizontal, SortAsc, SortDesc, X } from 'lucide-react';
import type { SortField } from '../types/Comic';
import { SiteLink } from './SiteLink';
import { sortFieldOptions } from '../utils/sort-options';

export type HeaderSection = 'collection' | 'stats' | 'boxes' | null;

interface SiteHeaderProps {
  section: HeaderSection;
  totalComics: number;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  /** View and sort controls only apply to the main collection list. */
  showCollectionControls: boolean;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortField: SortField;
  onSortFieldChange: (field: SortField) => void;
  sortDirection: 'asc' | 'desc';
  onToggleSortDirection: () => void;
  onOpenMobileControls: () => void;
  /**
   * Off the collection page the search form submits to the collection
   * (`/?search=…`) instead of filtering in place.
   */
  submitToCollection?: boolean;
}

const SearchField: React.FC<{
  id: string;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  autoFocus?: boolean;
  className?: string;
  submitToCollection?: boolean;
}> = ({ id, value, onChange, onClear, autoFocus, className = '', submitToCollection = false }) => (
  <form
    role="search"
    action="/"
    method="get"
    className={`relative ${className}`}
    onSubmit={(event) => { if (!submitToCollection || !value.trim()) event.preventDefault(); }}
  >
    <label htmlFor={id} className="sr-only">Search comics</label>
    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
    <input
      id={id}
      name="search"
      type="search"
      placeholder="Search titles, artists, notes…"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => { if (event.key === 'Escape' && value) { event.preventDefault(); onClear(); } }}
      autoFocus={autoFocus}
      aria-label="Search comics"
      enterKeyHint="search"
      className="w-full rounded-xl border border-slate-700 bg-surface-secondary py-2 pl-9 pr-10 text-base text-white placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-400/50 md:text-sm [&::-webkit-search-cancel-button]:hidden"
    />
    {value && (
      <button
        type="button"
        onClick={onClear}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-slate-400 transition-colors hover:text-white"
        aria-label="Clear search"
      >
        <X size={14} />
      </button>
    )}
  </form>
);

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  section,
  totalComics,
  searchInput,
  onSearchChange,
  onClearSearch,
  showCollectionControls,
  viewMode,
  onViewModeChange,
  sortField,
  onSortFieldChange,
  sortDirection,
  onToggleSortDirection,
  onOpenMobileControls,
  submitToCollection = false,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(Boolean(searchInput));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tabs = [
    { key: 'collection' as const, label: 'Collection', icon: BookOpen },
    { key: 'stats' as const, label: 'Statistics', icon: BarChart3 },
    { key: 'boxes' as const, label: 'Boxes', icon: Archive },
  ];

  return (
    <header className={`halftone sticky top-0 z-30 border-b-2 border-black bg-surface-primary/95 backdrop-blur-md transition-shadow duration-200 ${
      isScrolled ? 'shadow-lg shadow-black/40' : ''
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-3 sm:h-16">
          <SiteLink to={{ type: 'collection' }} className="group flex min-w-0 shrink-0 items-center gap-2 sm:gap-3" aria-label="comics.banast.as home">
            <img src="/favicon.svg" alt="" width={40} height={40} className="h-9 w-9 shrink-0 transition-transform group-hover:-rotate-6 sm:h-10 sm:w-10" />
            <span className="min-w-0 leading-none">
              <span className="block font-display text-2xl font-extrabold uppercase italic tracking-wide text-paper sm:text-[1.7rem]">
                Comics<span className="text-blue-500">.</span><span className="text-sm font-bold normal-case not-italic tracking-normal text-slate-400">banast.as</span>
              </span>
              <span className="mt-0.5 hidden text-xs text-slate-400 sm:block">{totalComics.toLocaleString('en-US')} comics</span>
            </span>
          </SiteLink>

          <SearchField
            id="site-search"
            value={searchInput}
            onChange={onSearchChange}
            onClear={onClearSearch}
            submitToCollection={submitToCollection}
            className="mx-2 hidden max-w-md flex-1 md:block"
          />

          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-surface-secondary hover:text-white md:hidden"
              aria-label={showMobileSearch ? 'Hide search' : 'Show search'}
              aria-expanded={showMobileSearch}
              aria-controls="mobile-search"
            >
              <Search size={20} />
            </button>

            {showCollectionControls && (
              <>
                <button
                  onClick={onOpenMobileControls}
                  className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-surface-secondary hover:text-white md:hidden"
                  aria-label="Open view and sort controls"
                >
                  <SlidersHorizontal size={20} />
                </button>

                <div className="hidden items-center gap-2 md:flex">
                  <div className="flex overflow-hidden rounded-xl border border-slate-700" role="group" aria-label="Layout">
                    <button
                      onClick={() => onViewModeChange('grid')}
                      className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-ink' : 'text-slate-300 hover:bg-surface-secondary hover:text-white'}`}
                      aria-label="Grid view"
                      aria-pressed={viewMode === 'grid'}
                    >
                      <Grid size={16} />
                    </button>
                    <button
                      onClick={() => onViewModeChange('list')}
                      className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-ink' : 'text-slate-300 hover:bg-surface-secondary hover:text-white'}`}
                      aria-label="List view"
                      aria-pressed={viewMode === 'list'}
                    >
                      <List size={16} />
                    </button>
                  </div>

                  <select
                    value={sortField}
                    onChange={(event) => onSortFieldChange(event.target.value as SortField)}
                    aria-label="Sort by"
                    className="cursor-pointer rounded-xl border border-slate-700 bg-surface-secondary px-3 py-2 text-sm text-white transition-colors hover:border-slate-500"
                  >
                    {sortFieldOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>

                  <button
                    onClick={onToggleSortDirection}
                    className="rounded-xl border border-slate-700 p-2 text-slate-300 transition-colors hover:bg-surface-secondary hover:text-white"
                    aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
                    title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    {sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showMobileSearch && (
        <div id="mobile-search" className="animate-slide-down px-4 pb-3 md:hidden">
          <SearchField
            id="mobile-site-search"
            value={searchInput}
            onChange={onSearchChange}
            onClear={() => { onClearSearch(); setShowMobileSearch(false); }}
            autoFocus={!searchInput}
            submitToCollection={submitToCollection}
          />
        </div>
      )}

      <div className="border-t border-slate-800/60">
        <nav className="mx-auto flex max-w-7xl gap-5 overflow-x-auto px-4 sm:gap-8 sm:px-6 lg:px-8" aria-label="Sections">
          {tabs.map(({ key, label, icon: Icon }) => (
            <SiteLink
              key={key}
              to={{ type: key }}
              aria-current={section === key ? 'page' : undefined}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                section === key
                  ? 'border-blue-400 text-blue-300'
                  : 'border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-200'
              }`}
            >
              <Icon size={15} aria-hidden="true" />
              {label}
            </SiteLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

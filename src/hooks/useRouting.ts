import { useEffect, useCallback, useRef, useState } from 'react';
import {
  buildQueryString,
  createComicSlug,
  DEFAULT_SORT_DIRECTION,
  DEFAULT_SORT_FIELD,
  navigateToUrl,
  parseComicSlug,
  parseCurrentUrl,
  parseRoute,
  type RouteParams,
} from '../utils/routing';
import type { Comic, FilterOptions, SortField } from '../types/Comic';
import { computeTagsForComic } from '../utils/computed-tags';

export type ConditionView = 'raw' | 'slabbed' | 'variants';

export interface RouteSelection {
  comic?: Comic;
  series: string | null;
  storageLocation: string | null;
  coverArtist: string | null;
  tag: string | null;
  condition: ConditionView | null;
  showVirtualBoxes: boolean;
}

export const emptySelection: RouteSelection = {
  comic: undefined,
  series: null,
  storageLocation: null,
  coverArtist: null,
  tag: null,
  condition: null,
  showVirtualBoxes: false,
};

interface UseRoutingProps {
  /** Routes resolve only after the collection has loaded, so valid URLs never flash "not found". */
  ready: boolean;
  viewMode: 'grid' | 'list';
  searchTerm: string;
  activeComputedTag: string | null;
  sortField: SortField;
  sortDirection: 'asc' | 'desc';

  setActiveTab: (tab: 'collection' | 'stats') => void;
  setSelection: (selection: RouteSelection) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  setSortField: (field: SortField) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  setActiveComputedTag: (tag: string | null) => void;
  setCurrentPage: (page: number) => void;

  allComics: Comic[];
}

export type RouteType =
  | 'home'
  | 'collection'
  | 'stats'
  | 'comic'
  | 'series'
  | 'storage'
  | 'artist'
  | 'tag'
  | 'raw'
  | 'slabbed'
  | 'variants'
  | 'boxes';

const routePath = (type: RouteType, identifier?: string): string => {
  switch (type) {
    case 'home':
    case 'collection':
      return '/';
    case 'stats':
    case 'raw':
    case 'slabbed':
    case 'variants':
    case 'boxes':
      return `/${type}`;
    default:
      return `/${type}/${encodeURIComponent(identifier || '')}`;
  }
};

const findComicForSlug = (allComics: Comic[], slug: string): Comic | undefined => {
  try {
    const { seriesSlug, issueNumber, isVariant, comicId } = parseComicSlug(slug);
    if (comicId) return allComics.find(c => c.id === comicId);
    return allComics.find(c => createComicSlug(c) === slug)
      ?? allComics.find(c => {
        const matchesSeries = c.seriesName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') === seriesSlug;
        return matchesSeries && c.issueNumber.toString() === issueNumber && c.isVariant === isVariant;
      });
  } catch {
    // Legacy record-ID URLs.
    return allComics.find(c => c.id === slug);
  }
};

export const useRouting = ({
  ready,
  viewMode,
  searchTerm,
  activeComputedTag,
  sortField,
  sortDirection,
  setActiveTab,
  setSelection,
  setViewMode,
  setFilters,
  setSortField,
  setSortDirection,
  setActiveComputedTag,
  setCurrentPage,
  allComics,
}: UseRoutingProps) => {
  const [notFound, setNotFound] = useState(false);

  // Collection state (search, tag, view, sort) travels with every navigation so returning to the
  // collection restores it. Only non-default values are written.
  const navigateToRoute = useCallback((
    type: RouteType,
    identifier?: string,
    params?: RouteParams,
    replace = false
  ) => {
    const merged: RouteParams = {
      viewMode,
      searchTerm,
      sortField,
      sortDirection,
      computedTag: activeComputedTag,
      ...params,
    };
    if (type !== 'home' && type !== 'collection') delete merged.page;
    const queryString = buildQueryString(merged);
    navigateToUrl(routePath(type, identifier) + (queryString ? `?${queryString}` : ''), replace);
  }, [viewMode, searchTerm, sortField, sortDirection, activeComputedTag]);

  const handleUrlChange = useCallback(() => {
    const { route, params } = parseCurrentUrl();
    const { type, params: routeParams } = parseRoute(route);

    setActiveComputedTag(params.computedTag || null);
    setViewMode(params.viewMode || 'grid');
    if ((params.searchTerm ?? '') !== searchTerm) setFilters({ searchTerm: params.searchTerm ?? '' });
    setSortField(params.sortField || DEFAULT_SORT_FIELD);
    setSortDirection(params.sortDirection || DEFAULT_SORT_DIRECTION);

    let selection: RouteSelection = emptySelection;
    let found = true;

    switch (type) {
      case 'home':
      case 'collection':
        setActiveTab('collection');
        setCurrentPage(params.page ?? 0);
        break;
      case 'stats':
        setActiveTab('stats');
        break;
      case 'comic': {
        const comic = routeParams.comicId ? findComicForSlug(allComics, routeParams.comicId) : undefined;
        found = Boolean(comic);
        selection = { ...emptySelection, comic };
        break;
      }
      case 'series':
        found = allComics.some(c => c.seriesName === routeParams.seriesName);
        selection = { ...emptySelection, series: routeParams.seriesName ?? null };
        break;
      case 'storage':
        found = allComics.some(c => c.storageLocation === routeParams.storageLocation);
        selection = { ...emptySelection, storageLocation: routeParams.storageLocation ?? null };
        break;
      case 'artist':
        found = allComics.some(c => c.coverArtist === routeParams.coverArtist);
        selection = { ...emptySelection, coverArtist: routeParams.coverArtist ?? null };
        break;
      case 'tag': {
        const tag = routeParams.tag || '';
        found = allComics.some(c => c.tags.includes(tag) || computeTagsForComic(c).includes(tag));
        selection = { ...emptySelection, tag: routeParams.tag ?? null };
        break;
      }
      case 'raw':
      case 'slabbed':
      case 'variants':
        selection = { ...emptySelection, condition: type };
        break;
      case 'boxes':
        selection = { ...emptySelection, showVirtualBoxes: true };
        break;
      default:
        found = false;
    }

    setNotFound(!found);
    setSelection(found ? selection : emptySelection);
  }, [
    searchTerm,
    allComics,
    setActiveTab,
    setSelection,
    setViewMode,
    setFilters,
    setSortField,
    setSortDirection,
    setActiveComputedTag,
    setCurrentPage,
  ]);

  // React state changes must not replay navigation or erase a draft filter.
  const handleUrlChangeRef = useRef(handleUrlChange);
  useEffect(() => { handleUrlChangeRef.current = handleUrlChange; }, [handleUrlChange]);
  useEffect(() => {
    if (!ready) return undefined;
    const syncRoute = () => handleUrlChangeRef.current();
    syncRoute();
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('urlchange', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('urlchange', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, [ready, allComics]);

  return {
    navigateToRoute,
    notFound,
  };
};

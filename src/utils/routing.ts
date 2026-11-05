import type { SortField } from '../types/Comic';
import { comicSlug, type ComicSlugInput } from './comic-slug';

export type { ComicSlugInput };

// Collection view state in the query string. Only non-default values are
// written, so a plain visit reads "/" and shared links stay short.

export interface RouteParams {
  viewMode?: 'grid' | 'list';
  searchTerm?: string;
  computedTag?: string | null;
  sortField?: SortField;
  sortDirection?: 'asc' | 'desc';
  /** Zero-based collection page. Written to the URL as a one-based `page` parameter. */
  page?: number;
}

export const DEFAULT_VIEW_MODE = 'grid';
export const DEFAULT_SORT_FIELD: SortField = 'releaseDate';
export const DEFAULT_SORT_DIRECTION = 'desc';

export const buildQueryString = (params: RouteParams): string => {
  const searchParams = new URLSearchParams();
  if (params.viewMode && params.viewMode !== DEFAULT_VIEW_MODE) searchParams.set('view', params.viewMode);
  if (params.searchTerm) searchParams.set('search', params.searchTerm);
  if (params.computedTag) searchParams.set('filter', params.computedTag);
  if (params.sortField && params.sortField !== DEFAULT_SORT_FIELD) searchParams.set('sort', params.sortField);
  if (params.sortDirection && params.sortDirection !== DEFAULT_SORT_DIRECTION) searchParams.set('order', params.sortDirection);
  if (params.page && params.page > 0) searchParams.set('page', String(params.page + 1));
  return searchParams.toString();
};

const sortFields = ['title', 'seriesName', 'issueNumber', 'releaseDate', 'grade', 'purchaseDate', 'purchasePrice', 'currentValue'] as const;

export const isSortField = (value: string | null): value is SortField =>
  value !== null && sortFields.includes(value as SortField);

/** The comic's permalink slug (stored slug first). */
export const createComicSlug = (comic: ComicSlugInput): string => comicSlug(comic);

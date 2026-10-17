import type { Comic, SortField } from '../types/Comic';

export type ComicSlugInput = Pick<Comic, 'id' | 'seriesName' | 'isVariant'> & {
  issueNumber: string | number;
};

// URL path constants
export const ROUTES = {
  HOME: '/',
  COLLECTION: '/collection',
  STATS: '/stats',
  COMIC: '/comic',
  SERIES: '/series',
  STORAGE_LOCATION: '/storage',
  COVER_ARTIST: '/artist',
  TAG: '/tag',
  RAW_COMICS: '/raw',
  SLABBED_COMICS: '/slabbed',
  VARIANTS: '/variants',
  VIRTUAL_BOXES: '/boxes',
} as const;

// URL parameter types
export interface RouteParams {
  comicId?: string;
  seriesName?: string;
  storageLocation?: string;
  coverArtist?: string;
  tag?: string;
  condition?: 'raw' | 'slabbed' | 'variants';
  tab?: 'collection' | 'stats';
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

// Only non-default state is written, so a plain visit reads "/" and shared links stay short.
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
const viewModes = ['grid', 'list'] as const;

export const isSortField = (value: string | null): value is SortField => {
  return value !== null && sortFields.includes(value as SortField);
};

const isViewMode = (value: string | null): value is 'grid' | 'list' => {
  return value !== null && viewModes.includes(value as 'grid' | 'list');
};

// Generate URLs for different routes
export const generateUrl = (route: string, params?: RouteParams): string => {
  const queryString = params ? buildQueryString(params) : '';
  return `${window.location.origin}${route}${queryString ? `?${queryString}` : ''}`;
};

// Generate specific route URLs
export const urls = {
  home: (params?: RouteParams) => generateUrl(ROUTES.HOME, params),
  collection: (params?: RouteParams) => generateUrl(ROUTES.COLLECTION, params),
  stats: (params?: RouteParams) => generateUrl(ROUTES.STATS, params),
  comic: (comicId: string, params?: RouteParams) => generateUrl(`${ROUTES.COMIC}/${encodeURIComponent(comicId)}`, params),
  series: (seriesName: string, params?: RouteParams) => generateUrl(`${ROUTES.SERIES}/${encodeURIComponent(seriesName)}`, params),
  storageLocation: (location: string, params?: RouteParams) => generateUrl(`${ROUTES.STORAGE_LOCATION}/${encodeURIComponent(location)}`, params),
  coverArtist: (artist: string, params?: RouteParams) => generateUrl(`${ROUTES.COVER_ARTIST}/${encodeURIComponent(artist)}`, params),
  tag: (tag: string, params?: RouteParams) => generateUrl(`${ROUTES.TAG}/${encodeURIComponent(tag)}`, params),
  rawComics: (params?: RouteParams) => generateUrl(ROUTES.RAW_COMICS, params),
  slabbedComics: (params?: RouteParams) => generateUrl(ROUTES.SLABBED_COMICS, params),
  variants: (params?: RouteParams) => generateUrl(ROUTES.VARIANTS, params),
  virtualBoxes: (params?: RouteParams) => generateUrl(ROUTES.VIRTUAL_BOXES, params),
};

// Parse current URL to extract route and parameters
export const parseCurrentUrl = (): { route: string; params: RouteParams } => {
  const hash = window.location.hash.startsWith('#/') ? window.location.hash.slice(1) : ''; // Legacy hash route, without the #.
  const routeSource = hash || `${window.location.pathname}${window.location.search}`;
  const queryStart = routeSource.indexOf('?');
  const route = queryStart < 0 ? routeSource : routeSource.slice(0, queryStart);
  const queryString = queryStart < 0 ? '' : routeSource.slice(queryStart + 1);
  const params: RouteParams = {};
  
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    
    if (searchParams.has('filter')) params.computedTag = searchParams.get('filter');

    // Parse query parameters
    if (searchParams.has('tab')) {
      const tab = searchParams.get('tab');
      if (tab === 'collection' || tab === 'stats') params.tab = tab;
    }
    if (searchParams.has('view')) {
      const view = searchParams.get('view');
      if (isViewMode(view)) params.viewMode = view;
    }
    if (searchParams.has('search')) {
      params.searchTerm = searchParams.get('search') || undefined;
    }
    if (searchParams.has('sort')) {
      const sort = searchParams.get('sort');
      if (isSortField(sort)) params.sortField = sort;
    }
    if (searchParams.has('order')) {
      const order = searchParams.get('order');
      if (order === 'asc' || order === 'desc') params.sortDirection = order;
    }
    if (searchParams.has('page')) {
      const page = Number(searchParams.get('page'));
      if (Number.isInteger(page) && page > 1) params.page = page - 1;
    }
  }
  
  return { route: route || '/', params };
};

// Parse route to extract parameters
export const parseRoute = (route: string): { type: string; params: RouteParams } => {
  try { decodeURIComponent(route); } catch { return { type: 'not-found', params: {} }; }
  const parts = route.split('/').filter(Boolean);
  const params: RouteParams = {};
  
  if (parts.length === 0) {
    return { type: 'home', params };
  }
  
  const [type, ...routeParams] = parts;
  
  switch (type) {
    case 'comic':
      if (routeParams.length > 0) {
        // Store the full slug (could be series-name-issue-123-variant)
        params.comicId = decodeURIComponent(routeParams.join('/'));
      }
      break;
    case 'series':
      if (routeParams.length > 0) {
        params.seriesName = decodeURIComponent(routeParams.join('/'));
      }
      break;
    case 'storage':
      if (routeParams.length > 0) {
        params.storageLocation = decodeURIComponent(routeParams.join('/'));
      }
      break;
    case 'artist':
      if (routeParams.length > 0) {
        params.coverArtist = decodeURIComponent(routeParams.join('/'));
      }
      break;
    case 'tag':
      if (routeParams.length > 0) {
        params.tag = decodeURIComponent(routeParams.join('/'));
      }
      break;
    case 'raw':
      params.condition = 'raw';
      break;
    case 'slabbed':
      params.condition = 'slabbed';
      break;
    case 'variants':
      params.condition = 'variants';
      break;
    case 'boxes':
      // Virtual boxes listing
      break;
    case 'csv':
      // CSV converter
      break;
    case 'collection':
    case 'stats':
      params.tab = type;
      break;
  }
  
  return { type, params };
};

// Navigate to a URL and update browser history
export const navigateToUrl = (url: string, replace = false): void => {
  if (replace) {
    window.history.replaceState(null, '', url);
  } else {
    window.history.pushState(null, '', url);
  }
  
  // Dispatch a custom event to notify components of URL change
  window.dispatchEvent(new CustomEvent('urlchange', { detail: { url } }));
};

// Helper function to create SEO-friendly slug
export const createComicSlug = (comic: ComicSlugInput): string => {
  // Create slug from series name and issue number
  const seriesSlug = comic.seriesName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  const issueSlug = `issue-${comic.issueNumber}`;

  // Add variant suffix if it's a variant cover
  const variantSlug = comic.isVariant ? '-variant' : '';

  // Extract the numeric ID from comic.id (e.g., "comic-728" -> "728")
  const idMatch = comic.id.match(/\d+$/);
  const idSuffix = idMatch ? `-${idMatch[0]}` : '';

  return `${seriesSlug}-${issueSlug}${variantSlug}${idSuffix}`;
};

// Helper function to parse comic slug back to search parameters
export const parseComicSlug = (slug: string): { seriesSlug: string; issueNumber: string; isVariant: boolean; comicId?: string } => {
  const parts = slug.split('-');
  const isVariant = /-variant(?:-|$)/.test(slug);

  // Find the "issue" part
  const issueIndex = parts.findIndex(part => part === 'issue');

  if (issueIndex === -1) {
    throw new Error('Invalid comic slug format');
  }

  // Everything before "issue" is the series slug
  const seriesSlug = parts.slice(0, issueIndex).join('-');

  // The part after "issue" is the issue number (could be followed by variant and/or ID)
  const issueNumber = parts[issueIndex + 1];

  // Extract the numeric ID from the end if it exists
  // The ID will be the last part if it's all digits
  const lastPart = parts[parts.length - 1];
  const comicId = parts.length > issueIndex + 2 && /^\d+$/.test(lastPart) ? `comic-${lastPart}` : undefined;

  return {
    seriesSlug,
    issueNumber,
    isVariant,
    comicId
  };
};

// Generate URL for a comic
export const getComicUrl = (comic: Comic, params?: RouteParams): string => {
  const slug = createComicSlug(comic);
  return urls.comic(slug, params);
};

// Generate URL for a series
export const getSeriesUrl = (seriesName: string, params?: RouteParams): string => {
  return urls.series(seriesName, params);
};

// Generate URL for a storage location (virtual box)
export const getStorageLocationUrl = (location: string, params?: RouteParams): string => {
  return urls.storageLocation(location, params);
};

// Generate URL for a cover artist
export const getCoverArtistUrl = (artist: string, params?: RouteParams): string => {
  return urls.coverArtist(artist, params);
};

// Generate URL for a tag
export const getTagUrl = (tag: string, params?: RouteParams): string => {
  return urls.tag(tag, params);
};

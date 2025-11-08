import { Comic } from '../types/Comic';

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
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

// Generate URLs for different routes
export const generateUrl = (route: string, params?: RouteParams): string => {
  const baseUrl = window.location.origin + window.location.pathname;
  
  if (!params) return baseUrl + route;
  
  const searchParams = new URLSearchParams();
  
  // Add tab parameter
  if (params.tab) {
    searchParams.set('tab', params.tab);
  }
  
  // Add view mode
  if (params.viewMode) {
    searchParams.set('view', params.viewMode);
  }
  
  // Add search term
  if (params.searchTerm) {
    searchParams.set('search', params.searchTerm);
  }
  
  // Add sort parameters
  if (params.sortField) {
    searchParams.set('sort', params.sortField);
  }
  if (params.sortDirection) {
    searchParams.set('order', params.sortDirection);
  }
  
  const queryString = searchParams.toString();
  const fullRoute = route + (queryString ? `?${queryString}` : '');
  
  return baseUrl + fullRoute;
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
  const hash = window.location.hash.slice(1); // Remove the # from hash
  const [route, queryString] = hash.split('?');
  const params: RouteParams = {};
  
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    
    // Parse query parameters
    if (searchParams.has('tab')) {
      params.tab = searchParams.get('tab') as 'collection' | 'stats';
    }
    if (searchParams.has('view')) {
      params.viewMode = searchParams.get('view') as 'grid' | 'list';
    }
    if (searchParams.has('search')) {
      params.searchTerm = searchParams.get('search') || undefined;
    }
    if (searchParams.has('sort')) {
      params.sortField = searchParams.get('sort') || undefined;
    }
    if (searchParams.has('order')) {
      params.sortDirection = searchParams.get('order') as 'asc' | 'desc';
    }
  }
  
  return { route: route || '/', params };
};

// Parse route to extract parameters
export const parseRoute = (route: string): { type: string; params: RouteParams } => {
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
        params.seriesName = decodeURIComponent(routeParams[0]);
      }
      break;
    case 'storage':
      if (routeParams.length > 0) {
        params.storageLocation = decodeURIComponent(routeParams[0]);
      }
      break;
    case 'artist':
      if (routeParams.length > 0) {
        params.coverArtist = decodeURIComponent(routeParams[0]);
      }
      break;
    case 'tag':
      if (routeParams.length > 0) {
        params.tag = decodeURIComponent(routeParams[0]);
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
export const createComicSlug = (comic: Comic): string => {
  // Create slug from series name and issue number
  const seriesSlug = comic.seriesName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  const issueSlug = `issue-${comic.issueNumber}`;

  // Add variant suffix if it's a variant cover
  const variantSlug = comic.isVariant ? '-variant' : '';

  return `${seriesSlug}-${issueSlug}${variantSlug}`;
};

// Helper function to parse comic slug back to search parameters
export const parseComicSlug = (slug: string): { seriesSlug: string; issueNumber: string; isVariant: boolean } => {
  const parts = slug.split('-');
  const isVariant = slug.endsWith('-variant');

  // Find the "issue" part
  const issueIndex = parts.findIndex(part => part === 'issue');

  if (issueIndex === -1) {
    throw new Error('Invalid comic slug format');
  }

  // Everything before "issue" is the series slug
  const seriesSlug = parts.slice(0, issueIndex).join('-');

  // The part after "issue" is the issue number
  const issueNumber = parts[issueIndex + 1];

  return {
    seriesSlug,
    issueNumber,
    isVariant
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

// Generate shareable URLs for different views
export const getShareableUrl = (type: string, identifier?: string, params?: RouteParams): string => {
  switch (type) {
    case 'comic':
      return identifier ? getComicUrl({ id: identifier } as Comic, params) : urls.home(params);
    case 'series':
      return identifier ? getSeriesUrl(identifier, params) : urls.home(params);
    case 'storage':
      return identifier ? getStorageLocationUrl(identifier, params) : urls.virtualBoxes(params);
    case 'artist':
      return identifier ? getCoverArtistUrl(identifier, params) : urls.home(params);
    case 'tag':
      return identifier ? getTagUrl(identifier, params) : urls.home(params);
    case 'raw':
      return urls.rawComics(params);
    case 'slabbed':
      return urls.slabbedComics(params);
    case 'variants':
      return urls.variants(params);
    case 'boxes':
      return urls.virtualBoxes(params);
    case 'stats':
      return urls.stats(params);
    default:
      return urls.home(params);
  }
};

// Copy URL to clipboard
export const copyUrlToClipboard = async (url: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy URL to clipboard:', error);
    return false;
  }
};

// Get current URL for sharing
export const getCurrentUrl = (): string => {
  return window.location.href;
};

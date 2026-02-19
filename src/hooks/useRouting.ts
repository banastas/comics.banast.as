import { useEffect, useCallback } from 'react';
import { parseCurrentUrl, parseRoute, navigateToUrl, RouteParams, parseComicSlug, createComicSlug } from '../utils/routing';
import { Comic, FilterOptions } from '../types/Comic';
import { trackPageView } from '../utils/analytics';

interface UseRoutingProps {
  // Current state
  activeTab: 'collection' | 'stats';
  selectedComic: Comic | undefined;
  selectedSeries: string | null;
  selectedStorageLocation: string | null;
  selectedCoverArtist: string | null;
  selectedTag: string | null;
  selectedCondition: 'raw' | 'slabbed' | 'variants' | null;
  showVirtualBoxes: boolean;
  viewMode: 'grid' | 'list';
  searchTerm: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  
  // State setters
  setActiveTab: (tab: 'collection' | 'stats') => void;
  setSelectedComic: (comic: Comic | undefined) => void;
  setSelectedSeries: (series: string | null) => void;
  setSelectedStorageLocation: (location: string | null) => void;
  setSelectedCoverArtist: (artist: string | null) => void;
  setSelectedTag: (tag: string | null) => void;
  setSelectedCondition: (condition: 'raw' | 'slabbed' | 'variants' | null) => void;
  setShowVirtualBoxes: (show: boolean) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  setSortField: (field: string) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  
  // Data
  allComics: Comic[];
}

export const useRouting = ({
  activeTab,
  selectedComic,
  selectedSeries,
  selectedStorageLocation,
  selectedCoverArtist,
  selectedTag,
  selectedCondition,
  showVirtualBoxes,
  viewMode,
  searchTerm,
  sortField,
  sortDirection,
  setActiveTab,
  setSelectedComic,
  setSelectedSeries,
  setSelectedStorageLocation,
  setSelectedCoverArtist,
  setSelectedTag,
  setSelectedCondition,
  setShowVirtualBoxes,
  setViewMode,
  setFilters,
  setSortField,
  setSortDirection,
  allComics,
}: UseRoutingProps) => {
  
  // Navigate to a specific route
  const navigateToRoute = useCallback((
    type: string,
    identifier?: string,
    params?: RouteParams,
    replace = false
  ) => {
    // Clear all selections first
    setSelectedComic(undefined);
    setSelectedSeries(null);
    setSelectedStorageLocation(null);
    setSelectedCoverArtist(null);
    setSelectedTag(null);
    setSelectedCondition(null);
    setShowVirtualBoxes(false);
    
    // Build the route
    let route = '';
    switch (type) {
      case 'home':
        route = '/';
        break;
      case 'collection':
        route = '/collection';
        break;
      case 'stats':
        route = '/stats';
        break;
      case 'comic':
        route = `/comic/${encodeURIComponent(identifier || '')}`;
        break;
      case 'series':
        route = `/series/${encodeURIComponent(identifier || '')}`;
        break;
      case 'storage':
        route = `/storage/${encodeURIComponent(identifier || '')}`;
        break;
      case 'artist':
        route = `/artist/${encodeURIComponent(identifier || '')}`;
        break;
      case 'tag':
        route = `/tag/${encodeURIComponent(identifier || '')}`;
        break;
      case 'raw':
        route = '/raw';
        break;
      case 'slabbed':
        route = '/slabbed';
        break;
      case 'variants':
        route = '/variants';
        break;
      case 'boxes':
        route = '/boxes';
        break;
      default:
        route = '/';
    }
    
    // Add query parameters
    const searchParams = new URLSearchParams();
    if (params?.tab) searchParams.set('tab', params.tab);
    if (params?.viewMode) searchParams.set('view', params.viewMode);
    if (params?.searchTerm) searchParams.set('search', params.searchTerm);
    if (params?.sortField) searchParams.set('sort', params.sortField);
    if (params?.sortDirection) searchParams.set('order', params.sortDirection);
    
    const queryString = searchParams.toString();
    const fullRoute = route + (queryString ? `?${queryString}` : '');
    
    // Update URL
    navigateToUrl(`#${fullRoute}`, replace);
  }, [
    setSelectedComic,
    setSelectedSeries,
    setSelectedStorageLocation,
    setSelectedCoverArtist,
    setSelectedTag,
    setSelectedCondition,
    setShowVirtualBoxes,
  ]);
  
  // Handle URL changes
  const handleUrlChange = useCallback(() => {
    const { route, params } = parseCurrentUrl();
    const { type, params: routeParams } = parseRoute(route);
    
    trackPageView(window.location.hash || '#/collection');
    
    // Update tab
    if (params.tab && params.tab !== activeTab) {
      setActiveTab(params.tab);
    }
    
    // Update view mode
    if (params.viewMode && params.viewMode !== viewMode) {
      setViewMode(params.viewMode);
    }
    
    // Update search term
    if (params.searchTerm !== undefined && params.searchTerm !== searchTerm) {
      setFilters({ searchTerm: params.searchTerm });
    }
    
    // Update sort parameters
    if (params.sortField && params.sortField !== sortField) {
      setSortField(params.sortField);
    }
    if (params.sortDirection && params.sortDirection !== sortDirection) {
      setSortDirection(params.sortDirection);
    }
    
    // Handle route-specific navigation
    switch (type) {
      case 'home':
      case 'collection':
        // Clear all selections
        setSelectedComic(undefined);
        setSelectedSeries(null);
        setSelectedStorageLocation(null);
        setSelectedCoverArtist(null);
        setSelectedTag(null);
        setSelectedCondition(null);
        setShowVirtualBoxes(false);
        break;
        
      case 'stats':
        setActiveTab('stats');
        setSelectedComic(undefined);
        setSelectedSeries(null);
        setSelectedStorageLocation(null);
        setSelectedCoverArtist(null);
        setSelectedTag(null);
        setSelectedCondition(null);
        setShowVirtualBoxes(false);
        break;
        
      case 'comic':
        if (routeParams.comicId) {
          // Try to parse as slug first (new format: series-name-issue-123-variant-575)
          let comic: Comic | undefined;

          try {
            const { seriesSlug, issueNumber, isVariant, comicId } = parseComicSlug(routeParams.comicId);

            // If we have a specific comic ID in the slug, use it directly
            if (comicId) {
              comic = allComics.find(c => c.id === comicId);
            } else {
              // Find comic by exact slug match
              comic = allComics.find(c => {
                const comicSlug = createComicSlug(c);
                return comicSlug === routeParams.comicId;
              });

              // Fallback: try to match by series and issue number more loosely
              if (!comic) {
                comic = allComics.find(c => {
                  const matchesIssue = c.issueNumber.toString() === issueNumber;
                  const matchesVariant = c.isVariant === isVariant;
                  const seriesMatches = c.seriesName.toLowerCase().replace(/[^a-z0-9]+/g, '-') === seriesSlug;
                  return matchesIssue && matchesVariant && seriesMatches;
                });
              }
            }
          } catch (e) {
            // If slug parsing fails, try old ID format for backward compatibility
            comic = allComics.find(c => c.id === routeParams.comicId);
          }

          if (comic) {
            setSelectedComic(comic);
            setSelectedSeries(null);
            setSelectedStorageLocation(null);
            setSelectedCoverArtist(null);
            setSelectedTag(null);
            setSelectedCondition(null);
            setShowVirtualBoxes(false);
          }
        }
        break;
        
      case 'series':
        if (routeParams.seriesName) {
          setSelectedSeries(routeParams.seriesName);
          setSelectedComic(undefined);
          setSelectedStorageLocation(null);
          setSelectedCoverArtist(null);
          setSelectedTag(null);
          setSelectedCondition(null);
          setShowVirtualBoxes(false);
        }
        break;
        
      case 'storage':
        if (routeParams.storageLocation) {
          setSelectedStorageLocation(routeParams.storageLocation);
          setSelectedComic(undefined);
          setSelectedSeries(null);
          setSelectedCoverArtist(null);
          setSelectedTag(null);
          setSelectedCondition(null);
          setShowVirtualBoxes(false);
        }
        break;
        
      case 'artist':
        if (routeParams.coverArtist) {
          setSelectedCoverArtist(routeParams.coverArtist);
          setSelectedComic(undefined);
          setSelectedSeries(null);
          setSelectedStorageLocation(null);
          setSelectedTag(null);
          setSelectedCondition(null);
          setShowVirtualBoxes(false);
        }
        break;
        
      case 'tag':
        if (routeParams.tag) {
          setSelectedTag(routeParams.tag);
          setSelectedComic(undefined);
          setSelectedSeries(null);
          setSelectedStorageLocation(null);
          setSelectedCoverArtist(null);
          setSelectedCondition(null);
          setShowVirtualBoxes(false);
        }
        break;
        
      case 'raw':
        setSelectedCondition('raw');
        setSelectedComic(undefined);
        setSelectedSeries(null);
        setSelectedStorageLocation(null);
        setSelectedCoverArtist(null);
        setSelectedTag(null);
        setShowVirtualBoxes(false);
        break;
        
      case 'slabbed':
        setSelectedCondition('slabbed');
        setSelectedComic(undefined);
        setSelectedSeries(null);
        setSelectedStorageLocation(null);
        setSelectedCoverArtist(null);
        setSelectedTag(null);
        setShowVirtualBoxes(false);
        break;
        
      case 'variants':
        setSelectedCondition('variants');
        setSelectedComic(undefined);
        setSelectedSeries(null);
        setSelectedStorageLocation(null);
        setSelectedCoverArtist(null);
        setSelectedTag(null);
        setShowVirtualBoxes(false);
        break;
        
      case 'boxes':
        setShowVirtualBoxes(true);
        setSelectedComic(undefined);
        setSelectedSeries(null);
        setSelectedStorageLocation(null);
        setSelectedCoverArtist(null);
        setSelectedTag(null);
        setSelectedCondition(null);
        break;
        
    }
  }, [
    activeTab,
    viewMode,
    searchTerm,
    sortField,
    sortDirection,
    allComics,
    setActiveTab,
    setViewMode,
    setFilters,
    setSortField,
    setSortDirection,
    setSelectedComic,
    setSelectedSeries,
    setSelectedStorageLocation,
    setSelectedCoverArtist,
    setSelectedTag,
    setSelectedCondition,
    setShowVirtualBoxes,
  ]);
  
  // Set up URL change listeners
  useEffect(() => {
    // Handle initial URL
    handleUrlChange();
    
    // Listen for browser back/forward
    const handlePopState = () => {
      handleUrlChange();
    };
    
    // Listen for custom URL change events
    const handleCustomUrlChange = () => {
      handleUrlChange();
    };
    
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('urlchange', handleCustomUrlChange);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('urlchange', handleCustomUrlChange);
    };
  }, [handleUrlChange]);
  
  return {
    navigateToRoute,
  };
};

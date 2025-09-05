import { useEffect, useCallback } from 'react';
import { parseCurrentUrl, parseRoute, navigateToUrl, RouteParams } from '../utils/routing';
import { Comic } from '../types/Comic';

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
  showCsvConverter: boolean;
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
  setShowCsvConverter: (show: boolean) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setFilters: (filters: any) => void;
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
  showCsvConverter,
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
  setShowCsvConverter,
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
    setShowCsvConverter(false);
    
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
      case 'csv':
        route = '/csv';
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
    setShowCsvConverter,
  ]);
  
  // Handle URL changes
  const handleUrlChange = useCallback(() => {
    const { route, params } = parseCurrentUrl();
    const { type, params: routeParams } = parseRoute(route);
    
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
        setShowCsvConverter(false);
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
        setShowCsvConverter(false);
        break;
        
      case 'comic':
        if (routeParams.comicId) {
          const comic = allComics.find(c => c.id === routeParams.comicId);
          if (comic) {
            setSelectedComic(comic);
            setSelectedSeries(null);
            setSelectedStorageLocation(null);
            setSelectedCoverArtist(null);
            setSelectedTag(null);
            setSelectedCondition(null);
            setShowVirtualBoxes(false);
            setShowCsvConverter(false);
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
          setShowCsvConverter(false);
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
          setShowCsvConverter(false);
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
          setShowCsvConverter(false);
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
          setShowCsvConverter(false);
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
        setShowCsvConverter(false);
        break;
        
      case 'slabbed':
        setSelectedCondition('slabbed');
        setSelectedComic(undefined);
        setSelectedSeries(null);
        setSelectedStorageLocation(null);
        setSelectedCoverArtist(null);
        setSelectedTag(null);
        setShowVirtualBoxes(false);
        setShowCsvConverter(false);
        break;
        
      case 'variants':
        setSelectedCondition('variants');
        setSelectedComic(undefined);
        setSelectedSeries(null);
        setSelectedStorageLocation(null);
        setSelectedCoverArtist(null);
        setSelectedTag(null);
        setShowVirtualBoxes(false);
        setShowCsvConverter(false);
        break;
        
      case 'boxes':
        setShowVirtualBoxes(true);
        setSelectedComic(undefined);
        setSelectedSeries(null);
        setSelectedStorageLocation(null);
        setSelectedCoverArtist(null);
        setSelectedTag(null);
        setSelectedCondition(null);
        setShowCsvConverter(false);
        break;
        
      case 'csv':
        setShowCsvConverter(true);
        setSelectedComic(undefined);
        setSelectedSeries(null);
        setSelectedStorageLocation(null);
        setSelectedCoverArtist(null);
        setSelectedTag(null);
        setSelectedCondition(null);
        setShowVirtualBoxes(false);
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
    setShowCsvConverter,
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

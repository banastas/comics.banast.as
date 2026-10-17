import React from 'react';
import type { Comic } from '../types/Comic';
import type { BreadcrumbItem } from './Breadcrumb';
import type { RouteSelection } from '../hooks/useRouting';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingSpinner } from './AppLoading';
import {
  ComicDetail,
  CoverArtistDetail,
  RawComicsDetail,
  SeriesDetail,
  SlabbedComicsDetail,
  StorageLocationDetail,
  StorageLocationsListing,
  TagDetail,
  VariantsDetail,
} from './lazyRoutes';

interface AppRouteRendererProps {
  allComics: Comic[];
  computedTagsMap: Map<string, string[]>;
  selection: RouteSelection;
  breadcrumbItems: BreadcrumbItem[];
  onBack: () => void;
  onViewComic: (comic: Comic) => void;
  onViewSeries: (seriesName: string) => void;
  onViewStorageLocation: (storageLocation: string) => void;
  onViewCoverArtist: (coverArtist: string) => void;
  onViewTag: (tag: string) => void;
}

const selectionKey = (selection: RouteSelection): string =>
  selection.comic?.id
  ?? selection.series
  ?? selection.storageLocation
  ?? selection.coverArtist
  ?? selection.tag
  ?? selection.condition
  ?? (selection.showVirtualBoxes ? 'boxes' : 'none');

export const AppRouteRenderer = ({
  allComics,
  computedTagsMap,
  selection,
  breadcrumbItems,
  onBack,
  onViewComic,
  onViewSeries,
  onViewStorageLocation,
  onViewCoverArtist,
  onViewTag,
}: AppRouteRendererProps) => {
  // A failed route resets when the reader navigates elsewhere instead of sticking until reload.
  const withRouteBoundary = (children: React.ReactNode) => (
    <ErrorBoundary resetKey={selectionKey(selection)}>
      <React.Suspense fallback={<LoadingSpinner />}>{children}</React.Suspense>
    </ErrorBoundary>
  );
  const shared = { onBack, onView: onViewComic, onViewSeries, breadcrumbItems };

  if (selection.showVirtualBoxes) {
    return withRouteBoundary(
      <StorageLocationsListing
        allComics={allComics}
        onBack={onBack}
        onViewStorageLocation={onViewStorageLocation}
        breadcrumbItems={breadcrumbItems}
      />
    );
  }

  if (selection.comic) {
    return withRouteBoundary(
      <ComicDetail
        key={selection.comic.id}
        comic={selection.comic}
        allComics={allComics}
        onBack={onBack}
        onView={onViewComic}
        onViewSeries={onViewSeries}
        onViewStorageLocation={onViewStorageLocation}
        onViewCoverArtist={onViewCoverArtist}
        onViewTag={onViewTag}
        breadcrumbItems={breadcrumbItems}
      />
    );
  }

  if (selection.series) {
    return withRouteBoundary(
      <SeriesDetail
        key={selection.series}
        seriesName={selection.series}
        seriesComics={allComics.filter((comic) => comic.seriesName === selection.series)}
        {...shared}
      />
    );
  }

  if (selection.storageLocation) {
    return withRouteBoundary(
      <StorageLocationDetail
        key={selection.storageLocation}
        storageLocation={selection.storageLocation}
        locationComics={allComics.filter((comic) => comic.storageLocation === selection.storageLocation)}
        {...shared}
      />
    );
  }

  if (selection.coverArtist) {
    return withRouteBoundary(
      <CoverArtistDetail
        key={selection.coverArtist}
        coverArtist={selection.coverArtist}
        artistComics={allComics.filter((comic) => comic.coverArtist === selection.coverArtist)}
        {...shared}
      />
    );
  }

  if (selection.tag) {
    const tag = selection.tag;
    return withRouteBoundary(
      <TagDetail
        key={tag}
        tag={tag}
        tagComics={allComics.filter((comic) => comic.tags.includes(tag) || (computedTagsMap.get(comic.id) || []).includes(tag))}
        onViewTag={onViewTag}
        {...shared}
      />
    );
  }

  if (selection.condition === 'raw') {
    return withRouteBoundary(<RawComicsDetail rawComics={allComics.filter((comic) => !comic.isSlabbed)} {...shared} />);
  }

  if (selection.condition === 'slabbed') {
    return withRouteBoundary(<SlabbedComicsDetail slabbedComics={allComics.filter((comic) => comic.isSlabbed)} {...shared} />);
  }

  if (selection.condition === 'variants') {
    return withRouteBoundary(<VariantsDetail variantComics={allComics.filter((comic) => comic.isVariant)} {...shared} />);
  }

  return null;
};

import React from 'react';
import type { Comic } from '../types/Comic';
import type { BreadcrumbItem } from './Breadcrumb';
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
  selectedComic?: Comic;
  selectedSeries: string | null;
  selectedStorageLocation: string | null;
  selectedCoverArtist: string | null;
  selectedTag: string | null;
  selectedCondition: 'raw' | 'slabbed' | 'variants' | null;
  showVirtualBoxes: boolean;
  breadcrumbItems: BreadcrumbItem[];
  onBack: () => void;
  onViewComic: (comic: Comic) => void;
  onViewSeries: (seriesName: string) => void;
  onViewStorageLocation: (storageLocation: string) => void;
  onViewCoverArtist: (coverArtist: string) => void;
  onViewTag: (tag: string) => void;
  onViewRawComics: () => void;
  onViewSlabbedComics: () => void;
}

const withRouteBoundary = (children: React.ReactNode) => (
  <ErrorBoundary>
    <React.Suspense fallback={<LoadingSpinner />}>{children}</React.Suspense>
  </ErrorBoundary>
);

export const AppRouteRenderer = ({
  allComics,
  computedTagsMap,
  selectedComic,
  selectedSeries,
  selectedStorageLocation,
  selectedCoverArtist,
  selectedTag,
  selectedCondition,
  showVirtualBoxes,
  breadcrumbItems,
  onBack,
  onViewComic,
  onViewSeries,
  onViewStorageLocation,
  onViewCoverArtist,
  onViewTag,
  onViewRawComics,
  onViewSlabbedComics,
}: AppRouteRendererProps) => {
  if (showVirtualBoxes) {
    return withRouteBoundary(
      <StorageLocationsListing
        allComics={allComics}
        onBack={onBack}
        onViewStorageLocation={onViewStorageLocation}
        breadcrumbItems={breadcrumbItems}
      />
    );
  }

  if (selectedComic) {
    return withRouteBoundary(
      <ComicDetail
        comic={selectedComic}
        allComics={allComics}
        onBack={onBack}
        onView={onViewComic}
        onViewSeries={onViewSeries}
        onViewStorageLocation={onViewStorageLocation}
        onViewCoverArtist={onViewCoverArtist}
        onViewTag={onViewTag}
        onViewRawComics={onViewRawComics}
        onViewSlabbedComics={onViewSlabbedComics}
        breadcrumbItems={breadcrumbItems}
      />
    );
  }

  if (selectedSeries) {
    const seriesComics = allComics.filter((comic) => comic.seriesName === selectedSeries);

    return withRouteBoundary(
      <SeriesDetail
        seriesName={selectedSeries}
        seriesComics={seriesComics}
        onBack={onBack}
        onView={onViewComic}
        breadcrumbItems={breadcrumbItems}
      />
    );
  }

  if (selectedStorageLocation) {
    const locationComics = allComics.filter((comic) => comic.storageLocation === selectedStorageLocation);

    return withRouteBoundary(
      <StorageLocationDetail
        storageLocation={selectedStorageLocation}
        locationComics={locationComics}
        onBack={onBack}
        onView={onViewComic}
        onViewSeries={onViewSeries}
        breadcrumbItems={breadcrumbItems}
      />
    );
  }

  if (selectedCoverArtist) {
    const artistComics = allComics.filter((comic) => comic.coverArtist === selectedCoverArtist);

    return withRouteBoundary(
      <CoverArtistDetail
        coverArtist={selectedCoverArtist}
        artistComics={artistComics}
        onBack={onBack}
        onView={onViewComic}
        onViewSeries={onViewSeries}
        breadcrumbItems={breadcrumbItems}
      />
    );
  }

  if (selectedTag) {
    const tagComics = allComics.filter(
      (comic) =>
        comic.tags.includes(selectedTag) ||
        (computedTagsMap.get(comic.id) || []).includes(selectedTag)
    );

    return withRouteBoundary(
      <TagDetail
        tag={selectedTag}
        tagComics={tagComics}
        onBack={onBack}
        onView={onViewComic}
        onViewSeries={onViewSeries}
        onViewTag={onViewTag}
        breadcrumbItems={breadcrumbItems}
      />
    );
  }

  if (selectedCondition === 'raw') {
    const rawComics = allComics.filter((comic) => !comic.isSlabbed);

    return withRouteBoundary(
      <RawComicsDetail
        rawComics={rawComics}
        onBack={onBack}
        onView={onViewComic}
        onViewSeries={onViewSeries}
        breadcrumbItems={breadcrumbItems}
      />
    );
  }

  if (selectedCondition === 'slabbed') {
    const slabbedComics = allComics.filter((comic) => comic.isSlabbed);

    return withRouteBoundary(
      <SlabbedComicsDetail
        slabbedComics={slabbedComics}
        onBack={onBack}
        onView={onViewComic}
        onViewSeries={onViewSeries}
        breadcrumbItems={breadcrumbItems}
      />
    );
  }

  if (selectedCondition === 'variants') {
    const variantComics = allComics.filter((comic) => comic.isVariant);

    return withRouteBoundary(
      <VariantsDetail
        variantComics={variantComics}
        onBack={onBack}
        onView={onViewComic}
        onViewRawComics={onViewRawComics}
        onViewSlabbedComics={onViewSlabbedComics}
        onViewSeries={onViewSeries}
        breadcrumbItems={breadcrumbItems}
      />
    );
  }

  return null;
};

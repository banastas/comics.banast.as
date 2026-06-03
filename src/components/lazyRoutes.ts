import React from 'react';

export const ComicForm = React.lazy(() => import('./ComicForm').then((module) => ({ default: module.ComicForm })));
export const ComicDetail = React.lazy(() => import('./ComicDetail').then((module) => ({ default: module.ComicDetail })));
export const SeriesDetail = React.lazy(() => import('./SeriesDetail').then((module) => ({ default: module.SeriesDetail })));
export const StorageLocationDetail = React.lazy(() => import('./StorageLocationDetail').then((module) => ({ default: module.StorageLocationDetail })));
export const CoverArtistDetail = React.lazy(() => import('./CoverArtistDetail').then((module) => ({ default: module.CoverArtistDetail })));
export const TagDetail = React.lazy(() => import('./TagDetail').then((module) => ({ default: module.TagDetail })));
export const RawComicsDetail = React.lazy(() => import('./RawComicsDetail').then((module) => ({ default: module.RawComicsDetail })));
export const SlabbedComicsDetail = React.lazy(() => import('./SlabbedComicsDetail').then((module) => ({ default: module.SlabbedComicsDetail })));
export const StorageLocationsListing = React.lazy(() => import('./StorageLocationsListing').then((module) => ({ default: module.StorageLocationsListing })));
export const VariantsDetail = React.lazy(() => import('./VariantsDetail').then((module) => ({ default: module.VariantsDetail })));

import React from 'react';

const RELOAD_FLAG = 'comics:chunk-reload';

// After a deploy, an open tab can request hashed chunks that no longer exist. Retry once, then
// reload the page a single time to pick up the new build instead of showing a permanent error.
const lazyWithRetry = <T extends React.ComponentType<any>>(factory: () => Promise<{ default: T }>) =>
  React.lazy<T>(async () => {
    try {
      const module = await factory();
      try { window.sessionStorage.removeItem(RELOAD_FLAG); } catch { /* storage blocked */ }
      return module;
    } catch (firstError) {
      try {
        return await factory();
      } catch {
        let alreadyReloaded = false;
        try { alreadyReloaded = window.sessionStorage.getItem(RELOAD_FLAG) === '1'; } catch { /* storage blocked */ }
        if (!alreadyReloaded) {
          try { window.sessionStorage.setItem(RELOAD_FLAG, '1'); } catch { /* storage blocked */ }
          window.location.reload();
          return new Promise<{ default: T }>(() => {});
        }
        throw firstError;
      }
    }
  });

export const ComicForm = lazyWithRetry(() => import('./ComicForm').then((module) => ({ default: module.ComicForm })));
export const ComicDetail = lazyWithRetry(() => import('./ComicDetail').then((module) => ({ default: module.ComicDetail })));
export const SeriesDetail = lazyWithRetry(() => import('./SeriesDetail').then((module) => ({ default: module.SeriesDetail })));
export const StorageLocationDetail = lazyWithRetry(() => import('./StorageLocationDetail').then((module) => ({ default: module.StorageLocationDetail })));
export const CoverArtistDetail = lazyWithRetry(() => import('./CoverArtistDetail').then((module) => ({ default: module.CoverArtistDetail })));
export const TagDetail = lazyWithRetry(() => import('./TagDetail').then((module) => ({ default: module.TagDetail })));
export const RawComicsDetail = lazyWithRetry(() => import('./RawComicsDetail').then((module) => ({ default: module.RawComicsDetail })));
export const SlabbedComicsDetail = lazyWithRetry(() => import('./SlabbedComicsDetail').then((module) => ({ default: module.SlabbedComicsDetail })));
export const StorageLocationsListing = lazyWithRetry(() => import('./StorageLocationsListing').then((module) => ({ default: module.StorageLocationsListing })));
export const VariantsDetail = lazyWithRetry(() => import('./VariantsDetail').then((module) => ({ default: module.VariantsDetail })));

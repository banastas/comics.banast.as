import type { Comic } from '../types/Comic';
import { createComicSlug } from './routing';

export const SITE_ORIGIN = 'https://comics.banast.as';

export const comicPath = (comic: Pick<Comic, 'id' | 'seriesName' | 'issueNumber' | 'isVariant'>): string =>
  `/comic/${encodeURIComponent(createComicSlug(comic))}`;
export const seriesPath = (seriesName: string): string => `/series/${encodeURIComponent(seriesName)}`;
export const artistPath = (coverArtist: string): string => `/artist/${encodeURIComponent(coverArtist)}`;
export const storagePath = (storageLocation: string): string => `/storage/${encodeURIComponent(storageLocation)}`;
export const tagPath = (tag: string): string => `/tag/${encodeURIComponent(tag)}`;

export const absoluteUrl = (path: string): string => `${SITE_ORIGIN}${path === '/' ? '/' : path}`;

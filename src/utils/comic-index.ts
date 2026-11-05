import type { Comic } from '../types/Comic';
import { computeTagsForComic } from './computed-tags';

// The whole collection as a static JSON file (/data/comics.json, built from
// src/data/comics.json). Pages render their first screen of comics at build
// time; the browser fetches this file only when a reader searches, sorts or
// pages beyond what was rendered.

export const COMIC_INDEX_URL = '/data/comics.json';

export type ListSource =
  | { kind: 'series' | 'artist' | 'storage' | 'tag'; value: string }
  /** The publisher's series, from series.json (the data file has no publisher field). */
  | { kind: 'publisher'; value: string; series: string[] }
  | { kind: 'raw' | 'slabbed' | 'variants' };

export const matchesSource = (comic: Comic, source: ListSource): boolean => {
  switch (source.kind) {
    case 'series': return comic.seriesName === source.value;
    case 'artist': return comic.coverArtist === source.value;
    case 'storage': return comic.storageLocation === source.value;
    case 'tag': return comic.tags.includes(source.value) || computeTagsForComic(comic).includes(source.value);
    case 'publisher': return source.series.includes(comic.seriesName);
    case 'raw': return !comic.isSlabbed;
    case 'slabbed': return comic.isSlabbed;
    case 'variants': return comic.isVariant;
  }
};

let request: Promise<Comic[]> | null = null;

/** Loads the collection once per page; a failed request can be retried. */
export const loadComicIndex = (): Promise<Comic[]> => {
  request ??= fetch(COMIC_INDEX_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`Collection request failed with HTTP ${response.status}`);
      return response.json() as Promise<Comic[]>;
    })
    .catch((error: unknown) => {
      request = null;
      throw error;
    });
  return request;
};

/** Forgets the cached request (tests only). */
export const resetComicIndex = () => { request = null; };

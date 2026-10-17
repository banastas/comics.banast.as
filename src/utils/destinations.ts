import type { Comic } from '../types/Comic';
import { artistPath, comicPath, seriesPath, storagePath, tagPath } from './paths';

export type Destination =
  | { type: 'comic'; comic: Comic }
  | { type: 'series'; name: string }
  | { type: 'artist'; name: string }
  | { type: 'storage'; name: string }
  | { type: 'tag'; name: string }
  | { type: 'collection' | 'stats' | 'raw' | 'slabbed' | 'variants' | 'boxes' };

export const destinationHref = (destination: Destination): string => {
  switch (destination.type) {
    case 'comic': return comicPath(destination.comic);
    case 'series': return seriesPath(destination.name);
    case 'artist': return artistPath(destination.name);
    case 'storage': return storagePath(destination.name);
    case 'tag': return tagPath(destination.name);
    case 'collection': return '/';
    default: return `/${destination.type}`;
  }
};

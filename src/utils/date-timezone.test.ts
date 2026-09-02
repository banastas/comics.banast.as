import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Comic } from '../types/Comic';
import { computeTagsForComic } from './computed-tags';
import { formatDate, formatDateLong, getCalendarYear } from './formatting';

afterEach(() => vi.unstubAllEnvs());

const boundaryComic: Comic = {
  id: 'timezone-boundary',
  title: 'Timezone Boundary',
  seriesName: 'Timezone Boundary',
  issueNumber: 2,
  releaseDate: '1992-01-01T00:00:00.000Z',
  coverImageUrl: '',
  coverArtist: '',
  grade: 9.4,
  purchasePrice: 3,
  purchaseDate: '1992-01-01T00:00:00.000Z',
  currentValue: 3,
  notes: '',
  signedBy: '',
  storageLocation: 'Test',
  tags: [],
  isSlabbed: false,
  isVariant: false,
  isGraphicNovel: false,
  createdAt: '1992-01-01T00:00:00.000Z',
  updatedAt: '1992-01-01T00:00:00.000Z',
};

describe('calendar date handling', () => {
  it.each(['UTC', 'America/Los_Angeles', 'Pacific/Auckland'])(
    'keeps release years and computed tags stable in %s',
    (timezone) => {
      vi.stubEnv('TZ', timezone);

      expect(getCalendarYear(boundaryComic.releaseDate)).toBe(1992);
      expect(computeTagsForComic(boundaryComic)).toContain('90s');
      expect(computeTagsForComic(boundaryComic)).not.toContain('Copper Age');
      expect(formatDate(boundaryComic.releaseDate)).toBe('Jan 1, 1992');
      expect(formatDateLong(boundaryComic.releaseDate)).toBe('January 1, 1992');
    },
  );
});

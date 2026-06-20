import { describe, expect, it } from 'vitest';
import type { Comic } from '../types/Comic';
import { sortComics } from './sorting';

const baseComic: Comic = {
  id: 'comic-1',
  title: 'Issue A',
  seriesName: 'Series',
  issueNumber: 1,
  releaseDate: '2024-01-01',
  coverImageUrl: 'https://covers.banast.as/a.jpg',
  coverArtist: '',
  grade: 9.4,
  purchasePrice: 10,
  purchaseDate: '2024-01-02',
  currentValue: 25,
  notes: '',
  signedBy: '',
  storageLocation: 'CB-01',
  tags: [],
  isSlabbed: false,
  isVariant: false,
  isGraphicNovel: false,
  createdAt: '2024-01-02T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
};

const comicWithDate = (id: string, releaseDate: string): Comic => ({
  ...baseComic,
  id,
  title: `Issue ${id}`,
  releaseDate,
});

describe('sortComics', () => {
  const comics = [
    comicWithDate('middle', '2020-06-10'),
    comicWithDate('newest', '2024-02-14'),
    comicWithDate('oldest', '1985-04-01'),
  ];

  it('sorts release dates newest first with dateDesc', () => {
    expect(sortComics(comics, 'dateDesc').map((comic) => comic.id)).toEqual([
      'newest',
      'middle',
      'oldest',
    ]);
  });

  it('sorts release dates oldest first with dateAsc', () => {
    expect(sortComics(comics, 'dateAsc').map((comic) => comic.id)).toEqual([
      'oldest',
      'middle',
      'newest',
    ]);
  });

  it('keeps the legacy date sort as newest first', () => {
    expect(sortComics(comics, 'date').map((comic) => comic.id)).toEqual([
      'newest',
      'middle',
      'oldest',
    ]);
  });

  it('returns a sorted copy without mutating the input order', () => {
    const sorted = sortComics(comics, 'dateAsc');

    expect(sorted).not.toBe(comics);
    expect(comics.map((comic) => comic.id)).toEqual(['middle', 'newest', 'oldest']);
  });
});

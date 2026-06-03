import { describe, expect, it } from 'vitest';
import comics from '../../src/data/comics.json';
import type { Comic } from '../../src/types/Comic';
import { onRequestGet as getComics } from './comics';
import { onRequestGet as getStats } from './comics/stats';

type ApiContext = Parameters<typeof getComics>[0];

const contextFor = (url: string): ApiContext => {
  return {
    request: new Request(url),
    env: {},
    params: {},
    waitUntil: () => undefined,
    next: () => Promise.resolve(new Response(null, { status: 404 })),
    data: {},
  };
};

describe('/api/comics', () => {
  it('returns the public comic API shape used by external automation', async () => {
    const response = await getComics(contextFor('https://comics.banast.as/api/comics?series=Alien'));
    const body = await response.json() as {
      count: number;
      comics: Array<Record<string, unknown>>;
    };
    const expected = (comics as Comic[]).filter((comic) => comic.seriesName.toLowerCase().includes('alien'));

    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(body.count).toBe(expected.length);
    expect(body.comics[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        seriesName: expect.any(String),
        issueNumber: expect.any(Number),
        releaseDate: expect.any(String),
        coverImageUrl: expect.any(String),
        tags: expect.any(Array),
        isSlabbed: expect.any(Boolean),
      })
    );
  });

  it('keeps CORS open for n8n and other read-only clients', async () => {
    const response = await getComics(contextFor('https://comics.banast.as/api/comics'));

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
  });
});

describe('/api/comics/stats', () => {
  it('returns aggregate stats from the same synced comics.json source', async () => {
    const response = await getStats(contextFor('https://comics.banast.as/api/comics/stats'));
    const body = await response.json() as {
      totalCount: number;
      totalValue: number;
      topSeries: Array<{ series: string; count: number }>;
      signedCount: number;
      slabbedCount: number;
    };

    expect(body.totalCount).toBe(comics.length);
    expect(body.totalValue).toBe(
      Math.round((comics as Comic[]).reduce((sum, comic) => sum + (comic.currentValue ?? 0), 0) * 100) / 100
    );
    expect(body.topSeries.length).toBeGreaterThan(0);
    expect(body.signedCount).toBe((comics as Comic[]).filter((comic) => comic.signedBy !== '').length);
    expect(body.slabbedCount).toBe((comics as Comic[]).filter((comic) => comic.isSlabbed).length);
  });
});

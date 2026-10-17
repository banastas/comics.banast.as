import { describe, expect, it } from 'vitest';
import comics from '../../src/data/comics.json';
import type { Comic } from '../../src/types/Comic';
import {
  MAX_LIMIT,
  onRequest as fallbackComics,
  onRequestGet as getComics,
  onRequestHead as headComics,
  onRequestOptions as optionsComics,
} from './comics';
import {
  buildGradeDistribution,
  onRequest as fallbackStats,
  onRequestGet as getStats,
  onRequestHead as headStats,
  onRequestOptions as optionsStats,
} from './comics/stats';

type ApiContext = Parameters<typeof getComics>[0];
type ComicsBody = {
  count: number;
  total: number;
  offset: number;
  limit: number | null;
  comics: Array<Record<string, unknown> & { id: string }>;
};

const allComics = comics as Comic[];
const COMICS_URL = 'https://comics.banast.as/api/comics';
const STATS_URL = 'https://comics.banast.as/api/comics/stats';

const contextFor = (url: string, method = 'GET'): ApiContext => {
  return {
    request: new Request(url, { method }),
    env: {},
    params: {},
    waitUntil: () => undefined,
    next: () => Promise.resolve(new Response(null, { status: 404 })),
    data: {},
  };
};

const expectSecurityHeaders = (response: Response) => {
  expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  expect(response.headers.get('Content-Security-Policy')).toBe("default-src 'none'; frame-ancestors 'none'");
  expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
};

const expectCacheable = (response: Response) => {
  const cacheControl = response.headers.get('Cache-Control') ?? '';
  expect(cacheControl).toContain('public');
  expect(cacheControl).toMatch(/max-age=\d+/);
  expect(cacheControl).toMatch(/s-maxage=\d+/);
  expect(cacheControl).not.toContain('no-store');
};

describe('/api/comics', () => {
  it('returns the public comic API shape used by external automation', async () => {
    const response = await getComics(contextFor(`${COMICS_URL}?series=Alien`));
    const body = await response.json() as ComicsBody;
    const expected = allComics.filter((comic) => comic.seriesName.toLowerCase().includes('alien'));

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(body.count).toBe(expected.length);
    expect(body.total).toBe(expected.length);
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

  it('returns every record in source order when no pagination is requested', async () => {
    const response = await getComics(contextFor(COMICS_URL));
    const body = await response.json() as ComicsBody;

    expect(body.count).toBe(allComics.length);
    expect(body.total).toBe(allComics.length);
    expect(body.offset).toBe(0);
    expect(body.limit).toBeNull();
    expect(body.comics.map((comic) => comic.id)).toEqual(allComics.map((comic) => comic.id));
  });

  it('keeps CORS open for n8n and other read-only clients', async () => {
    const response = await getComics(contextFor(COMICS_URL));

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('HEAD');
  });

  it('sends cache and security headers on successful responses', async () => {
    const response = await getComics(contextFor(COMICS_URL));

    expectCacheable(response);
    expectSecurityHeaders(response);
  });

  it('sends security headers on CORS preflight responses', async () => {
    const response = await optionsComics(contextFor(COMICS_URL, 'OPTIONS'));

    expect(response.status).toBe(204);
    expectSecurityHeaders(response);
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('OPTIONS');
  });

  it('answers HEAD with the GET headers and no body', async () => {
    const getResponse = await getComics(contextFor(COMICS_URL));
    const response = await headComics(contextFor(COMICS_URL, 'HEAD'));

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(response.headers.get('Cache-Control')).toBe(getResponse.headers.get('Cache-Control'));
    expectSecurityHeaders(response);
    expect(response.body).toBeNull();
    expect(await response.text()).toBe('');
  });

  it('rejects unsupported methods with an uncached JSON 405', async () => {
    const response = await fallbackComics(contextFor(COMICS_URL, 'POST'));

    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('GET, HEAD, OPTIONS');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expectSecurityHeaders(response);
    expect(await response.json()).toEqual({ error: expect.any(String) });
  });

  it('pages through records with limit and offset', async () => {
    const limit = Math.max(1, Math.min(5, Math.floor(allComics.length / 2)));
    const offset = Math.min(3, allComics.length - limit);
    const response = await getComics(contextFor(`${COMICS_URL}?limit=${limit}&offset=${offset}`));
    const body = await response.json() as ComicsBody;

    expect(response.status).toBe(200);
    expectCacheable(response);
    expect(body.total).toBe(allComics.length);
    expect(body.limit).toBe(limit);
    expect(body.offset).toBe(offset);
    expect(body.count).toBe(limit);
    expect(body.comics.map((comic) => comic.id)).toEqual(
      allComics.slice(offset, offset + limit).map((comic) => comic.id)
    );
  });

  it('applies pagination after filters and allows offsets past the end', async () => {
    const matches = allComics.filter((comic) => comic.seriesName.toLowerCase().includes('alien'));
    const filtered = await getComics(contextFor(`${COMICS_URL}?series=Alien&limit=1`));
    const filteredBody = await filtered.json() as ComicsBody;

    expect(filteredBody.total).toBe(matches.length);
    expect(filteredBody.count).toBe(Math.min(1, matches.length));
    expect(filteredBody.comics.map((comic) => comic.id)).toEqual(matches.slice(0, 1).map((comic) => comic.id));

    const pastEnd = await getComics(contextFor(`${COMICS_URL}?offset=${allComics.length}`));
    const pastEndBody = await pastEnd.json() as ComicsBody;

    expect(pastEnd.status).toBe(200);
    expect(pastEndBody.count).toBe(0);
    expect(pastEndBody.total).toBe(allComics.length);
    expect(pastEndBody.comics).toEqual([]);
  });

  it('accepts the maximum limit', async () => {
    const response = await getComics(contextFor(`${COMICS_URL}?limit=${MAX_LIMIT}`));
    const body = await response.json() as ComicsBody;

    expect(response.status).toBe(200);
    expect(MAX_LIMIT).toBe(1000);
    expect(body.count).toBe(Math.min(MAX_LIMIT, allComics.length));
  });

  it.each([
    'limit=0',
    'limit=1001',
    'limit=-1',
    'limit=abc',
    'limit=1.5',
    'limit=',
    'offset=-1',
    'offset=abc',
    'offset=2.5',
    'offset=',
    'offset=99999999999999999999',
  ])('rejects invalid pagination (%s) with an uncached JSON 400', async (query) => {
    const response = await getComics(contextFor(`${COMICS_URL}?${query}`));

    expect(response.status).toBe(400);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expectSecurityHeaders(response);
    expect(await response.json()).toEqual({ error: expect.stringMatching(/limit|offset/) });
  });
});

describe('/api/comics/stats', () => {
  it('returns aggregate stats from the same synced comics.json source', async () => {
    const response = await getStats(contextFor(STATS_URL));
    const body = await response.json() as {
      totalCount: number;
      totalValue: number;
      topSeries: Array<{ series: string; count: number }>;
      gradeDistribution: Array<{ range: string; count: number }>;
      signedCount: number;
      slabbedCount: number;
    };

    expect(body.totalCount).toBe(allComics.length);
    expect(body.totalValue).toBe(
      Math.round(allComics.reduce((sum, comic) => sum + (comic.currentValue ?? 0), 0) * 100) / 100
    );
    expect(body.topSeries.length).toBeGreaterThan(0);
    expect(body.signedCount).toBe(allComics.filter((comic) => comic.signedBy !== '').length);
    expect(body.slabbedCount).toBe(allComics.filter((comic) => comic.isSlabbed).length);
    expect(body.gradeDistribution.reduce((sum, bucket) => sum + bucket.count, 0)).toBe(allComics.length);
    expect(body.gradeDistribution.map((bucket) => bucket.range)).not.toContain('10-11');
  });

  it('sends cache and security headers on successful responses', async () => {
    const response = await getStats(contextFor(STATS_URL));

    expectCacheable(response);
    expectSecurityHeaders(response);
  });

  it('answers HEAD and OPTIONS with security headers', async () => {
    const head = await headStats(contextFor(STATS_URL, 'HEAD'));
    expect(head.status).toBe(200);
    expect(head.headers.get('Content-Type')).toBe('application/json');
    expectCacheable(head);
    expectSecurityHeaders(head);
    expect(await head.text()).toBe('');

    const options = await optionsStats(contextFor(STATS_URL, 'OPTIONS'));
    expect(options.status).toBe(204);
    expectSecurityHeaders(options);
  });

  it('rejects unsupported methods with an uncached JSON 405', async () => {
    const response = await fallbackStats(contextFor(STATS_URL, 'DELETE'));

    expect(response.status).toBe(405);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expectSecurityHeaders(response);
  });

  it('places a perfect 10.0 grade in the top 9-10 bucket', () => {
    expect(buildGradeDistribution([{ grade: 10 }, { grade: 9.8 }, { grade: 9 }, { grade: 8.5 }, { grade: 0.5 }])).toEqual([
      { range: '0-1', count: 1 },
      { range: '8-9', count: 1 },
      { range: '9-10', count: 3 },
    ]);
  });
});

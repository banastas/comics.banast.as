import data from '../../../src/data/comics.json';
import type { Comic } from '../../../src/types/Comic';
import { internalError, jsonResponse, methodNotAllowed, preflightResponse } from '../../_shared/http';

const comics = data as Comic[];

// Grade buckets are one point wide ("0-1" ... "9-10"). The top bucket is
// closed so a perfect 10.0 joins "9-10" instead of creating a "10-11" bucket.
export function buildGradeDistribution(records: Pick<Comic, 'grade'>[]) {
  const gradeBuckets = new Map<number, number>();
  for (const c of records) {
    if (!Number.isFinite(c.grade)) continue;
    const bucket = Math.min(Math.max(Math.floor(c.grade), 0), 9);
    gradeBuckets.set(bucket, (gradeBuckets.get(bucket) ?? 0) + 1);
  }
  return [...gradeBuckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([bucket, count]) => ({ range: `${bucket}-${bucket + 1}`, count }));
}

export function buildStats(records: Comic[]) {
  const totalCount = records.length;

  const totalValue = records.reduce((sum, c) => sum + (c.currentValue ?? 0), 0);

  // Top series
  const seriesCounts = new Map<string, number>();
  for (const c of records) {
    seriesCounts.set(c.seriesName, (seriesCounts.get(c.seriesName) ?? 0) + 1);
  }
  const topSeries = [...seriesCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([series, count]) => ({ series, count }));

  // Top cover artists (skip blanks)
  const artistCounts = new Map<string, number>();
  for (const c of records) {
    if (c.coverArtist) {
      artistCounts.set(c.coverArtist, (artistCounts.get(c.coverArtist) ?? 0) + 1);
    }
  }
  const topCoverArtists = [...artistCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([artist, count]) => ({ artist, count }));

  const signedCount = records.filter((c) => c.signedBy !== '').length;
  const slabbedCount = records.filter((c) => c.isSlabbed).length;

  return {
    totalCount,
    totalValue: Math.round(totalValue * 100) / 100,
    topSeries,
    topCoverArtists,
    gradeDistribution: buildGradeDistribution(records),
    signedCount,
    slabbedCount,
  };
}

const handleRead: PagesFunction = ({ request }) => {
  try {
    return jsonResponse(buildStats(comics), request);
  } catch {
    return internalError(request);
  }
};

export const onRequestGet: PagesFunction = handleRead;
export const onRequestHead: PagesFunction = handleRead;
export const onRequestOptions: PagesFunction = () => preflightResponse();
// Method-specific handlers take precedence; anything else gets a JSON 405.
export const onRequest: PagesFunction = ({ request }) => methodNotAllowed(request);

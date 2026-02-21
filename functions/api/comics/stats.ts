import data from '../../../src/data/comics.json';

interface Comic {
  seriesName: string;
  coverArtist: string;
  grade: number;
  currentValue?: number;
  signedBy: string;
  isSlabbed: boolean;
  [key: string]: unknown;
}

const comics = data as Comic[];

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: corsHeaders() });
};

export const onRequestGet: PagesFunction = async () => {
  const totalCount = comics.length;

  const totalValue = comics.reduce(
    (sum, c) => sum + (c.currentValue ?? 0),
    0
  );

  // Top series
  const seriesCounts = new Map<string, number>();
  for (const c of comics) {
    seriesCounts.set(c.seriesName, (seriesCounts.get(c.seriesName) ?? 0) + 1);
  }
  const topSeries = [...seriesCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([series, count]) => ({ series, count }));

  // Top cover artists (skip blanks)
  const artistCounts = new Map<string, number>();
  for (const c of comics) {
    if (c.coverArtist) {
      artistCounts.set(
        c.coverArtist,
        (artistCounts.get(c.coverArtist) ?? 0) + 1
      );
    }
  }
  const topCoverArtists = [...artistCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([artist, count]) => ({ artist, count }));

  // Grade distribution (buckets: 0-1, 1-2, ... 9-10)
  const gradeBuckets = new Map<string, number>();
  for (const c of comics) {
    const floor = Math.floor(c.grade);
    const label = `${floor}-${floor + 1}`;
    gradeBuckets.set(label, (gradeBuckets.get(label) ?? 0) + 1);
  }
  const gradeDistribution = [...gradeBuckets.entries()]
    .sort((a, b) => {
      const aNum = parseInt(a[0]);
      const bNum = parseInt(b[0]);
      return aNum - bNum;
    })
    .map(([range, count]) => ({ range, count }));

  const signedCount = comics.filter((c) => c.signedBy !== '').length;
  const slabbedCount = comics.filter((c) => c.isSlabbed).length;

  return new Response(
    JSON.stringify({
      totalCount,
      totalValue: Math.round(totalValue * 100) / 100,
      topSeries,
      topCoverArtists,
      gradeDistribution,
      signedCount,
      slabbedCount,
    }),
    { headers: corsHeaders() }
  );
};

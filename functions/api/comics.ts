import data from '../../src/data/comics.json';

interface Comic {
  seriesName: string;
  issueNumber: number;
  coverImageUrl: string;
  coverArtist: string;
  signedBy: string;
  notes: string;
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

function shape(c: Comic) {
  return {
    seriesName: c.seriesName,
    issueNumber: c.issueNumber,
    releaseDate: c.releaseDate,
    coverImageUrl: c.coverImageUrl,
    coverArtist: c.coverArtist,
    grade: c.grade,
    purchasePrice: c.purchasePrice ?? null,
    purchaseDate: c.purchaseDate,
    currentValue: c.currentValue ?? null,
    notes: c.notes,
    signedBy: c.signedBy,
    storageLocation: c.storageLocation,
    tags: c.tags,
    isVariant: c.isVariant,
    isGraphicNovel: c.isGraphicNovel,
    isSlabbed: c.isSlabbed,
  };
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: corsHeaders() });
};

export const onRequestGet: PagesFunction = async ({ request }) => {
  const url = new URL(request.url);
  const series = url.searchParams.get('series')?.toLowerCase();
  const artist = url.searchParams.get('artist')?.toLowerCase();
  const q = url.searchParams.get('q')?.toLowerCase();

  let results = comics;

  if (series) {
    results = results.filter((c) =>
      c.seriesName.toLowerCase().includes(series)
    );
  }

  if (artist) {
    results = results.filter((c) =>
      c.coverArtist.toLowerCase().includes(artist)
    );
  }

  if (q) {
    results = results.filter((c) => {
      const haystack = [c.seriesName, c.coverArtist, c.signedBy, c.notes]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  return new Response(
    JSON.stringify({ count: results.length, comics: results.map(shape) }),
    { headers: corsHeaders() }
  );
};

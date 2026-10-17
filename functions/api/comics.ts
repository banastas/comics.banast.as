import data from '../../src/data/comics.json';
import type { Comic } from '../../src/types/Comic';
import { errorResponse, internalError, jsonResponse, methodNotAllowed, preflightResponse } from '../_shared/http';

const comics = data as Comic[];

export const MAX_LIMIT = 1000;

function shape(c: Comic) {
  return {
    id: c.id,
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

type Pagination = { limit: number | null; offset: number };

// Returns the parsed pagination window, or an error message for invalid input.
function parsePagination(params: URLSearchParams): Pagination | string {
  const rawLimit = params.get('limit');
  const rawOffset = params.get('offset');
  let limit: number | null = null;
  let offset = 0;

  if (rawLimit !== null) {
    limit = /^\d+$/.test(rawLimit) ? Number(rawLimit) : NaN;
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
      return `"limit" must be an integer from 1 to ${MAX_LIMIT}.`;
    }
  }

  if (rawOffset !== null) {
    offset = /^\d+$/.test(rawOffset) ? Number(rawOffset) : NaN;
    if (!Number.isSafeInteger(offset)) {
      return '"offset" must be an integer greater than or equal to 0.';
    }
  }

  return { limit, offset };
}

function filterComics(params: URLSearchParams): Comic[] {
  const series = params.get('series')?.toLowerCase();
  const artist = params.get('artist')?.toLowerCase();
  const q = params.get('q')?.toLowerCase();

  let results = comics;

  if (series) {
    results = results.filter((c) => c.seriesName.toLowerCase().includes(series));
  }

  if (artist) {
    results = results.filter((c) => c.coverArtist.toLowerCase().includes(artist));
  }

  if (q) {
    results = results.filter((c) => {
      const haystack = [c.seriesName, c.coverArtist, c.signedBy, c.notes].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }

  return results;
}

const handleRead: PagesFunction = ({ request }) => {
  try {
    const params = new URL(request.url).searchParams;
    const pagination = parsePagination(params);
    if (typeof pagination === 'string') {
      return errorResponse(pagination, request, 400);
    }

    const matches = filterComics(params);
    const { limit, offset } = pagination;
    const page = matches.slice(offset, limit === null ? undefined : offset + limit);

    // `count` and `comics` keep their original meaning (the records in this
    // response). Without `limit`/`offset` the full match set is returned, so
    // `count` equals `total` exactly as before pagination existed.
    return jsonResponse(
      {
        count: page.length,
        total: matches.length,
        offset,
        limit,
        comics: page.map(shape),
      },
      request
    );
  } catch {
    return internalError(request);
  }
};

export const onRequestGet: PagesFunction = handleRead;
export const onRequestHead: PagesFunction = handleRead;
export const onRequestOptions: PagesFunction = () => preflightResponse();
// Method-specific handlers take precedence; anything else gets a JSON 405
// instead of falling through to the static SPA shell.
export const onRequest: PagesFunction = ({ request }) => methodNotAllowed(request);

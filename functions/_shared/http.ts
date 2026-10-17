// Shared response helpers for the read-only collection API.
//
// Pages Functions responses do not receive the rules in public/_headers, so the
// security headers are applied here for every response (success, preflight,
// and error). This file exports no onRequest* handlers, so Pages does not
// route it.

export const ALLOWED_METHODS = 'GET, HEAD, OPTIONS';

// The collection data only changes on deploy. Browsers revalidate after five
// minutes, the Cloudflare edge holds responses for an hour, and stale copies
// can be served for a day while a fresh copy is fetched.
export const SUCCESS_CACHE_CONTROL = 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400';
export const ERROR_CACHE_CONTROL = 'no-store';

const baseHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': ALLOWED_METHODS,
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
};

export function apiHeaders(extra: Record<string, string> = {}): Headers {
  return new Headers({ ...baseHeaders, ...extra });
}

export function jsonResponse(body: unknown, request: Request, status = 200): Response {
  const isError = status >= 400;
  const headers = apiHeaders({
    'Content-Type': 'application/json',
    'Cache-Control': isError ? ERROR_CACHE_CONTROL : SUCCESS_CACHE_CONTROL,
  });
  return new Response(request.method === 'HEAD' ? null : JSON.stringify(body), { status, headers });
}

export function errorResponse(message: string, request: Request, status: number, extra: Record<string, string> = {}): Response {
  const response = jsonResponse({ error: message }, request, status);
  for (const [key, value] of Object.entries(extra)) response.headers.set(key, value);
  return response;
}

export function preflightResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: apiHeaders({ 'Access-Control-Max-Age': '86400' }),
  });
}

export function methodNotAllowed(request: Request): Response {
  return errorResponse(`Method ${request.method} is not allowed.`, request, 405, { Allow: ALLOWED_METHODS });
}

export function internalError(request: Request): Response {
  return errorResponse('Internal server error.', request, 500);
}

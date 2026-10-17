// Cover URLs that point at a placeholder graphic instead of a real cover scan.
// The source app writes `https://covers.banast.as/noCover.jpg` (an "image coming
// soon" graphic) when no cover has been uploaded, and older syncs wrote the bare
// directory URL `https://covers.banast.as/` with no file name.
// Keep this list in sync with the client-side rule in src/utils/structured-data.ts.
export const PLACEHOLDER_COVER_PATTERNS = [
  /\/no[-_ ]?cover\.(?:jpe?g|png|webp|gif)$/i,
  /^https?:\/\/[^/]+\/?$/i,
];

export const isPlaceholderCover = (url) => {
  if (typeof url !== 'string' || url.trim() === '') return true;
  return PLACEHOLDER_COVER_PATTERNS.some((pattern) => pattern.test(url.trim()));
};

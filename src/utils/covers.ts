// The source app uses a shared "image coming soon" graphic when a cover hasn't been uploaded yet.
// Older syncs also wrote a bare directory URL (https://covers.banast.as/) when no file existed.
const PLACEHOLDER_COVER_PATTERNS = [/\/no[-_ ]?cover\.(?:jpe?g|png|webp|gif)$/i, /^https?:\/\/[^/]+\/?$/i];

export const hasRealCover = (url: string | undefined): url is string =>
  Boolean(url && url.trim() !== '' && !PLACEHOLDER_COVER_PATTERNS.some((pattern) => pattern.test(url)));

// Covers are full-size JPEGs (~160 KB) on covers.banast.as. Cloudflare Image Transformations is
// enabled for the banast.as zone, so covers are served resized and in a modern format (AVIF/WebP)
// through covers.banast.as/cdn-cgi/image, which also works on preview builds and in local dev.
// Set PUBLIC_COVER_RESIZE=off at build time to serve the original files instead.
//
// Only two widths are requested: the free tier allows 5,000 unique transformations a month, and
// two widths for ~900 covers stays well inside it.
const resizeEnabled = import.meta.env.PUBLIC_COVER_RESIZE !== 'off';
const COVER_ORIGIN = 'https://covers.banast.as';
export const THUMBNAIL_WIDTHS = [240, 480] as const;

const resizedUrl = (url: string, width: number): string =>
  `${COVER_ORIGIN}/cdn-cgi/image/width=${width},quality=80,format=auto,fit=scale-down/${url.slice(COVER_ORIGIN.length + 1)}`;

export interface CoverSource {
  src: string;
  srcSet?: string;
}

export const getCoverSource = (url: string, displayWidth: number): CoverSource => {
  if (!resizeEnabled || !url.startsWith(`${COVER_ORIGIN}/`)) return { src: url };
  // The smallest width that is at least twice the displayed width, else the largest.
  const fit = THUMBNAIL_WIDTHS.find((width) => width >= displayWidth * 2) ?? THUMBNAIL_WIDTHS[THUMBNAIL_WIDTHS.length - 1];
  const widths = THUMBNAIL_WIDTHS.filter((width) => width <= fit);
  return {
    src: resizedUrl(url, fit),
    srcSet: widths.length > 1 ? widths.map((width) => `${resizedUrl(url, width)} ${width}w`).join(', ') : undefined,
  };
};

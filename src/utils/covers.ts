// The source app uses a shared "image coming soon" graphic when a cover hasn't been uploaded yet.
// Older syncs also wrote a bare directory URL (https://covers.banast.as/) when no file existed.
const PLACEHOLDER_COVER_PATTERNS = [/\/no[-_ ]?cover\.(?:jpe?g|png|webp|gif)$/i, /^https?:\/\/[^/]+\/?$/i];

export const hasRealCover = (url: string | undefined): url is string =>
  Boolean(url && url.trim() !== '' && !PLACEHOLDER_COVER_PATTERNS.some((pattern) => pattern.test(url)));

// Covers are full-size JPEGs (~400 KB). When Cloudflare Image Transformations are enabled for the
// site's zone, set VITE_COVER_RESIZE=cloudflare at build time to serve resized, modern-format
// thumbnails through /cdn-cgi/image. Without it the original file is used unchanged.
const resizeEnabled = import.meta.env.VITE_COVER_RESIZE === 'cloudflare';
const THUMBNAIL_WIDTHS = [160, 240, 360, 480, 720];

const resizedUrl = (url: string, width: number): string =>
  `/cdn-cgi/image/width=${width},quality=80,format=auto,fit=scale-down/${url}`;

export interface CoverSource {
  src: string;
  srcSet?: string;
}

export const getCoverSource = (url: string, displayWidth: number): CoverSource => {
  if (!resizeEnabled) return { src: url };
  const widths = THUMBNAIL_WIDTHS.filter((width) => width <= displayWidth * 2);
  const candidates = widths.length > 0 ? widths : [THUMBNAIL_WIDTHS[0]];
  return {
    src: resizedUrl(url, candidates[candidates.length - 1]),
    srcSet: candidates.map((width) => `${resizedUrl(url, width)} ${width}w`).join(', '),
  };
};

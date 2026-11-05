// Comic permalinks and issue labels, shared by the app, the API and the sheet sync.
// This module has no runtime imports so Node can load it directly from scripts/sync.

export interface ComicSlugInput {
  id: string;
  seriesName: string;
  issueNumber: string | number;
  isVariant: boolean;
  slug?: string;
}

/** A stored slug: lowercase words joined by hyphens (dots allowed for issues like 0.5), ending with the ID number. */
export const COMIC_SLUG_PATTERN = /^[a-z0-9][a-z0-9.-]*-\d+$/;

/** Builds the permalink slug from the record's fields, e.g. "action-comics-issue-687-variant-169". */
export const computeComicSlug = (comic: ComicSlugInput): string => {
  const seriesSlug = comic.seriesName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const variantSlug = comic.isVariant ? '-variant' : '';
  const idMatch = comic.id.match(/\d+$/);
  const idSuffix = idMatch ? `-${idMatch[0]}` : '';
  return `${seriesSlug}-issue-${comic.issueNumber}${variantSlug}${idSuffix}`;
};

/**
 * The comic's permalink slug. Records store the slug they were first published
 * with, so renaming a series or fixing an issue number never changes a URL.
 */
export const comicSlug = (comic: ComicSlugInput): string => comic.slug || computeComicSlug(comic);

/** The issue as shown to readers: the sheet's issue label (e.g. "Annual 1") or "#<number>". */
export const issueText = (comic: { issueNumber: number | string; issueLabel?: string }): string =>
  comic.issueLabel?.trim() || `#${comic.issueNumber}`;

/** The issue in running text: the issue label, or "Issue #<number>". */
export const issuePhrase = (comic: { issueNumber: number | string; issueLabel?: string }): string =>
  comic.issueLabel?.trim() || `Issue #${comic.issueNumber}`;

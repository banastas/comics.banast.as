import { z } from 'zod';
import { COMIC_SLUG_PATTERN } from '../utils/comic-slug.ts';

// The site's Content-Security-Policy forbids eval; skip Zod's `new Function` JIT probe.
z.config({ jitless: true });

export const comicSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  seriesName: z.string().min(1),
  issueNumber: z.number(),
  releaseDate: z.string().min(1),
  coverImageUrl: z.string(),
  coverArtist: z.string(),
  grade: z.number().min(0.5).max(10),
  purchasePrice: z.number().optional(),
  purchaseDate: z.string().min(1),
  currentValue: z.number().optional(),
  notes: z.string(),
  signedBy: z.string(),
  storageLocation: z.string(),
  tags: z.array(z.string()),
  isSlabbed: z.boolean(),
  isVariant: z.boolean(),
  isGraphicNovel: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  slug: z.string().regex(COMIC_SLUG_PATTERN).optional(),
  issueLabel: z.string().trim().min(1).optional(),
  valueAsOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const comicsSchema = z.array(comicSchema);

export const parseComics = (data: unknown) => comicsSchema.parse(data);

/** Optional per-series details in src/data/series.json, keyed by the exact seriesName. */
export const seriesMetadataSchema = z.record(
  z.string().min(1),
  z.strictObject({
    publisher: z.string().trim().min(1).optional(),
    volume: z.number().int().positive().optional(),
    startYear: z.number().int().min(1900).max(2100).optional(),
  }),
);

export type SeriesMetadata = z.infer<typeof seriesMetadataSchema>;

import { z } from 'zod';

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
});

export const comicsSchema = z.array(comicSchema);

export const parseComics = (data: unknown) => comicsSchema.parse(data);

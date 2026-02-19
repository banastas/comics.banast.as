import { z } from 'zod';

export const comicSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  seriesName: z.string().min(1, 'Series name is required').max(100, 'Series name must be less than 100 characters'),
  issueNumber: z.number().positive('Issue number must be positive').int('Issue number must be a whole number'),
  releaseDate: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed <= new Date();
  }, 'Release date must be a valid date in the past'),
  coverImageUrl: z.string().url('Cover image URL must be valid').optional().or(z.literal('')),
  coverArtist: z.string().max(100, 'Cover artist must be less than 100 characters'),
  grade: z.number().min(0.5, 'Grade must be at least 0.5').max(10.0, 'Grade must be at most 10.0'),
  purchasePrice: z.number().min(0, 'Purchase price must be non-negative').optional(),
  purchaseDate: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, 'Purchase date must be a valid date'),
  currentValue: z.number().min(0, 'Current value must be non-negative').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters'),
  signedBy: z.string().max(100, 'Signed by must be less than 100 characters'),
  storageLocation: z.string().max(100, 'Storage location must be less than 100 characters'),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).max(20, 'Maximum 20 tags allowed'),
  isSlabbed: z.boolean(),
  isVariant: z.boolean(),
  isGraphicNovel: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const comicInputSchema = comicSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const comicUpdateSchema = comicSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ComicInput = z.infer<typeof comicInputSchema>;
export type ComicUpdate = z.infer<typeof comicUpdateSchema>;

// Validation functions
export const validateComic = (data: unknown) => {
  return comicSchema.safeParse(data);
};

export const validateComicInput = (data: unknown) => {
  return comicInputSchema.safeParse(data);
};

export const validateComicUpdate = (data: unknown) => {
  return comicUpdateSchema.safeParse(data);
};

// Helper function to get validation errors
export const getValidationErrors = (result: z.SafeParseError<unknown>) => {
  return result.error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};

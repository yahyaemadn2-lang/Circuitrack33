import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  parent_id: z.string().uuid().nullable(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  parent_id: z.string().uuid().nullable().optional(),
});

export type Category = {
  id: string;
  name: string;
  description: string;
  parent_id: string | null;
  created_at: string;
};

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

import { z } from 'zod';

export const createFavoriteSchema = z.object({
  user_id: z.string().uuid(),
  product_id: z.string().uuid(),
});

export const updateFavoriteSchema = z.object({
  user_id: z.string().uuid().optional(),
  product_id: z.string().uuid().optional(),
});

export type FavoriteItem = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};

export type CreateFavoriteInput = z.infer<typeof createFavoriteSchema>;
export type UpdateFavoriteInput = z.infer<typeof updateFavoriteSchema>;

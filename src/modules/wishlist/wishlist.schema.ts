import { z } from 'zod';

export const createWishlistItemSchema = z.object({
  user_id: z.string().uuid(),
  product_id: z.string().uuid(),
});

export const updateWishlistItemSchema = z.object({
  user_id: z.string().uuid().optional(),
  product_id: z.string().uuid().optional(),
});

export type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};

export type CreateWishlistItemInput = z.infer<typeof createWishlistItemSchema>;
export type UpdateWishlistItemInput = z.infer<typeof updateWishlistItemSchema>;

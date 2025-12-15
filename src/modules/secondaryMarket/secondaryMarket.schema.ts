import { z } from 'zod';

export const SecondaryMarketListingSchema = z.object({
  id: z.string().uuid(),
  seller_id: z.string().uuid(),
  product_reference: z.string().min(1),
  condition: z.enum(['new', 'used', 'refurbished']).default('used'),
  quantity: z.number().int().positive().default(1),
  asking_price: z.number().positive(),
  notes: z.string().default(''),
  status: z.enum(['active', 'sold', 'cancelled']).default('active'),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateSecondaryMarketListingSchema = z.object({
  product_reference: z.string().min(1, 'Product name/reference is required'),
  condition: z.enum(['new', 'used', 'refurbished']),
  quantity: z.number().int().positive().min(1),
  asking_price: z.number().positive(),
  notes: z.string().default(''),
});

export const UpdateSecondaryMarketListingSchema = z.object({
  asking_price: z.number().positive().optional(),
  quantity: z.number().int().positive().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'sold', 'cancelled']).optional(),
});

export type SecondaryMarketListing = z.infer<typeof SecondaryMarketListingSchema>;
export type CreateSecondaryMarketListingInput = z.infer<typeof CreateSecondaryMarketListingSchema>;
export type UpdateSecondaryMarketListingInput = z.infer<typeof UpdateSecondaryMarketListingSchema>;

import { z } from 'zod';

export const OfferSchema = z.object({
  id: z.string().uuid(),
  buyer_id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  product_id: z.string().uuid(),
  offered_price: z.number().positive(),
  quantity: z.number().int().positive().default(1),
  message: z.string().default(''),
  response_message: z.string().default(''),
  parent_offer_id: z.string().uuid().nullable().optional(),
  status: z.enum(['pending', 'accepted', 'rejected', 'countered']).default('pending'),
  created_at: z.string(),
});

export const CreateOfferSchema = z.object({
  product_id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  offered_price: z.number().positive(),
  quantity: z.number().int().positive().min(1),
  message: z.string().default(''),
});

export const UpdateOfferSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'countered']).optional(),
  response_message: z.string().optional(),
});

export const CounterOfferSchema = z.object({
  parent_offer_id: z.string().uuid(),
  offered_price: z.number().positive(),
  quantity: z.number().int().positive(),
  response_message: z.string().default(''),
});

export type Offer = z.infer<typeof OfferSchema>;
export type CreateOfferInput = z.infer<typeof CreateOfferSchema>;
export type UpdateOfferInput = z.infer<typeof UpdateOfferSchema>;
export type CounterOfferInput = z.infer<typeof CounterOfferSchema>;

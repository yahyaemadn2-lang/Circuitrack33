import { z } from 'zod';

export const createOrderSchema = z.object({
  user_id: z.string().uuid(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().positive(),
  })),
  total: z.number().positive(),
  status: z.string(),
});

export const updateOrderSchema = z.object({
  user_id: z.string().uuid().optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().positive(),
  })).optional(),
  total: z.number().positive().optional(),
  status: z.string().optional(),
});

export type Order = {
  id: string;
  user_id: string;
  items: Array<{ product_id: string; quantity: number }>;
  total: number;
  status: string;
  created_at: string;
};

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

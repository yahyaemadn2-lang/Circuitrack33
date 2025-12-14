import { z } from 'zod';

export const createProductSchema = z.object({
  vendor_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  category_id: z.string().uuid(),
});

export const updateProductSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  category_id: z.string().uuid().optional(),
});

export type Product = {
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  created_at: string;
};

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

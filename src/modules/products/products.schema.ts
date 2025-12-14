import { z } from 'zod';

export const productSchema = z.object({
  id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  category_id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  price: z.number(),
  condition: z.string(),
  created_at: z.string(),
});

export const createProductSchema = z.object({
  vendor_id: z.string().uuid(),
  category_id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().default(''),
  price: z.number().positive(),
  condition: z.enum(['new', 'used']).default('new'),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  condition: z.enum(['new', 'used']).optional(),
  category_id: z.string().uuid().optional(),
});

export type Product = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export interface ProductWithRelations extends Product {
  vendor?: {
    id: string;
    display_name: string;
    status: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: 'new' | 'used';
}

export interface ProductSortOptions {
  sortBy?: 'created_at' | 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

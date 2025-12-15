import { z } from 'zod';

export const orderSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  company_id: z.string().uuid().nullable(),
  status: z.string(),
  subtotal: z.number(),
  currency: z.string(),
  created_at: z.string(),
});

export const orderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number(),
  unit_price: z.number(),
  created_at: z.string(),
});

export const createOrderSchema = z.object({
  user_id: z.string().uuid(),
  company_id: z.string().uuid().optional(),
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).default('pending'),
  subtotal: z.number().positive(),
  currency: z.string().default('EGP'),
});

export const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
  subtotal: z.number().positive().optional(),
});

export const createOrderItemSchema = z.object({
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  unit_price: z.number().positive(),
});

export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;

export interface OrderWithItems extends Order {
  items?: Array<OrderItem & {
    product?: {
      id: string;
      name: string;
      slug: string;
      price: number;
    }
  }>;
}

export interface CheckoutData {
  companyName: string;
  address: string;
  country: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  termsAccepted: boolean;
}

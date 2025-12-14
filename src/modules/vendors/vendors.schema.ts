import { z } from 'zod';

export const createVendorSchema = z.object({
  user_id: z.string().uuid(),
  company_name: z.string().min(1),
  description: z.string(),
  phone: z.string(),
  address: z.string(),
});

export const updateVendorSchema = z.object({
  company_name: z.string().min(1).optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type Vendor = {
  id: string;
  user_id: string;
  company_name: string;
  description: string;
  phone: string;
  address: string;
  created_at: string;
};

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;

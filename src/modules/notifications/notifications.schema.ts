import { z } from 'zod';

export const createNotificationSchema = z.object({
  user_id: z.string().uuid(),
  title: z.string().min(1),
  body: z.string().min(1),
  read: z.boolean().default(false),
});

export const updateNotificationSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  read: z.boolean().optional(),
});

export const markAsReadSchema = z.object({
  read: z.boolean(),
});

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
};

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;

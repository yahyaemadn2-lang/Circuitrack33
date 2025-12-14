import { z } from 'zod';

export const suggestionStatusEnum = z.enum(['pending', 'reviewed', 'resolved']);

export const createSuggestionSchema = z.object({
  user_id: z.string().uuid(),
  message: z.string().min(1),
  status: suggestionStatusEnum.optional().default('pending'),
});

export const updateSuggestionSchema = z.object({
  user_id: z.string().uuid().optional(),
  message: z.string().min(1).optional(),
  status: suggestionStatusEnum.optional(),
});

export type Suggestion = {
  id: string;
  user_id: string;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
};

export type CreateSuggestionInput = z.infer<typeof createSuggestionSchema>;
export type UpdateSuggestionInput = z.infer<typeof updateSuggestionSchema>;

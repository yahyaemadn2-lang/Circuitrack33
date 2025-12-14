import { z } from 'zod';

export const createWalletSchema = z.object({
  user_id: z.string().uuid(),
  main_balance: z.number().default(0),
  cashback_balance: z.number().default(0),
  penalty_balance: z.number().default(0),
});

export const updateWalletSchema = z.object({
  main_balance: z.number().optional(),
  cashback_balance: z.number().optional(),
  penalty_balance: z.number().optional(),
});

export const balanceOperationSchema = z.object({
  amount: z.number().positive(),
  balance_type: z.enum(['main_balance', 'cashback_balance', 'penalty_balance']).default('main_balance'),
});

export type Wallet = {
  id: string;
  user_id: string;
  main_balance: number;
  cashback_balance: number;
  penalty_balance: number;
  created_at: string;
};

export type CreateWalletInput = z.infer<typeof createWalletSchema>;
export type UpdateWalletInput = z.infer<typeof updateWalletSchema>;
export type BalanceOperationInput = z.infer<typeof balanceOperationSchema>;

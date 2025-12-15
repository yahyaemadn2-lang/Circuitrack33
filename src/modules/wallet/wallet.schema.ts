import { z } from 'zod';

export const walletSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  main_balance: z.number(),
  cashback_balance: z.number(),
  penalty_balance: z.number(),
});

export const walletTransactionSchema = z.object({
  id: z.string().uuid(),
  wallet_id: z.string().uuid(),
  type: z.string(),
  amount: z.number(),
  created_at: z.string(),
});

export const createWalletSchema = z.object({
  user_id: z.string().uuid(),
  main_balance: z.number().default(0),
  cashback_balance: z.number().default(0),
  penalty_balance: z.number().default(0),
});

export const createWalletTransactionSchema = z.object({
  wallet_id: z.string().uuid(),
  type: z.enum(['credit', 'debit', 'cashback', 'penalty', 'refund']),
  amount: z.number(),
  reference_id: z.string().uuid().optional(),
  reference_type: z.enum(['order', 'topup', 'refund', 'cashback', 'penalty']).optional(),
});

export type Wallet = z.infer<typeof walletSchema>;
export type WalletTransaction = z.infer<typeof walletTransactionSchema>;
export type CreateWalletInput = z.infer<typeof createWalletSchema>;
export type CreateWalletTransactionInput = z.infer<typeof createWalletTransactionSchema>;

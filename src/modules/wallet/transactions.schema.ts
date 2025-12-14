import { z } from 'zod';

export const transactionTypeEnum = z.enum(['credit', 'debit']);

export const createTransactionSchema = z.object({
  wallet_id: z.string().uuid(),
  type: transactionTypeEnum,
  amount: z.number().positive(),
  balance_type: z.enum(['main_balance', 'cashback_balance', 'penalty_balance']).default('main_balance'),
});

export type WalletTransaction = {
  id: string;
  wallet_id: string;
  type: string;
  amount: number;
  created_at: string;
};

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

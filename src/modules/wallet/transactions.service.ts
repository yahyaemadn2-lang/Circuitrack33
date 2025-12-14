import { supabase } from '@/src/lib/supabaseClient';
import { CreateTransactionInput, WalletTransaction } from './transactions.schema';
import * as walletsService from './wallets.service';

export async function getTransactions() {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as WalletTransaction[];
}

export async function getTransactionsByWalletId(walletId: string) {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('wallet_id', walletId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as WalletTransaction[];
}

export async function createTransaction(input: CreateTransactionInput) {
  if (input.type === 'credit') {
    await walletsService.increaseBalance(input.wallet_id, input.amount, input.balance_type);
  } else if (input.type === 'debit') {
    await walletsService.decreaseBalance(input.wallet_id, input.amount, input.balance_type);
  }

  const { data, error } = await supabase
    .from('wallet_transactions')
    .insert({
      wallet_id: input.wallet_id,
      type: input.type,
      amount: input.amount,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as WalletTransaction;
}

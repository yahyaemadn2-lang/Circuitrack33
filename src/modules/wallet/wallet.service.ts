import { supabase } from '../../lib/supabaseClient';
import {
  Wallet,
  WalletTransaction,
  CreateWalletInput,
  CreateWalletTransactionInput,
} from './wallet.schema';

export async function getWalletByUserId(userId: string): Promise<Wallet | null> {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Wallet | null;
}

export async function createWallet(input: CreateWalletInput): Promise<Wallet> {
  const { data, error } = await supabase
    .from('wallets')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Wallet;
}

export async function createWalletTransaction(
  input: CreateWalletTransactionInput
): Promise<WalletTransaction> {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as WalletTransaction;
}

export async function getWalletTransactions(
  walletId: string
): Promise<WalletTransaction[]> {
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

export async function updateWalletBalance(
  walletId: string,
  amount: number,
  type: 'main' | 'cashback' | 'penalty'
): Promise<Wallet> {
  const balanceField = `${type}_balance`;

  const { data: wallet, error: fetchError } = await supabase
    .from('wallets')
    .select('*')
    .eq('id', walletId)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const currentBalance = wallet[balanceField] || 0;
  const newBalance = currentBalance + amount;

  if (newBalance < 0) {
    throw new Error('Insufficient wallet balance');
  }

  const { data, error } = await supabase
    .from('wallets')
    .update({ [balanceField]: newBalance })
    .eq('id', walletId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Wallet;
}

export async function debitWallet(
  walletId: string,
  amount: number,
  referenceId?: string,
  referenceType?: string
): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
  const transaction = await createWalletTransaction({
    wallet_id: walletId,
    type: 'debit',
    amount: -amount,
    reference_id: referenceId,
    reference_type: referenceType as any,
  });

  const wallet = await updateWalletBalance(walletId, -amount, 'main');

  return { wallet, transaction };
}

export async function creditWallet(
  walletId: string,
  amount: number,
  referenceId?: string,
  referenceType?: string
): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
  const transaction = await createWalletTransaction({
    wallet_id: walletId,
    type: 'credit',
    amount: amount,
    reference_id: referenceId,
    reference_type: referenceType as any,
  });

  const wallet = await updateWalletBalance(walletId, amount, 'main');

  return { wallet, transaction };
}

import { supabase } from '@/src/lib/supabaseClient';
import { CreateWalletInput, UpdateWalletInput, Wallet } from './wallets.schema';

export async function getWallets() {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Wallet[];
}

export async function getWalletById(id: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Wallet | null;
}

export async function getWalletByUserId(userId: string) {
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

export async function createWallet(input: CreateWalletInput) {
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

export async function updateWallet(id: string, input: UpdateWalletInput) {
  const { data, error } = await supabase
    .from('wallets')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Wallet;
}

export async function increaseBalance(
  walletId: string,
  amount: number,
  balanceType: 'main_balance' | 'cashback_balance' | 'penalty_balance' = 'main_balance'
) {
  const wallet = await getWalletById(walletId);
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  const currentBalance = wallet[balanceType];
  const newBalance = currentBalance + amount;

  const updateData = { [balanceType]: newBalance };

  const { data, error } = await supabase
    .from('wallets')
    .update(updateData)
    .eq('id', walletId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Wallet;
}

export async function decreaseBalance(
  walletId: string,
  amount: number,
  balanceType: 'main_balance' | 'cashback_balance' | 'penalty_balance' = 'main_balance'
) {
  const wallet = await getWalletById(walletId);
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  const currentBalance = wallet[balanceType];
  const newBalance = currentBalance - amount;

  if (newBalance < 0) {
    throw new Error('Insufficient balance');
  }

  const updateData = { [balanceType]: newBalance };

  const { data, error } = await supabase
    .from('wallets')
    .update(updateData)
    .eq('id', walletId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Wallet;
}

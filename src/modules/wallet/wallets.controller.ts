import { createWalletSchema, updateWalletSchema, balanceOperationSchema } from './wallets.schema';
import * as walletsService from './wallets.service';

export async function listWallets(userId?: string) {
  try {
    const items = userId
      ? [await walletsService.getWalletByUserId(userId)].filter(Boolean)
      : await walletsService.getWallets();
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getWallet(id: string) {
  try {
    const item = await walletsService.getWalletById(id);
    if (!item) {
      return { success: false, error: 'Wallet not found' };
    }
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function createWallet(body: unknown) {
  try {
    const parsed = createWalletSchema.parse(body);
    const item = await walletsService.createWallet(parsed);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateWallet(id: string, body: unknown) {
  try {
    const parsed = updateWalletSchema.parse(body);
    const item = await walletsService.updateWallet(id, parsed);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function creditWallet(id: string, body: unknown) {
  try {
    const parsed = balanceOperationSchema.parse(body);
    const item = await walletsService.increaseBalance(id, parsed.amount, parsed.balance_type);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function debitWallet(id: string, body: unknown) {
  try {
    const parsed = balanceOperationSchema.parse(body);
    const item = await walletsService.decreaseBalance(id, parsed.amount, parsed.balance_type);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

import { createTransactionSchema } from './transactions.schema';
import * as transactionsService from './transactions.service';

export async function listTransactions() {
  try {
    const items = await transactionsService.getTransactions();
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getWalletTransactions(walletId: string) {
  try {
    const items = await transactionsService.getTransactionsByWalletId(walletId);
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function createTransaction(body: unknown) {
  try {
    const parsed = createTransactionSchema.parse(body);
    const item = await transactionsService.createTransaction(parsed);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

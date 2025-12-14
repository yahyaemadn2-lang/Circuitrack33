import * as transactionsController from '@/src/modules/wallet/transactions.controller';

export async function GET(req: Request, { params }: { params: { wallet_id: string } }) {
  const result = await transactionsController.getWalletTransactions(params.wallet_id);
  return Response.json(result);
}

import * as transactionsController from '@/src/modules/wallet/transactions.controller';

export async function GET(req: Request) {
  const result = await transactionsController.listTransactions();
  return Response.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const result = await transactionsController.createTransaction(body);
  return Response.json(result);
}

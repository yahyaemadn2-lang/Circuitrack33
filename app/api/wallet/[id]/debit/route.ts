import * as walletsController from '@/src/modules/wallet/wallets.controller';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const result = await walletsController.debitWallet(params.id, body);
  return Response.json(result);
}

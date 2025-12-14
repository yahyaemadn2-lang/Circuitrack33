import * as walletsController from '@/src/modules/wallet/wallets.controller';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const result = await walletsController.getWallet(params.id);
  return Response.json(result);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const result = await walletsController.updateWallet(params.id, body);
  return Response.json(result);
}

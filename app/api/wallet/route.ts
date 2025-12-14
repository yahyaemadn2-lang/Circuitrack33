import * as walletsController from '@/src/modules/wallet/wallets.controller';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id');

  const result = await walletsController.listWallets(userId || undefined);
  return Response.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const result = await walletsController.createWallet(body);
  return Response.json(result);
}

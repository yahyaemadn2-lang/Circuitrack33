import * as wishlistController from '@/src/modules/wishlist/wishlist.controller';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id');

  if (!userId) {
    return Response.json({ success: false, error: 'user_id is required' });
  }

  const result = await wishlistController.listWishlistItems(userId);
  return Response.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const result = await wishlistController.createWishlistItem(body);
  return Response.json(result);
}

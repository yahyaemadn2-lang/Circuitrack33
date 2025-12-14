import * as wishlistController from '@/src/modules/wishlist/wishlist.controller';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const result = await wishlistController.getWishlistItem(params.id);
  return Response.json(result);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const result = await wishlistController.updateWishlistItem(params.id, body);
  return Response.json(result);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const result = await wishlistController.deleteWishlistItem(params.id);
  return Response.json(result);
}

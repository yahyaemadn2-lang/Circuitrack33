import * as favoritesController from '@/src/modules/favorites/favorites.controller';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const result = await favoritesController.getFavorite(params.id);
  return Response.json(result);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const result = await favoritesController.updateFavorite(params.id, body);
  return Response.json(result);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const result = await favoritesController.deleteFavorite(params.id);
  return Response.json(result);
}

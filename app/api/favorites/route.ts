import * as favoritesController from '@/src/modules/favorites/favorites.controller';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id');

  if (!userId) {
    return Response.json({ success: false, error: 'user_id is required' });
  }

  const result = await favoritesController.listFavorites(userId);
  return Response.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const result = await favoritesController.createFavorite(body);
  return Response.json(result);
}

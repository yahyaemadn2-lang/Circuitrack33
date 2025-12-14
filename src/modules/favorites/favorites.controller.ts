import { createFavoriteSchema, updateFavoriteSchema } from './favorites.schema';
import * as favoritesService from './favorites.service';

export async function listFavorites(userId: string) {
  try {
    const items = await favoritesService.getFavorites(userId);
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getFavorite(id: string) {
  try {
    const item = await favoritesService.getFavoriteById(id);
    if (!item) {
      return { success: false, error: 'Favorite not found' };
    }
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function createFavorite(body: unknown) {
  try {
    const parsed = createFavoriteSchema.parse(body);
    const item = await favoritesService.addFavorite(parsed);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateFavorite(id: string, body: unknown) {
  try {
    const parsed = updateFavoriteSchema.parse(body);
    const item = await favoritesService.updateFavorite(id, parsed);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteFavorite(id: string) {
  try {
    await favoritesService.deleteFavorite(id);
    return { success: true, message: 'Favorite deleted successfully' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

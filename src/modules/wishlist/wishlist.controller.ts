import { createWishlistItemSchema, updateWishlistItemSchema } from './wishlist.schema';
import * as wishlistService from './wishlist.service';

export async function listWishlistItems(userId: string) {
  try {
    const items = await wishlistService.getWishlist(userId);
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getWishlistItem(id: string) {
  try {
    const item = await wishlistService.getWishlistItemById(id);
    if (!item) {
      return { success: false, error: 'Wishlist item not found' };
    }
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function createWishlistItem(body: unknown) {
  try {
    const parsed = createWishlistItemSchema.parse(body);
    const item = await wishlistService.addWishlistItem(parsed);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateWishlistItem(id: string, body: unknown) {
  try {
    const parsed = updateWishlistItemSchema.parse(body);
    const item = await wishlistService.updateWishlistItem(id, parsed);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteWishlistItem(id: string) {
  try {
    await wishlistService.deleteWishlistItem(id);
    return { success: true, message: 'Wishlist item deleted successfully' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

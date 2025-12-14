import { supabase } from '@/src/lib/supabaseClient';
import { CreateWishlistItemInput, UpdateWishlistItemInput, WishlistItem } from './wishlist.schema';

export async function getWishlist(userId: string) {
  const { data, error } = await supabase
    .from('wishlist')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as WishlistItem[];
}

export async function getWishlistItemById(id: string) {
  const { data, error } = await supabase
    .from('wishlist')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as WishlistItem | null;
}

export async function addWishlistItem(input: CreateWishlistItemInput) {
  const { data, error } = await supabase
    .from('wishlist')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as WishlistItem;
}

export async function updateWishlistItem(id: string, input: UpdateWishlistItemInput) {
  const { data, error } = await supabase
    .from('wishlist')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as WishlistItem;
}

export async function deleteWishlistItem(id: string) {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

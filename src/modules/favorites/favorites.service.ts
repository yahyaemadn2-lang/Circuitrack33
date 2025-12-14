import { supabase } from '@/src/lib/supabaseClient';
import { CreateFavoriteInput, UpdateFavoriteInput, FavoriteItem } from './favorites.schema';

export async function getFavorites(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as FavoriteItem[];
}

export async function getFavoriteById(id: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as FavoriteItem | null;
}

export async function addFavorite(input: CreateFavoriteInput) {
  const { data, error } = await supabase
    .from('favorites')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as FavoriteItem;
}

export async function updateFavorite(id: string, input: UpdateFavoriteInput) {
  const { data, error } = await supabase
    .from('favorites')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as FavoriteItem;
}

export async function deleteFavorite(id: string) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

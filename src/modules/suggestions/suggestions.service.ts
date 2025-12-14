import { supabase } from '@/src/lib/supabaseClient';
import { CreateSuggestionInput, UpdateSuggestionInput, Suggestion } from './suggestions.schema';

export async function getSuggestions() {
  const { data, error } = await supabase
    .from('suggestions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Suggestion[];
}

export async function getSuggestionById(id: string) {
  const { data, error } = await supabase
    .from('suggestions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Suggestion | null;
}

export async function getSuggestionsByUserId(userId: string) {
  const { data, error } = await supabase
    .from('suggestions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Suggestion[];
}

export async function addSuggestion(input: CreateSuggestionInput) {
  const { data, error } = await supabase
    .from('suggestions')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Suggestion;
}

export async function updateSuggestion(id: string, input: UpdateSuggestionInput) {
  const { data, error } = await supabase
    .from('suggestions')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Suggestion;
}

export async function deleteSuggestion(id: string) {
  const { error } = await supabase
    .from('suggestions')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

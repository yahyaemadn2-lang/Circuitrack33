import { supabaseClient } from '../../lib/supabaseClient';

export type UserRole = 'visitor' | 'buyer' | 'company_user' | 'procurement_manager' | 'vendor' | 'admin';

export async function getSession() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    return { session: null, error };
  }

  return { session: data.session, error: null };
}

export async function getCurrentUser() {
  const { data, error } = await supabaseClient.auth.getUser();

  if (error) {
    return { user: null, error };
  }

  return { user: data.user, error: null };
}

export async function getUserRole(): Promise<{ role: UserRole | null; error: any }> {
  const { user, error: userError } = await getCurrentUser();

  if (userError || !user) {
    return { role: null, error: userError };
  }

  const { data, error } = await supabaseClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    return { role: null, error };
  }

  return { role: (data?.role as UserRole) || null, error: null };
}

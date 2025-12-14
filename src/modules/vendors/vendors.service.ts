import { supabase } from '@/src/lib/supabaseClient';
import { CreateVendorInput, UpdateVendorInput, Vendor } from './vendors.schema';

export async function getAllVendors() {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Vendor[];
}

export async function getVendorById(id: string) {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Vendor | null;
}

export async function createVendor(input: CreateVendorInput) {
  const { data, error } = await supabase
    .from('vendors')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Vendor;
}

export async function updateVendor(id: string, input: UpdateVendorInput) {
  const { data, error } = await supabase
    .from('vendors')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Vendor;
}

export async function deleteVendor(id: string) {
  const { error } = await supabase
    .from('vendors')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

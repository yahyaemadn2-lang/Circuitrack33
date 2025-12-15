import { supabase } from '../../lib/supabase';
import {
  SecondaryMarketListing,
  CreateSecondaryMarketListingInput,
  UpdateSecondaryMarketListingInput,
} from './secondaryMarket.schema';

export async function createListing(
  sellerId: string,
  input: CreateSecondaryMarketListingInput
): Promise<SecondaryMarketListing> {
  const { data, error } = await supabase
    .from('secondary_market_listings')
    .insert({
      seller_id: sellerId,
      product_reference: input.product_reference,
      condition: input.condition,
      quantity: input.quantity,
      asking_price: input.asking_price,
      notes: input.notes || '',
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllActiveListings(): Promise<SecondaryMarketListing[]> {
  const { data, error } = await supabase
    .from('secondary_market_listings')
    .select(`
      *,
      seller:users(id, email)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getListingsBySeller(sellerId: string): Promise<SecondaryMarketListing[]> {
  const { data, error } = await supabase
    .from('secondary_market_listings')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getListingById(listingId: string): Promise<SecondaryMarketListing | null> {
  const { data, error } = await supabase
    .from('secondary_market_listings')
    .select(`
      *,
      seller:users(id, email)
    `)
    .eq('id', listingId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateListing(
  listingId: string,
  input: UpdateSecondaryMarketListingInput
): Promise<SecondaryMarketListing> {
  const { data, error } = await supabase
    .from('secondary_market_listings')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markListingAsSold(listingId: string): Promise<SecondaryMarketListing> {
  return updateListing(listingId, { status: 'sold' });
}

export async function cancelListing(listingId: string): Promise<SecondaryMarketListing> {
  return updateListing(listingId, { status: 'cancelled' });
}

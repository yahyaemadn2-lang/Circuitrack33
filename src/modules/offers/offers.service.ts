import { supabase } from '../../lib/supabase';
import { Offer, CreateOfferInput, UpdateOfferInput, CounterOfferInput } from './offers.schema';

export async function createOffer(buyerId: string, input: CreateOfferInput): Promise<Offer> {
  const { data, error } = await supabase
    .from('offers')
    .insert({
      buyer_id: buyerId,
      product_id: input.product_id,
      vendor_id: input.vendor_id,
      offered_price: input.offered_price,
      quantity: input.quantity,
      message: input.message || '',
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOffersByBuyer(buyerId: string): Promise<Offer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      product:products(id, name, price),
      vendor:vendors(id, display_name)
    `)
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getOffersByVendor(vendorId: string): Promise<Offer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      product:products(id, name, price),
      buyer:users(id, email)
    `)
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getOfferById(offerId: string): Promise<Offer | null> {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('id', offerId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateOffer(offerId: string, input: UpdateOfferInput): Promise<Offer> {
  const { data, error } = await supabase
    .from('offers')
    .update(input)
    .eq('id', offerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function acceptOffer(offerId: string, responseMessage?: string): Promise<Offer> {
  return updateOffer(offerId, {
    status: 'accepted',
    response_message: responseMessage,
  });
}

export async function rejectOffer(offerId: string, responseMessage?: string): Promise<Offer> {
  return updateOffer(offerId, {
    status: 'rejected',
    response_message: responseMessage,
  });
}

export async function createCounterOffer(
  vendorId: string,
  input: CounterOfferInput
): Promise<Offer> {
  const originalOffer = await getOfferById(input.parent_offer_id);
  if (!originalOffer) throw new Error('Original offer not found');

  await updateOffer(input.parent_offer_id, {
    status: 'countered',
    response_message: input.response_message,
  });

  const { data, error } = await supabase
    .from('offers')
    .insert({
      buyer_id: originalOffer.buyer_id,
      vendor_id: vendorId,
      product_id: originalOffer.product_id,
      offered_price: input.offered_price,
      quantity: input.quantity,
      message: '',
      response_message: input.response_message,
      parent_offer_id: input.parent_offer_id,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

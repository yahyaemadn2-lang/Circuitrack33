import { supabase } from '../../lib/supabase';
import { Auction, CreateAuctionInput, Bid, CreateBidInput } from './auctions.schema';

export async function createAuction(
  vendorId: string,
  input: CreateAuctionInput
): Promise<Auction> {
  const { data, error } = await supabase
    .from('auctions')
    .insert({
      vendor_id: vendorId,
      product_id: input.product_id,
      start_price: input.start_price,
      min_increment: input.min_increment,
      start_time: input.start_time,
      end_time: input.end_time,
      status: 'scheduled',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAuctionsByVendor(vendorId: string): Promise<Auction[]> {
  const { data, error } = await supabase
    .from('auctions')
    .select(`
      *,
      product:products(id, name, price)
    `)
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAllAuctions(status?: string): Promise<Auction[]> {
  let query = supabase
    .from('auctions')
    .select(`
      *,
      product:products(id, name, price, description),
      vendor:vendors(id, display_name)
    `)
    .order('end_time', { ascending: true });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getAuctionById(auctionId: string): Promise<Auction | null> {
  const { data, error } = await supabase
    .from('auctions')
    .select(`
      *,
      product:products(id, name, price, description),
      vendor:vendors(id, display_name)
    `)
    .eq('id', auctionId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateAuctionStatus(
  auctionId: string,
  status: string,
  winningBidId?: string,
  winningBuyerId?: string
): Promise<Auction> {
  const updateData: any = { status };
  if (winningBidId) updateData.winning_bid_id = winningBidId;
  if (winningBuyerId) updateData.winning_buyer_id = winningBuyerId;

  const { data, error } = await supabase
    .from('auctions')
    .update(updateData)
    .eq('id', auctionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function placeBid(bidderId: string, input: CreateBidInput): Promise<Bid> {
  const auction = await getAuctionById(input.auction_id);
  if (!auction) throw new Error('Auction not found');

  if (auction.status !== 'running' && auction.status !== 'scheduled') {
    throw new Error('Auction is not active');
  }

  const highestBid = await getHighestBid(input.auction_id);
  const minBidAmount = highestBid
    ? highestBid.amount + auction.min_increment
    : auction.start_price;

  if (input.amount < minBidAmount) {
    throw new Error(
      `Bid amount must be at least ${minBidAmount.toFixed(2)} EGP`
    );
  }

  const { data, error } = await supabase
    .from('bids')
    .insert({
      auction_id: input.auction_id,
      bidder_id: bidderId,
      amount: input.amount,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBidsByAuction(auctionId: string): Promise<Bid[]> {
  const { data, error } = await supabase
    .from('bids')
    .select(`
      *,
      bidder:users(id, email)
    `)
    .eq('auction_id', auctionId)
    .order('amount', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getHighestBid(auctionId: string): Promise<Bid | null> {
  const { data, error } = await supabase
    .from('bids')
    .select('*')
    .eq('auction_id', auctionId)
    .order('amount', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getBidsByBidder(bidderId: string): Promise<Bid[]> {
  const { data, error } = await supabase
    .from('bids')
    .select(`
      *,
      auction:auctions(
        id,
        status,
        end_time,
        product:products(id, name)
      )
    `)
    .eq('bidder_id', bidderId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function checkAndUpdateAuctionStatus(auctionId: string): Promise<Auction> {
  const auction = await getAuctionById(auctionId);
  if (!auction) throw new Error('Auction not found');

  const now = new Date();
  const startTime = new Date(auction.start_time);
  const endTime = new Date(auction.end_time);

  if (auction.status === 'scheduled' && now >= startTime) {
    return await updateAuctionStatus(auctionId, 'running');
  }

  if ((auction.status === 'running' || auction.status === 'scheduled') && now >= endTime) {
    const highestBid = await getHighestBid(auctionId);
    if (highestBid) {
      return await updateAuctionStatus(
        auctionId,
        'ended',
        highestBid.id,
        highestBid.bidder_id
      );
    } else {
      return await updateAuctionStatus(auctionId, 'ended');
    }
  }

  return auction;
}

import { z } from 'zod';

export const AuctionSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  start_price: z.number().positive(),
  min_increment: z.number().positive(),
  start_time: z.string(),
  end_time: z.string(),
  status: z.enum(['scheduled', 'running', 'ended', 'cancelled']).default('scheduled'),
  winning_bid_id: z.string().uuid().nullable().optional(),
  winning_buyer_id: z.string().uuid().nullable().optional(),
  created_at: z.string(),
});

export const CreateAuctionSchema = z.object({
  product_id: z.string().uuid(),
  start_price: z.number().positive(),
  min_increment: z.number().positive(),
  start_time: z.string(),
  end_time: z.string(),
});

export const BidSchema = z.object({
  id: z.string().uuid(),
  auction_id: z.string().uuid(),
  bidder_id: z.string().uuid(),
  amount: z.number().positive(),
  created_at: z.string(),
});

export const CreateBidSchema = z.object({
  auction_id: z.string().uuid(),
  amount: z.number().positive(),
});

export type Auction = z.infer<typeof AuctionSchema>;
export type CreateAuctionInput = z.infer<typeof CreateAuctionSchema>;
export type Bid = z.infer<typeof BidSchema>;
export type CreateBidInput = z.infer<typeof CreateBidSchema>;

export interface User {
  id: string;
  email: string;
  password_hash: string;
  phone: string | null;
  role: 'visitor' | 'buyer' | 'company_user' | 'procurement_manager' | 'vendor' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  tax_id: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  created_at: string;
}

export interface CompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  role: 'owner' | 'procurement_manager' | 'buyer' | 'viewer';
  created_at: string;
}

export interface Vendor {
  id: string;
  user_id: string;
  display_name: string;
  commission_rate: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  model: string;
  condition: 'NEW' | 'USED';
  base_price: number;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  main_balance: number;
  cashback_balance: number;
  penalty_balance: number;
  created_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: 'deposit' | 'withdrawal' | 'order_payment' | 'cashback_earn' | 'cashback_spend' | 'penalty' | 'refund';
  amount: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  company_id: string | null;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  subtotal: number;
  currency: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface Offer {
  id: string;
  buyer_id: string;
  product_id: string;
  offered_price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'obligation_breached';
  created_at: string;
}

export interface Auction {
  id: string;
  product_id: string;
  start_price: number;
  min_increment: number;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'running' | 'finished' | 'cancelled';
  created_at: string;
}

export interface Bid {
  id: string;
  auction_id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface CompareItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Suggestion {
  id: string;
  user_id: string | null;
  title: string;
  body: string;
  category: string;
  status: 'new' | 'under_review' | 'accepted' | 'rejected' | 'implemented';
  created_at: string;
}

export interface CrmEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

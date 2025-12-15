import { supabase } from '../../lib/supabaseClient';
import {
  CreateOrderInput,
  UpdateOrderInput,
  Order,
  OrderWithItems,
  CreateOrderItemInput,
  OrderItem,
} from './orders.schema';
import { debitWallet, getWalletByUserId } from '../wallet/wallet.service';

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Order[];
}

export async function getOrdersByUserId(userId: string): Promise<OrderWithItems[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      items:order_items(
        *,
        product:products(id, name, slug, price)
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as any[];
}

export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      items:order_items(
        *,
        product:products(id, name, slug, price)
      )
    `
    )
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as OrderWithItems | null;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Order;
}

export async function createOrderItems(
  items: CreateOrderItemInput[]
): Promise<OrderItem[]> {
  const { data, error } = await supabase
    .from('order_items')
    .insert(items)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data as OrderItem[];
}

export async function updateOrder(id: string, input: UpdateOrderInput): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Order;
}

export async function deleteOrder(id: string): Promise<{ success: boolean }> {
  const { error } = await supabase.from('orders').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export interface PlaceOrderInput {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  companyId?: string;
}

export interface PlaceOrderResult {
  order: Order;
  orderItems: OrderItem[];
  walletTransactionId: string;
}

export async function placeOrder(
  input: PlaceOrderInput
): Promise<PlaceOrderResult> {
  const wallet = await getWalletByUserId(input.userId);

  if (!wallet) {
    throw new Error('Wallet not found. Please contact support.');
  }

  if (wallet.main_balance < input.subtotal) {
    throw new Error(
      `Insufficient wallet balance. Your balance: EGP ${wallet.main_balance.toFixed(2)}, Order total: EGP ${input.subtotal.toFixed(2)}`
    );
  }

  const order = await createOrder({
    user_id: input.userId,
    company_id: input.companyId,
    status: 'pending',
    subtotal: input.subtotal,
    currency: 'EGP',
  });

  const orderItems = await createOrderItems(
    input.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }))
  );

  const { transaction } = await debitWallet(
    wallet.id,
    input.subtotal,
    order.id,
    'order'
  );

  return {
    order,
    orderItems,
    walletTransactionId: transaction.id,
  };
}

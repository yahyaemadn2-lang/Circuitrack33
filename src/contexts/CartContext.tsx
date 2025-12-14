import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    name: string;
    brand: string;
    model: string;
    base_price: number;
    condition: string;
    vendor_id: string;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [user]);

  const refreshCart = async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products (
            id,
            name,
            brand,
            model,
            base_price,
            condition,
            vendor_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setItems((data as any) || []);
    } catch (error) {
      console.error('Error loading cart:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId: string, quantity: number = 1) => {
    if (!user) {
      throw new Error('User must be logged in to add items to cart');
    }

    try {
      const existingItem = items.find((item) => item.product_id === productId);

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        const { error } = await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: productId,
          quantity,
        });

        if (error) throw error;
        await refreshCart();
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeItem = async (cartItemId: string) => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) throw error;

      setItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId));
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    if (quantity < 1) {
      await removeItem(cartItemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) throw error;

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item
        )
      );
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setItems([]);
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce(
    (total, item) => total + Number(item.product.base_price) * item.quantity,
    0
  );

  const value = {
    items,
    loading,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  condition: string;
  vendor_id: string;
}

interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product: CartProduct;
}

interface LocalCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  vendorId: string;
  slug: string;
}

interface CartContextType {
  items: CartItem[];
  localItems: LocalCartItem[];
  loading: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (product: CartProduct, quantity?: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'circuitrack_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [localItems, setLocalItems] = useState<LocalCartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      refreshCart();
      migrateLocalCartToServer();
    } else {
      setItems([]);
      loadLocalCart();
      setLoading(false);
    }
  }, [user]);

  const loadLocalCart = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setLocalItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading local cart:', error);
      setLocalItems([]);
    }
  };

  const saveLocalCart = (items: LocalCartItem[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      setLocalItems(items);
    } catch (error) {
      console.error('Error saving local cart:', error);
    }
  };

  const migrateLocalCartToServer = async () => {
    if (!user) return;

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) return;

      const localItems: LocalCartItem[] = JSON.parse(stored);
      if (localItems.length === 0) return;

      for (const item of localItems) {
        await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: item.productId,
          quantity: item.quantity,
        });
      }

      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setLocalItems([]);
      await refreshCart();
    } catch (error) {
      console.error('Error migrating cart:', error);
    }
  };

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
        .select(
          `
          *,
          product:products (
            id,
            name,
            slug,
            price,
            condition,
            vendor_id
          )
        `
        )
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

  const addItem = async (product: CartProduct, quantity: number = 1) => {
    if (!user) {
      const existing = localItems.find((item) => item.productId === product.id);

      if (existing) {
        const updated = localItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        saveLocalCart(updated);
      } else {
        const newItem: LocalCartItem = {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          vendorId: product.vendor_id,
          slug: product.slug,
        };
        saveLocalCart([...localItems, newItem]);
      }
      return;
    }

    try {
      const existingItem = items.find((item) => item.product_id === product.id);

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        const { error } = await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: product.id,
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
      const updated = localItems.filter((item) => item.productId !== cartItemId);
      saveLocalCart(updated);
      return;
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
      if (quantity < 1) {
        const updated = localItems.filter((item) => item.productId !== cartItemId);
        saveLocalCart(updated);
      } else {
        const updated = localItems.map((item) =>
          item.productId === cartItemId ? { ...item, quantity } : item
        );
        saveLocalCart(updated);
      }
      return;
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
        prevItems.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
      );
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) {
      saveLocalCart([]);
      return;
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

  const itemCount = user
    ? items.reduce((total, item) => total + item.quantity, 0)
    : localItems.reduce((total, item) => total + item.quantity, 0);

  const subtotal = user
    ? items.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0)
    : localItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const value = {
    items,
    localItems,
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

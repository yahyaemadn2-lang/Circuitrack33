import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

export default function Cart() {
  const { items, loading, itemCount, subtotal, removeItem, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const TAX_RATE = 0.14;
  const SHIPPING_FEE = 50;

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + (items.length > 0 ? SHIPPING_FEE : 0);

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch (error: any) {
      alert(error.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }

    try {
      await removeItem(cartItemId);
    } catch (error: any) {
      alert(error.message || 'Failed to remove item');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      return;
    }

    navigate('/checkout');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your cart and checkout.</p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="mt-2 text-gray-600">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col sm:flex-row"
              >
                <div className="w-full sm:w-48 h-48 bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>

                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <Link
                        to={`/products/${item.product_id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.product.brand} {item.product.model}
                      </p>
                      <span
                        className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                          item.product.condition === 'NEW'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {item.product.condition}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-lg font-medium w-12 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {Number(item.product.base_price).toFixed(2)} EGP each
                      </div>
                      <div className="text-xl font-bold text-blue-600">
                        {(Number(item.product.base_price) * item.quantity).toFixed(2)} EGP
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>{subtotal.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (14%)</span>
                  <span>{tax.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{SHIPPING_FEE.toFixed(2)} EGP</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {total.toFixed(2)} EGP
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>

              <Link
                to="/products"
                className="block text-center mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Continue Shopping
              </Link>

              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <ShoppingCart className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Free Returns</p>
                    <p>Within 30 days of purchase</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Secure Payment</p>
                    <p>SSL encrypted transactions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

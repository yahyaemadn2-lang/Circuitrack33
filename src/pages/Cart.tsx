import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, localItems, loading, subtotal, removeItem, updateQuantity } = useCart();

  const displayItems = user ? items : localItems;
  const hasItems = displayItems.length > 0;

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-6">
                    <div className="h-24 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg p-6">
                  <div className="h-32 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {!hasItems ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-600 mb-6">
                  Add products to your cart to see them here.
                </p>
                <button
                  onClick={() => navigate('/products')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Products
                </button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">EGP 0.00</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>EGP 0.00</span>
                  </div>
                </div>
                <button
                  disabled
                  className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {user
                ? items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg shadow-sm p-6 flex gap-6"
                    >
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-4xl">📦</span>
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <Link
                            to={`/products/${item.product.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-600 transition-colors"
                            title="Remove from cart"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 capitalize">
                          Condition: {item.product.condition}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity - 1)
                              }
                              className="px-3 py-2 hover:bg-gray-50 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                              className="px-3 py-2 hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              EGP {item.product.price.toLocaleString()} each
                            </p>
                            <p className="text-xl font-bold text-gray-900">
                              EGP{' '}
                              {(item.product.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                : localItems.map((item) => (
                    <div
                      key={item.productId}
                      className="bg-white rounded-lg shadow-sm p-6 flex gap-6"
                    >
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-4xl">📦</span>
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <Link
                            to={`/products/${item.productId}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className="text-red-500 hover:text-red-600 transition-colors"
                            title="Remove from cart"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.productId, item.quantity - 1)
                              }
                              className="px-3 py-2 hover:bg-gray-50 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.productId, item.quantity + 1)
                              }
                              className="px-3 py-2 hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              EGP {item.price.toLocaleString()} each
                            </p>
                            <p className="text-xl font-bold text-gray-900">
                              EGP {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">EGP {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (Included)</span>
                    <span className="font-medium">EGP 0.00</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>EGP {subtotal.toLocaleString()}</span>
                  </div>
                </div>

                {!user && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Please sign in to proceed with checkout
                    </p>
                  </div>
                )}

                <button
                  onClick={() => (user ? navigate('/checkout') : navigate('/login'))}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {user ? 'Proceed to Checkout' : 'Sign In to Continue'}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Secure checkout powered by CircuitRack
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

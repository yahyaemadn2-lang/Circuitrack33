import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Wallet, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { getWalletByUserId } from '../modules/wallet/wallet.service';
import { placeOrder } from '../modules/orders/orders.service';
import { Wallet as WalletType } from '../modules/wallet/wallet.schema';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, isBuyer } = useAuth();
  const { items, subtotal, clearCart } = useCart();

  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    country: 'Egypt',
    contactPerson: '',
    contactEmail: user?.email || '',
    contactPhone: '',
    termsAccepted: false,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!isBuyer) {
      navigate('/products');
      return;
    }

    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    loadWallet();
  }, [user, isBuyer, items, navigate]);

  const loadWallet = async () => {
    if (!user) return;

    setLoadingWallet(true);
    try {
      const walletData = await getWalletByUserId(user.id);
      setWallet(walletData);
    } catch (err: any) {
      console.error('Error loading wallet:', err);
      setError('Failed to load wallet information');
    } finally {
      setLoadingWallet(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !wallet) {
      setError('User or wallet information is missing');
      return;
    }

    if (!formData.termsAccepted) {
      setError('Please accept the terms and conditions to proceed');
      return;
    }

    if (wallet.main_balance < subtotal) {
      setError(
        `Insufficient wallet balance. Your balance: EGP ${wallet.main_balance.toFixed(2)}, Order total: EGP ${subtotal.toFixed(2)}`
      );
      return;
    }

    setPlacingOrder(true);
    setError(null);

    try {
      const result = await placeOrder({
        userId: user.id,
        items: items.map((item) => ({
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
        subtotal,
      });

      await clearCart();

      navigate(`/dashboard/buyer/orders/${result.order.id}`, {
        state: { orderPlaced: true },
      });
    } catch (err: any) {
      console.error('Error placing order:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const canCheckout =
    wallet &&
    wallet.main_balance >= subtotal &&
    formData.companyName &&
    formData.address &&
    formData.contactPerson &&
    formData.contactEmail &&
    formData.contactPhone &&
    formData.termsAccepted;

  if (loadingWallet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg p-6">
                  <div className="h-64 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg p-6">
                  <div className="h-48 bg-gray-200 rounded" />
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
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {wallet && wallet.main_balance < subtotal && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium mb-1">Insufficient Wallet Balance</p>
                <p className="text-yellow-700 text-sm mb-3">
                  Your current balance is EGP {wallet.main_balance.toFixed(2)}, but this order
                  requires EGP {subtotal.toFixed(2)}. Please top up your wallet to proceed.
                </p>
                <button
                  onClick={() => navigate('/dashboard/buyer/wallet')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                >
                  Top Up Wallet
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        EGP {(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Company & Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I confirm that this order is for B2B electronic components use and agree to
                  CircuitRack purchasing terms and conditions. <span className="text-red-500">*</span>
                </span>
              </label>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8 space-y-6">
              {wallet && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Wallet Balance</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    EGP {wallet.main_balance.toLocaleString()}
                  </p>
                  {wallet.main_balance >= subtotal && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Sufficient balance
                    </p>
                  )}
                </div>
              )}

              <div>
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

                <button
                  type="submit"
                  disabled={!canCheckout || placingOrder}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {placingOrder ? 'Processing...' : 'Place Order'}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Secure checkout powered by CircuitRack
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}

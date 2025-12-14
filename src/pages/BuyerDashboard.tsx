import { useAuth } from '../contexts/AuthContext';
import { ShoppingBag, Heart, Package, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BuyerDashboard() {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user?.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">0</span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Orders</h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">0</span>
            </div>
            <h3 className="text-gray-600 font-medium">Active Orders</h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8 text-red-600" />
              <span className="text-2xl font-bold text-gray-900">0</span>
            </div>
            <h3 className="text-gray-600 font-medium">Wishlist Items</h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">0.00</span>
            </div>
            <h3 className="text-gray-600 font-medium">Wallet Balance</h3>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No orders yet</p>
              <Link
                to="/products"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/products"
                className="block w-full p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Browse Products</span>
                </div>
              </Link>
              <Link
                to="/cart"
                className="block w-full p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">View Cart</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

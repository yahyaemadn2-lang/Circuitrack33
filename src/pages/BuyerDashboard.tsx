import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getOrdersByUserId } from '../modules/orders/orders.service';
import { getWalletByUserId } from '../modules/wallet/wallet.service';
import { OrderWithItems } from '../modules/orders/orders.schema';
import { Wallet as WalletType } from '../modules/wallet/wallet.schema';
import { supabase } from '../lib/supabaseClient';
import {
  ShoppingBag,
  Heart,
  Package,
  Wallet,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Favorite {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    brand: string;
    model: string;
    base_price: number;
    condition: string;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function BuyerDashboard() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'notifications'>('overview');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const [ordersData, walletData, favoritesData, notificationsData] = await Promise.all([
        getOrdersByUserId(user.id),
        getWalletByUserId(user.id),
        supabase
          .from('favorites')
          .select(`
            *,
            product:products (
              id,
              name,
              brand,
              model,
              base_price,
              condition
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setOrders(ordersData || []);
      setWallet(walletData);
      if (favoritesData.data) setFavorites(favoritesData.data as any);
      if (notificationsData.data) setNotifications(notificationsData.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    if (!confirm('Remove this item from your wishlist?')) return;

    try {
      await supabase.from('favorites').delete().eq('id', favoriteId);
      setFavorites(favorites.filter((f) => f.id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove item from wishlist');
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'confirmed' || o.status === 'shipped'
  ).length;

  const totalSpent = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, order) => sum + Number(order.subtotal || 0), 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {profile?.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{orders.length}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Orders</h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-gray-900">{activeOrdersCount}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Open Orders</h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {totalSpent.toFixed(2)}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Spent (EGP)</h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                {wallet?.main_balance?.toFixed(2) || '0.00'}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Wallet Balance (EGP)</h3>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'orders'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Orders ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'wishlist'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Wishlist ({favorites.length})
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors relative ${
                  activeTab === 'notifications'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Notifications
                {notifications.filter((n) => !n.is_read).length > 0 && (
                  <span className="absolute top-3 right-2 w-2 h-2 bg-red-600 rounded-full"></span>
                )}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
                  {orders.length === 0 ? (
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
                  ) : (
                    <>
                      <div className="space-y-3">
                        {orders.slice(0, 5).map((order) => (
                        <Link
                          key={order.id}
                          to={`/dashboard/buyer/orders/${order.id}`}
                          className="block border border-gray-200 rounded-lg p-4 hover:border-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(order.status)}
                              <span className="font-medium text-gray-900">
                                Order #{order.id.slice(0, 8)}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {order.items?.length || 0} item(s) - {order.currency}{' '}
                            {order.subtotal.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </Link>
                        ))}
                      </div>
                      {orders.length > 5 && (
                        <button
                          onClick={() => setActiveTab('orders')}
                          className="mt-3 w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          View All Orders ({orders.length})
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div>
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
                    <Link
                      to="/dashboard/buyer/wallet"
                      className="block w-full p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">My Wallet</span>
                      </div>
                    </Link>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="block w-full p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">
                          View All Orders
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('wishlist')}
                      className="block w-full p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">
                          Wishlist ({favorites.length})
                        </span>
                      </div>
                    </button>
                  </div>

                  {wallet && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
                      <h3 className="font-bold mb-3">Wallet</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="opacity-90">Main Balance:</span>
                          <span className="font-bold">{wallet.main_balance.toFixed(2)} EGP</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-90">Cashback:</span>
                          <span className="font-bold">{wallet.cashback_balance.toFixed(2)} EGP</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">All Orders</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No orders yet</p>
                    <Link
                      to="/products"
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Link
                        key={order.id}
                        to={`/dashboard/buyer/orders/${order.id}`}
                        className="block border border-gray-200 rounded-lg p-6 hover:border-blue-600 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusIcon(order.status)}
                              <h3 className="font-bold text-gray-900">
                                Order #{order.id.slice(0, 8)}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-600">
                              Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
                              {new Date(order.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-medium text-gray-900 mb-3">
                            {order.items?.length || 0} item(s)
                          </h4>

                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900">Total:</span>
                            <span className="text-xl font-bold text-blue-600">
                              {order.currency} {order.subtotal.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Wishlist</h2>
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Your wishlist is empty</p>
                    <Link
                      to="/products"
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map((favorite) => (
                      <div
                        key={favorite.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1">
                              {favorite.product.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {favorite.product.brand} {favorite.product.model}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              favorite.product.condition === 'NEW'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {favorite.product.condition}
                          </span>
                        </div>

                        <p className="text-xl font-bold text-blue-600 mb-4">
                          {Number(favorite.product.base_price).toFixed(2)} EGP
                        </p>

                        <div className="flex gap-2">
                          <Link
                            to={`/products/${favorite.product_id}`}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Link>
                          <button
                            onClick={() => handleRemoveFavorite(favorite.id)}
                            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Notifications</h2>
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          notification.is_read
                            ? 'bg-white border-gray-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                        onClick={() => !notification.is_read && handleMarkNotificationRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Bell
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                              notification.is_read ? 'text-gray-400' : 'text-blue-600'
                            }`}
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

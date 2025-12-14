import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  phone: string;
}

interface Vendor {
  id: string;
  user_id: string;
  display_name: string;
  status: string;
  commission_rate: number;
  created_at: string;
  user: {
    email: string;
  };
}

interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  base_price: number;
  condition: string;
  created_at: string;
  vendor: {
    display_name: string;
  };
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingVendors: number;
  activeVendors: number;
  activeBuyers: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingVendors: 0,
    activeVendors: 0,
    activeBuyers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'vendors' | 'products'
  >('overview');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [usersData, vendorsData, productsData, ordersData] = await Promise.all([
        supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('vendors')
          .select(`
            *,
            user:users (
              email
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('products')
          .select(`
            *,
            vendor:vendors (
              display_name
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('orders')
          .select('id, total_amount, status, created_at')
          .order('created_at', { ascending: false }),
      ]);

      if (usersData.data) setUsers(usersData.data);
      if (vendorsData.data) setVendors(vendorsData.data as any);
      if (productsData.data) setProducts(productsData.data as any);
      if (ordersData.data) setOrders(ordersData.data);

      const totalRevenue = ordersData.data?.reduce(
        (sum, order) => sum + Number(order.total_amount),
        0
      ) || 0;

      const pendingVendors = vendorsData.data?.filter(
        (v) => v.status === 'pending'
      ).length || 0;

      const activeVendors = vendorsData.data?.filter(
        (v) => v.status === 'active'
      ).length || 0;

      const activeBuyers = usersData.data?.filter(
        (u) => u.role === 'buyer'
      ).length || 0;

      setStats({
        totalUsers: usersData.data?.length || 0,
        totalVendors: vendorsData.data?.length || 0,
        totalProducts: productsData.data?.length || 0,
        totalOrders: ordersData.data?.length || 0,
        totalRevenue,
        pendingVendors,
        activeVendors,
        activeBuyers,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVendor = async (vendorId: string) => {
    if (!confirm('Approve this vendor?')) return;

    try {
      const { error } = await supabase
        .from('vendors')
        .update({ status: 'active' })
        .eq('id', vendorId);

      if (error) throw error;

      setVendors(
        vendors.map((v) =>
          v.id === vendorId ? { ...v, status: 'active' } : v
        )
      );

      alert('Vendor approved successfully');
    } catch (error: any) {
      console.error('Error approving vendor:', error);
      alert(error.message || 'Failed to approve vendor');
    }
  };

  const handleRejectVendor = async (vendorId: string) => {
    if (!confirm('Reject this vendor? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('vendors')
        .update({ status: 'rejected' })
        .eq('id', vendorId);

      if (error) throw error;

      setVendors(
        vendors.map((v) =>
          v.id === vendorId ? { ...v, status: 'rejected' } : v
        )
      );

      alert('Vendor rejected');
    } catch (error: any) {
      console.error('Error rejecting vendor:', error);
      alert(error.message || 'Failed to reject vendor');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Delete this product? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.filter((p) => p.id !== productId));
      alert('Product deleted successfully');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert(error.message || 'Failed to delete product');
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

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Platform Management & Overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                {stats.totalUsers}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Users</h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {stats.totalProducts}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Products</h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-gray-900">
                {stats.totalOrders}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Orders</h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                {stats.totalRevenue.toFixed(2)}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Revenue (EGP)</h3>
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
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'users'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Users ({stats.totalUsers})
              </button>
              <button
                onClick={() => setActiveTab('vendors')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors relative ${
                  activeTab === 'vendors'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Vendors ({stats.totalVendors})
                {stats.pendingVendors > 0 && (
                  <span className="absolute top-2 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'products'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Products ({stats.totalProducts})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">Platform Overview</h2>
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Active Vendors</span>
                        <span className="font-bold text-gray-900">{stats.activeVendors}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Active Buyers</span>
                        <span className="font-bold text-gray-900">{stats.activeBuyers}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                        <span className="text-gray-600">Pending Approvals</span>
                        <span className="font-bold text-yellow-700">
                          {stats.pendingVendors}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Recent Users
                    </h2>
                    <div className="space-y-2">
                      {users.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{user.email}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {user.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">
                        Pending Vendor Approvals
                      </h2>
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                    </div>
                    {vendors.filter((v) => v.status === 'pending').length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <p className="text-gray-600">No pending approvals</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {vendors
                          .filter((v) => v.status === 'pending')
                          .slice(0, 5)
                          .map((vendor) => (
                            <div
                              key={vendor.id}
                              className="border border-yellow-200 bg-yellow-50 rounded-lg p-4"
                            >
                              <div className="mb-3">
                                <p className="font-medium text-gray-900">
                                  {vendor.display_name}
                                </p>
                                <p className="text-sm text-gray-600">{vendor.user.email}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Applied: {new Date(vendor.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproveVendor(vendor.id)}
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectVendor(vendor.id)}
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Products</h2>
                    <div className="space-y-2">
                      {products.slice(0, 5).map((product) => (
                        <div
                          key={product.id}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600">
                              {product.brand} - {product.vendor.display_name}
                            </p>
                          </div>
                          <p className="font-bold text-blue-600">
                            {product.base_price.toFixed(2)} EGP
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">All Users</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {user.phone || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'vendors' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">All Vendors</h2>
                <div className="space-y-4">
                  {vendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      className={`border rounded-lg p-6 ${
                        vendor.status === 'pending'
                          ? 'border-yellow-200 bg-yellow-50'
                          : vendor.status === 'active'
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1">
                            {vendor.display_name}
                          </h3>
                          <p className="text-sm text-gray-600">{vendor.user.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Joined: {new Date(vendor.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            vendor.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : vendor.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {vendor.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                        <span>Commission: {(vendor.commission_rate * 100).toFixed(1)}%</span>
                      </div>

                      {vendor.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveVendor(vendor.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectVendor(vendor.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">All Products</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                          <p className="text-sm text-gray-600">
                            {product.brand} {product.model}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            by {product.vendor.display_name}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            product.condition === 'NEW'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {product.condition}
                        </span>
                      </div>

                      <p className="text-xl font-bold text-blue-600 mb-4">
                        {product.base_price.toFixed(2)} EGP
                      </p>

                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                      >
                        <Ban className="w-4 h-4" />
                        Remove Product
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

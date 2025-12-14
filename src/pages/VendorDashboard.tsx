import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import {
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  description: string;
  base_price: number;
  condition: string;
  category_id: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  order: {
    id: string;
    status: string;
    created_at: string;
    user_id: string;
  };
  product: {
    name: string;
    brand: string;
  };
}

interface VendorData {
  id: string;
  status: string;
}

export default function VendorDashboard() {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    model: '',
    description: '',
    base_price: '',
    condition: 'NEW',
    category_id: '',
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      if (data) setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const { data: vendor } = await supabase
        .from('vendors')
        .select('id, status')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!vendor) {
        setLoading(false);
        return;
      }

      setVendorData(vendor);

      const [productsData, ordersData] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('vendor_id', vendor.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('order_items')
          .select(`
            *,
            order:orders (
              id,
              status,
              created_at,
              user_id
            ),
            product:products (
              name,
              brand
            )
          `)
          .eq('vendor_id', vendor.id)
          .order('created_at', { ascending: false }),
      ]);

      if (productsData.data) setProducts(productsData.data);
      if (ordersData.data) setOrders(ordersData.data as any);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      brand: '',
      model: '',
      description: '',
      base_price: '',
      condition: 'NEW',
      category_id: categories[0]?.id || '',
    });
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      brand: product.brand,
      model: product.model,
      description: product.description,
      base_price: product.base_price.toString(),
      condition: product.condition,
      category_id: product.category_id,
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendorData) {
      alert('Vendor data not found');
      return;
    }

    try {
      const productData = {
        ...productForm,
        base_price: parseFloat(productForm.base_price),
        vendor_id: vendorData.id,
        slug: `${productForm.brand}-${productForm.model}-${Date.now()}`
          .toLowerCase()
          .replace(/\s+/g, '-'),
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw error;
      }

      setShowProductModal(false);
      loadDashboardData();
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(error.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.filter((p) => p.id !== productId));
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

  if (!vendorData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Account Not Found</h2>
          <p className="text-gray-600">
            Your vendor account is being set up. Please contact support if this persists.
          </p>
        </div>
      </div>
    );
  }

  if (vendorData.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Package className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Pending Approval</h2>
          <p className="text-gray-600">
            Your vendor account is pending approval. You will be notified once it's approved.
          </p>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_price), 0);
  const pendingOrders = orders.filter((o) => o.order.status === 'pending' || o.order.status === 'paid');

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {profile?.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{products.length}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Products</h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{orders.length}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Sales</h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-gray-900">{totalRevenue.toFixed(2)}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Revenue (EGP)</h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">{pendingOrders.length}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Pending Orders</h3>
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
                onClick={() => setActiveTab('products')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'products'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Products ({products.length})
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
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-900">
                                {order.product.brand} {order.product.name}
                              </p>
                              <p className="text-sm text-gray-600">Qty: {order.quantity}</p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                order.order.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : order.order.status === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {order.order.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                              {new Date(order.order.created_at).toLocaleDateString()}
                            </p>
                            <p className="font-bold text-blue-600">
                              {order.total_price.toFixed(2)} EGP
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Top Products</h2>
                  {products.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">No products listed</p>
                      <button
                        onClick={handleAddProduct}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Product
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {products.slice(0, 5).map((product) => (
                        <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-600">
                                {product.brand} {product.model}
                              </p>
                            </div>
                            <p className="font-bold text-blue-600">
                              {product.base_price.toFixed(2)} EGP
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Your Products</h2>
                  <button
                    onClick={handleAddProduct}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Product
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No products yet</p>
                    <button
                      onClick={handleAddProduct}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Your First Product
                    </button>
                  </div>
                ) : (
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

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        <p className="text-xl font-bold text-blue-600 mb-4">
                          {product.base_price.toFixed(2)} EGP
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">All Orders</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-gray-900 mb-1">
                              Order #{order.order_id.slice(0, 8)}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {order.product.brand} {order.product.name}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              order.order.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : order.order.status === 'shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : order.order.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {order.order.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Quantity</p>
                            <p className="font-medium text-gray-900">{order.quantity}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Unit Price</p>
                            <p className="font-medium text-gray-900">
                              {order.unit_price.toFixed(2)} EGP
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="font-bold text-blue-600">
                              {order.total_price.toFixed(2)} EGP
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-500">
                          Ordered on {new Date(order.order.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={productForm.name}
                    onChange={handleProductFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={productForm.brand}
                    onChange={handleProductFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model *
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={productForm.model}
                    onChange={handleProductFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (EGP) *
                  </label>
                  <input
                    type="number"
                    name="base_price"
                    value={productForm.base_price}
                    onChange={handleProductFormChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition *
                  </label>
                  <select
                    name="condition"
                    value={productForm.condition}
                    onChange={handleProductFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="NEW">New</option>
                    <option value="USED">Used</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category_id"
                    value={productForm.category_id}
                    onChange={handleProductFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductFormChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

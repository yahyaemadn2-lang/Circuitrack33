import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Package, ArrowLeft, CheckCircle, Clock, Truck, XCircle, Gift } from 'lucide-react';
import { getOrderById } from '../modules/orders/orders.service';
import { OrderWithItems } from '../modules/orders/orders.schema';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isBuyer } = useAuth();

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderPlaced = location.state?.orderPlaced;
  const cashbackAmount = location.state?.cashbackAmount;

  useEffect(() => {
    if (!user || !isBuyer) {
      navigate('/login');
      return;
    }

    if (id) {
      loadOrder();
    }
  }, [id, user, isBuyer]);

  const loadOrder = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getOrderById(id);

      if (!data) {
        setError('Order not found');
        return;
      }

      if (data.user_id !== user?.id) {
        setError('Unauthorized access to this order');
        return;
      }

      setOrder(data);
    } catch (err: any) {
      console.error('Error loading order:', err);
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="bg-white rounded-lg p-6">
            <div className="h-32 bg-gray-200 rounded" />
          </div>
          <div className="bg-white rounded-lg p-6">
            <div className="h-48 bg-gray-200 rounded" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !order) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="inline-block p-4 bg-red-50 rounded-lg mb-4">
            <p className="text-red-700 font-medium">{error || 'Order not found'}</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/buyer')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard/buyer')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        {orderPlaced && (
          <div className="space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Order placed successfully!</p>
                <p className="text-sm text-green-700 mt-1">
                  Your order has been received and is being processed. You will receive updates on
                  your order status.
                </p>
              </div>
            </div>
            {cashbackAmount && cashbackAmount > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                <Gift className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Cashback Earned!</p>
                  <p className="text-sm text-blue-700 mt-1">
                    You've earned EGP {cashbackAmount.toFixed(2)} cashback on this order. The
                    cashback has been added to your wallet.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Order #{order.id.slice(0, 8)}
              </h1>
              <p className="text-gray-600">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="font-medium capitalize">{order.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-200 pt-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Order Total</h3>
              <p className="text-2xl font-bold text-gray-900">
                {order.currency} {order.subtotal.toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Method</h3>
              <p className="text-lg text-gray-900">Wallet</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Order ID</h3>
              <p className="text-sm text-gray-700 font-mono">{order.id}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl">📦</span>
                  </div>
                  <div className="flex-1">
                    {item.product ? (
                      <Link
                        to={`/products/${item.product.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {item.product.name}
                      </Link>
                    ) : (
                      <p className="font-semibold text-gray-900">Product ID: {item.product_id}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      Quantity: {item.quantity} × EGP {item.unit_price.toLocaleString()}
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      EGP {(item.quantity * item.unit_price).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No items found for this order</p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between text-gray-600 mb-2">
              <span>Subtotal</span>
              <span className="font-medium">
                {order.currency} {order.subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 mb-2">
              <span>Tax</span>
              <span className="font-medium">Included</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>
                {order.currency} {order.subtotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-700 mb-3">
            If you have any questions about your order, please contact our support team.
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Contact Support
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

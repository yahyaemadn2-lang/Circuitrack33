import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingBag, Package, Users, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user, profile } = useAuth();

  const getDashboardPath = () => {
    if (!profile) return '/login';
    if (profile.role === 'admin') return '/dashboard/admin';
    if (profile.role === 'vendor') return '/dashboard/vendor';
    return '/dashboard/buyer';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to CircuitRack
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your premier B2B marketplace for electronic components and circuit boards
          </p>
        </div>

        {user && profile ? (
          <div className="text-center mb-12">
            <Link
              to={getDashboardPath()}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : null}

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">For Buyers</h3>
            <p className="text-gray-600 mb-4">
              Browse thousands of electronic components, compare prices, and manage your orders efficiently.
            </p>
            <Link
              to="/products"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
            >
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">For Vendors</h3>
            <p className="text-gray-600 mb-4">
              List your products, manage inventory, and reach thousands of B2B buyers worldwide.
            </p>
            {user && profile?.role === 'vendor' ? (
              <Link
                to="/dashboard/vendor"
                className="text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1"
              >
                Become a Vendor
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Trusted Platform</h3>
            <p className="text-gray-600 mb-4">
              Secure transactions, verified vendors, and comprehensive buyer protection.
            </p>
            <Link
              to="/products"
              className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-1"
            >
              Learn More
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {!user && (
          <div className="text-center bg-white p-12 rounded-xl shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to get started?
            </h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Join thousands of buyers and vendors already using CircuitRack for their electronic component needs.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign Up Free
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

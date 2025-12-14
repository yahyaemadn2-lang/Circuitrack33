import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { LogOut, User, ShoppingCart } from 'lucide-react';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const { itemCount } = useCart();

  const getDashboardPath = () => {
    if (!profile) return '/en/auth/login';
    if (profile.role === 'admin') return '/en/admin/dashboard';
    if (profile.role === 'vendor') return '/en/vendor/dashboard';
    return '/en/buyer/dashboard';
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-900">
            CircuitRack
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/products" className="text-sm text-gray-700 hover:text-gray-900">
              Products
            </Link>

            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-gray-900">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user && profile ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{profile.email}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {profile.role}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

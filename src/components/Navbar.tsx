import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, profile, logout } = useAuth();

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
              <Link
                to="/en/auth/login"
                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

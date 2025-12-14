import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const lang = location.pathname.split('/')[1] || 'en';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/${lang}/auth/login`} replace />;
  }

  if (user && profile && requiredRole && profile.role !== requiredRole) {
    if (profile.role === 'admin') {
      return <Navigate to={`/${lang}/admin`} replace />;
    } else if (profile.role === 'vendor') {
      return <Navigate to={`/${lang}/vendor/dashboard`} replace />;
    } else {
      return <Navigate to={`/${lang}/buyer/dashboard`} replace />;
    }
  }

  return <>{children}</>;
}

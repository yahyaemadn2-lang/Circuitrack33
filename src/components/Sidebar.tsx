import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  Package,
  Bell,
  Users,
  ShoppingCart,
  TrendingUp,
  Settings,
  Box,
  ListOrdered,
} from 'lucide-react';

export default function Sidebar() {
  const { profile } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const buyerLinks = [
    { path: '/dashboard/buyer', label: 'Overview', icon: LayoutDashboard },
    { path: '/products', label: 'Browse Products', icon: ShoppingBag },
    { path: '/cart', label: 'Shopping Cart', icon: ShoppingCart },
  ];

  const vendorLinks = [
    { path: '/dashboard/vendor', label: 'Overview', icon: LayoutDashboard },
    { path: '/dashboard/vendor', label: 'Products', icon: Package },
    { path: '/dashboard/vendor', label: 'Orders', icon: ListOrdered },
  ];

  const adminLinks = [
    { path: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
    { path: '/dashboard/admin', label: 'Users', icon: Users },
    { path: '/dashboard/admin', label: 'Vendors', icon: Box },
    { path: '/dashboard/admin', label: 'Products', icon: Package },
    { path: '/dashboard/admin', label: 'Analytics', icon: TrendingUp },
  ];

  const getLinks = () => {
    if (profile?.role === 'admin') return adminLinks;
    if (profile?.role === 'vendor') return vendorLinks;
    return buyerLinks;
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          {profile?.role === 'admin' && 'Admin Panel'}
          {profile?.role === 'vendor' && 'Vendor Portal'}
          {profile?.role === 'buyer' && 'My Account'}
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          {profile?.email}
        </p>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);

            return (
              <Link
                key={link.path + link.label}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

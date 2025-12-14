import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Products from '../pages/Products';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import BuyerDashboard from '../pages/BuyerDashboard';
import VendorDashboard from '../pages/VendorDashboard';
import AdminDashboard from '../pages/AdminDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />

      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />

      <Route
        path="/dashboard/buyer"
        element={
          <ProtectedRoute requiredRole="buyer">
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/vendor"
        element={
          <ProtectedRoute requiredRole="vendor">
            <VendorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}

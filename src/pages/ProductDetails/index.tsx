import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Heart,
  ArrowLeft,
  Star,
  Check,
  Truck,
  Shield,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import * as productsService from '../../modules/products/products.service';
import * as favoritesService from '../../modules/favorites/favorites.service';
import { supabase } from '../../lib/supabaseClient';

interface Product {
  id: string;
  vendor_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  model: string;
  condition: string;
  base_price: number;
  created_at: string;
  updated_at: string;
}

interface Vendor {
  id: string;
  user_id: string;
  display_name: string;
  commission_rate: number;
  status: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: string;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToFavorites, setAddingToFavorites] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  const productImages = [
    null,
    null,
    null,
    null,
  ];

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  useEffect(() => {
    if (user && id) {
      checkIfFavorite(id);
    }
  }, [user, id]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      const productData = await productsService.getProductById(productId);

      if (!productData) {
        setError('Product not found');
        return;
      }

      setProduct(productData as Product);

      const [vendorData, categoryData] = await Promise.all([
        supabase.from('vendors').select('*').eq('id', productData.vendor_id).maybeSingle(),
        supabase.from('categories').select('*').eq('id', productData.category_id).maybeSingle(),
      ]);

      if (vendorData.data) setVendor(vendorData.data);
      if (categoryData.data) setCategory(categoryData.data);

      const relatedData = await supabase
        .from('products')
        .select('*')
        .eq('category_id', productData.category_id)
        .neq('id', productId)
        .limit(4);

      if (relatedData.data) setRelatedProducts(relatedData.data as Product[]);
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async (productId: string) => {
    try {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user?.id)
        .eq('product_id', productId)
        .maybeSingle();

      setIsFavorite(!!data);
    } catch (err) {
      console.error('Error checking favorite status:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!id) return;

    try {
      setAddingToCart(true);
      await addItem(id, quantity);
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setAddingToFavorites(true);

      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', id);
        setIsFavorite(false);
      } else {
        await supabase.from('favorites').insert({
          user_id: user.id,
          product_id: id,
        });
        setIsFavorite(true);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update favorites');
    } finally {
      setAddingToFavorites(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'This product does not exist'}</p>
          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </button>

        {cartSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>Product added to cart successfully!</span>
            <Link to="/cart" className="ml-auto text-green-700 font-medium hover:underline">
              View Cart
            </Link>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Package className="w-32 h-32 text-gray-400" />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {productImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 transition-colors ${
                      selectedImage === idx ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Package className="w-8 h-8 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <p className="text-lg text-gray-600">
                    {product.brand} {product.model}
                  </p>
                  {category && (
                    <Link
                      to={`/products?category=${category.id}`}
                      className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      {category.name}
                    </Link>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    product.condition === 'NEW'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {product.condition}
                </span>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-blue-600">
                  {Number(product.base_price).toFixed(2)} EGP
                </span>
              </div>

              {vendor && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Sold by</p>
                  <p className="font-semibold text-gray-900">{vendor.display_name}</p>
                  {vendor.status === 'approved' && (
                    <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                      <Check className="w-4 h-4" />
                      Verified Vendor
                    </div>
                  )}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleToggleFavorite}
                  disabled={addingToFavorites}
                  className={`px-6 py-3 border-2 rounded-lg transition-colors ${
                    isFavorite
                      ? 'border-red-600 bg-red-50 text-red-600 hover:bg-red-100'
                      : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="border-t pt-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <Truck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Free Shipping</p>
                  </div>
                  <div className="text-center">
                    <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Secure Payment</p>
                  </div>
                  <div className="text-center">
                    <RotateCcw className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Easy Returns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
            <p className="text-gray-600 leading-relaxed">
              {product.description || 'No description available for this product.'}
            </p>
          </div>

          <div className="border-t p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Brand:</span>
                <span className="font-medium text-gray-900">{product.brand || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium text-gray-900">{product.model || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Condition:</span>
                <span className="font-medium text-gray-900">{product.condition}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium text-gray-900">{category?.name || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  to={`/products/${related.id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden group"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                      {related.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {related.brand} {related.model}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-blue-600">
                        {Number(related.base_price).toFixed(2)} EGP
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          related.condition === 'NEW'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {related.condition}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

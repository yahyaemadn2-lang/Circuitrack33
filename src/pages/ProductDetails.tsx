import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  Share2,
  ArrowLeft,
  Package,
  Truck,
  Shield,
  Tag,
} from 'lucide-react';
import { getProductById, getRelatedProducts } from '../modules/products/products.service';
import { ProductWithRelations } from '../modules/products/products.schema';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Footer from '../components/Footer';
import MakeOfferModal from '../components/MakeOfferModal';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isBuyer, user } = useAuth();
  const { addItem } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductWithRelations | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductWithRelations[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getProductById(id);

      if (!data) {
        setError('Product not found');
        setLoading(false);
        return;
      }

      setProduct(data);

      const related = await getRelatedProducts(id, 8);
      setRelatedProducts(related);
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      await addItem(
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          condition: product.condition,
          vendor_id: product.vendor_id,
        },
        quantity
      );

      if (user) {
        navigate('/cart');
      } else {
        const goToCart = window.confirm(
          'Product added to cart! Would you like to view your cart?'
        );
        if (goToCart) {
          navigate('/cart');
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = () => {
    if (!user) {
      navigate('/login');
      return;
    }
  };

  const handleStartOffer = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowOfferModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProductDetailsSkeleton />
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-block p-4 bg-red-50 rounded-lg mb-4">
              <p className="text-red-700 font-medium">{error || 'Product not found'}</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/products')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Products
              </button>
              <button
                onClick={loadProduct}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
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
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <div className="text-gray-400 text-8xl">📦</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="mb-4">
              <span
                className={`inline-block px-3 py-1 text-sm font-medium rounded ${
                  product.condition === 'new'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {product.condition === 'new' ? 'New' : 'Used'}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

            {product.category && (
              <p className="text-gray-600 mb-4">Category: {product.category.name}</p>
            )}

            {product.vendor && (
              <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-200">
                <p className="text-gray-600">
                  Sold by:{' '}
                  <span className="font-medium text-gray-900">{product.vendor.display_name}</span>
                </p>
              </div>
            )}

            <div className="mb-6">
              <p className="text-4xl font-bold text-gray-900 mb-2">
                EGP {product.price.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Price includes VAT</p>
            </div>

            {product.description && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {isBuyer && (
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-50 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border-x border-gray-300 py-2"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToWishlist}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Heart className="w-5 h-5" />
                    Wishlist
                  </button>

                  <button
                    onClick={handleStartOffer}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Tag className="w-5 h-5" />
                    Make Offer
                  </button>
                </div>
              </div>
            )}

            {!isBuyer && user && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">
                  Only buyers can purchase products. Switch to a buyer account to add items to cart.
                </p>
              </div>
            )}

            {!user && (
              <div className="mb-6">
                <Link
                  to="/login"
                  className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  Sign In to Purchase
                </Link>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Quality Assured</p>
              </div>
              <div className="text-center">
                <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Fast Delivery</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Secure Payment</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex py-3 border-b border-gray-200">
              <span className="font-medium text-gray-700 w-40">Product ID:</span>
              <span className="text-gray-600">{product.slug}</span>
            </div>
            <div className="flex py-3 border-b border-gray-200">
              <span className="font-medium text-gray-700 w-40">Condition:</span>
              <span className="text-gray-600 capitalize">{product.condition}</span>
            </div>
            {product.category && (
              <div className="flex py-3 border-b border-gray-200">
                <span className="font-medium text-gray-700 w-40">Category:</span>
                <span className="text-gray-600">{product.category.name}</span>
              </div>
            )}
            {product.vendor && (
              <div className="flex py-3 border-b border-gray-200">
                <span className="font-medium text-gray-700 w-40">Vendor:</span>
                <span className="text-gray-600">{product.vendor.display_name}</span>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/products/${relatedProduct.id}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <div className="text-gray-400 text-4xl">📦</div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-xl font-bold text-gray-900">
                      EGP {relatedProduct.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {product && user && isBuyer && (
        <MakeOfferModal
          isOpen={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          productId={product.id}
          productName={product.name}
          vendorId={product.vendor_id}
          vendorUserId={product.vendor?.user_id}
          currentPrice={product.price}
          buyerId={user.id}
        />
      )}

      <Footer />
    </div>
  );
}

function ProductDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-10 bg-gray-200 rounded animate-pulse w-32 mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-20 mb-4" />
          <div className="h-10 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-6" />
          <div className="h-12 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="h-24 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="h-14 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

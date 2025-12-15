import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, ChevronDown, Heart, Scale, ShoppingCart } from 'lucide-react';
import { getProductsList, ProductsListResult } from '../modules/products/products.service';
import { getAllCategories } from '../modules/categories/categories.service';
import { ProductWithRelations, ProductFilters } from '../modules/products/products.schema';
import { Category } from '../modules/categories/categories.schema';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

export default function ProductsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isBuyer } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProductsListResult | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedCondition, setSelectedCondition] = useState<'new' | 'used' | ''>(
    (searchParams.get('condition') as 'new' | 'used') || ''
  );
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [currentPage, sortBy, sortOrder]);

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Error loading categories:', err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: ProductFilters = {
        search: searchQuery || undefined,
        categoryId: selectedCategory || undefined,
        condition: selectedCondition || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      };

      const data = await getProductsList(
        filters,
        { sortBy: sortBy as any, sortOrder },
        { page: currentPage, limit: 12 }
      );

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    updateURLParams();
    loadProducts();
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    updateURLParams();
    loadProducts();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCondition('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
    setSearchParams({});
    loadProducts();
  };

  const updateURLParams = () => {
    const params: any = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedCondition) params.condition = selectedCondition;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (sortBy !== 'created_at') params.sortBy = sortBy;
    if (sortOrder !== 'desc') params.sortOrder = sortOrder;
    if (currentPage > 1) params.page = currentPage.toString();
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products Catalog</h1>
          <p className="text-gray-600">Browse our complete selection of electronic components</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Search
            </button>
          </form>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filters
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {showFilters && (
          <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Conditions</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                <input
                  type="number"
                  placeholder="10000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleApplyFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {result ? `Showing ${result.products.length} of ${result.total} products` : 'Loading...'}
          </p>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder as 'asc' | 'desc');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created_at-desc">Newest</option>
              <option value="created_at-asc">Oldest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>

        {loading && <ProductsLoadingSkeleton />}

        {error && (
          <div className="text-center py-12">
            <div className="inline-block p-4 bg-red-50 rounded-lg mb-4">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
            <button
              onClick={loadProducts}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && result && result.products.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || selectedCategory || selectedCondition || minPrice || maxPrice
                ? 'No products match your filters'
                : 'This feature is under development.'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory || selectedCondition || minPrice || maxPrice
                ? 'Try adjusting your search or filter criteria.'
                : 'Product catalog will be available soon.'}
            </p>
            {(searchQuery || selectedCategory || selectedCondition || minPrice || maxPrice) && (
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {!loading && !error && result && result.products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {result.products.map((product) => (
                <ProductCard key={product.id} product={product} isBuyer={isBuyer} />
              ))}
            </div>

            {result.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={result.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

function ProductCard({
  product,
  isBuyer,
}: {
  product: ProductWithRelations;
  isBuyer: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400 text-4xl">📦</div>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <span
            className={`inline-block px-2 py-1 text-xs font-medium rounded ${
              product.condition === 'new'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {product.condition === 'new' ? 'New' : 'Used'}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>

        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        )}

        {product.category && (
          <p className="text-xs text-gray-500 mb-2">{product.category.name}</p>
        )}

        {product.vendor && (
          <p className="text-xs text-gray-500 mb-3">by {product.vendor.display_name}</p>
        )}

        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-900">
            EGP {product.price.toLocaleString()}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            to={`/products/${product.id}`}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
          >
            View Details
          </Link>

          {isBuyer && (
            <div className="flex gap-2">
              <button
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                title="Add to Wishlist"
              >
                <Heart className="w-4 h-4" />
              </button>
              <button
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                title="Add to Compare"
              >
                <Scale className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="aspect-square bg-gray-200 animate-pulse" />
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-16" />
            <div className="h-5 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-3/4" />
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = [];
  const maxVisible = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            1
          </button>
          {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
}

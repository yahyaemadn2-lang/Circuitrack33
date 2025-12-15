import { useState, useEffect } from 'react';
import { Package, DollarSign, ShoppingBag } from 'lucide-react';
import { getAllActiveListings } from '../modules/secondaryMarket/secondaryMarket.service';
import { SecondaryMarketListing } from '../modules/secondaryMarket/secondaryMarket.schema';
import Footer from '../components/Footer';

export default function SecondaryMarket() {
  const [listings, setListings] = useState<SecondaryMarketListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await getAllActiveListings();
      setListings(data);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8" />
            Secondary Market
          </h1>
          <p className="text-gray-600">Browse pre-owned and resold electronic components</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">This feature is under development.</h3>
            <p className="text-gray-600">Secondary market functionality will be available soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing: any) => (
              <div
                key={listing.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {listing.product_reference}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        listing.condition === 'new'
                          ? 'bg-green-100 text-green-700'
                          : listing.condition === 'refurbished'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {listing.condition}
                    </span>
                  </div>

                  {listing.notes && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{listing.notes}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Asking Price:</span>
                      <span className="text-xl font-bold text-gray-900">
                        {listing.asking_price} EGP
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium text-gray-700">
                        {listing.quantity} units
                      </span>
                    </div>
                    {listing.seller && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Seller:</span>
                        <span className="font-medium text-gray-700">
                          {listing.seller.email}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-3">
                      Listed on {new Date(listing.created_at).toLocaleDateString()}
                    </p>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Contact Seller
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

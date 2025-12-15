import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Package, TrendingUp, Gavel } from 'lucide-react';
import { getAllAuctions, checkAndUpdateAuctionStatus } from '../modules/auctions/auctions.service';
import { Auction } from '../modules/auctions/auctions.schema';
import Footer from '../components/Footer';

export default function Auctions() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'running' | 'scheduled' | 'ended'>('running');

  useEffect(() => {
    loadAuctions();
  }, [filter]);

  const loadAuctions = async () => {
    setLoading(true);
    try {
      const filterStatus = filter === 'all' ? undefined : filter;
      const data = await getAllAuctions(filterStatus);

      const updatedAuctions = await Promise.all(
        data.map(async (auction) => {
          try {
            return await checkAndUpdateAuctionStatus(auction.id);
          } catch {
            return auction;
          }
        })
      );

      setAuctions(updatedAuctions);
    } catch (error) {
      console.error('Failed to load auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Gavel className="w-8 h-8" />
            Auctions
          </h1>
          <p className="text-gray-600">Browse active auctions and place bids</p>
        </div>

        <div className="mb-6 flex gap-2">
          {(['running', 'scheduled', 'ended', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
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
        ) : auctions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">This feature is under development.</h3>
            <p className="text-gray-600">Auction functionality will be available soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction: any) => (
              <Link
                key={auction.id}
                to={`/auctions/${auction.id}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {auction.product?.name || 'Product'}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        auction.status === 'running'
                          ? 'bg-green-100 text-green-700'
                          : auction.status === 'scheduled'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {auction.status}
                    </span>
                  </div>

                  {auction.product?.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {auction.product.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Starting Price:</span>
                      <span className="font-semibold text-gray-900">
                        {auction.start_price} EGP
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Min Increment:</span>
                      <span className="font-medium text-gray-700">
                        {auction.min_increment} EGP
                      </span>
                    </div>
                  </div>

                  {(auction.status === 'running' || auction.status === 'scheduled') && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-medium pt-4 border-t border-gray-200">
                      <Clock className="w-4 h-4" />
                      {auction.status === 'running'
                        ? `Ends in ${getTimeRemaining(auction.end_time)}`
                        : `Starts ${new Date(auction.start_time).toLocaleDateString()}`}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      View Auction
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

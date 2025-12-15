import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Reply, DollarSign, Package, MessageSquare } from 'lucide-react';
import { getOffersByVendor, acceptOffer, rejectOffer, createCounterOffer } from '../modules/offers/offers.service';
import { createNotification } from '../modules/notifications/notifications.service';

interface VendorOffersManagementProps {
  vendorId: string;
}

export default function VendorOffersManagement({ vendorId }: VendorOffersManagementProps) {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOfferId, setProcessingOfferId] = useState<string | null>(null);
  const [counterOfferModal, setCounterOfferModal] = useState<any>(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterQuantity, setCounterQuantity] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  useEffect(() => {
    loadOffers();
  }, [vendorId]);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const data = await getOffersByVendor(vendorId);
      setOffers(data);
    } catch (error) {
      console.error('Failed to load offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offerId: string, buyerId: string, productName: string) => {
    if (!confirm('Accept this offer?')) return;

    setProcessingOfferId(offerId);
    try {
      await acceptOffer(offerId, 'Your offer has been accepted!');
      await createNotification(
        buyerId,
        'Offer Accepted',
        `Your offer for ${productName} has been accepted by the vendor!`
      );
      await loadOffers();
    } catch (error: any) {
      alert(error.message || 'Failed to accept offer');
    } finally {
      setProcessingOfferId(null);
    }
  };

  const handleReject = async (offerId: string, buyerId: string, productName: string) => {
    const reason = prompt('Rejection reason (optional):');
    if (reason === null) return;

    setProcessingOfferId(offerId);
    try {
      await rejectOffer(offerId, reason || 'Offer rejected');
      await createNotification(
        buyerId,
        'Offer Rejected',
        `Your offer for ${productName} has been rejected.`
      );
      await loadOffers();
    } catch (error: any) {
      alert(error.message || 'Failed to reject offer');
    } finally {
      setProcessingOfferId(null);
    }
  };

  const handleCounterOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterOfferModal) return;

    const price = parseFloat(counterPrice);
    const qty = parseInt(counterQuantity, 10);

    if (isNaN(price) || price <= 0) {
      alert('Invalid price');
      return;
    }

    if (isNaN(qty) || qty <= 0) {
      alert('Invalid quantity');
      return;
    }

    setProcessingOfferId(counterOfferModal.id);
    try {
      await createCounterOffer(vendorId, {
        parent_offer_id: counterOfferModal.id,
        offered_price: price,
        quantity: qty,
        response_message: counterMessage,
      });

      await createNotification(
        counterOfferModal.buyer_id,
        'Counter-Offer Received',
        `The vendor has sent a counter-offer for ${counterOfferModal.product.name}`
      );

      setCounterOfferModal(null);
      setCounterPrice('');
      setCounterQuantity('');
      setCounterMessage('');
      await loadOffers();
    } catch (error: any) {
      alert(error.message || 'Failed to create counter-offer');
    } finally {
      setProcessingOfferId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Incoming Offers</h2>
        <span className="text-sm text-gray-600">{offers.length} total offers</span>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No offers received yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {offer.product?.name || 'Product'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    From: {offer.buyer?.email || 'Unknown buyer'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(offer.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    offer.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : offer.status === 'accepted'
                      ? 'bg-green-100 text-green-700'
                      : offer.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {offer.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Offered Price:</span>
                  <span className="font-semibold text-gray-900">
                    {offer.offered_price} EGP/unit
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Quantity:</span>
                  <span className="font-semibold text-gray-900">{offer.quantity}</span>
                </div>
              </div>

              {offer.message && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 font-medium mb-1">Buyer Message:</p>
                      <p className="text-sm text-gray-700">{offer.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {offer.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleAccept(offer.id, offer.buyer_id, offer.product?.name)}
                    disabled={processingOfferId === offer.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(offer.id, offer.buyer_id, offer.product?.name)}
                    disabled={processingOfferId === offer.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setCounterOfferModal(offer);
                      setCounterPrice(offer.offered_price.toString());
                      setCounterQuantity(offer.quantity.toString());
                    }}
                    disabled={processingOfferId === offer.id}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Reply className="w-4 h-4" />
                    Counter-Offer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {counterOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Send Counter-Offer</h3>
              <button
                onClick={() => setCounterOfferModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCounterOffer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Counter Price Per Unit (EGP)
                </label>
                <input
                  type="number"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  step="0.01"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={counterQuantity}
                  onChange={(e) => setCounterQuantity(e.target.value)}
                  min="1"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCounterOfferModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingOfferId === counterOfferModal.id}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Send Counter-Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

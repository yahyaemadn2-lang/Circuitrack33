import { useState } from 'react';
import { X, DollarSign, Package, MessageSquare } from 'lucide-react';
import { createOffer } from '../modules/offers/offers.service';
import { createNotification } from '../modules/notifications/notifications.service';

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  vendorId: string;
  vendorUserId?: string;
  currentPrice: number;
  buyerId: string;
}

export default function MakeOfferModal({
  isOpen,
  onClose,
  productId,
  productName,
  vendorId,
  vendorUserId,
  currentPrice,
  buyerId,
}: MakeOfferModalProps) {
  const [offeredPrice, setOfferedPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(offeredPrice);
    const quantityNum = parseInt(quantity, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price');
      return;
    }

    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    setSubmitting(true);

    try {
      await createOffer(buyerId, {
        product_id: productId,
        vendor_id: vendorId,
        offered_price: priceNum,
        quantity: quantityNum,
        message,
      });

      if (vendorUserId) {
        await createNotification(
          vendorUserId,
          'New Offer Received',
          `You received an offer of ${priceNum} EGP per unit for ${productName} (${quantityNum} units)`
        );
      }

      setOfferedPrice('');
      setQuantity('1');
      setMessage('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit offer');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Make an Offer</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Making an offer for: <span className="font-medium text-gray-900">{productName}</span>
            </p>
            <p className="text-sm text-gray-500">
              Current Price: <span className="font-medium">{currentPrice} EGP/unit</span>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="offeredPrice" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Offered Price Per Unit (EGP)
              </div>
            </label>
            <input
              type="number"
              id="offeredPrice"
              value={offeredPrice}
              onChange={(e) => setOfferedPrice(e.target.value)}
              step="0.01"
              min="0"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your offer price"
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Quantity
              </div>
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter quantity"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Message to Vendor (Optional)
              </div>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Add any additional details or requests..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

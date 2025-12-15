import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, Gift, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getWalletByUserId, getWalletTransactionsByUserId } from '../modules/wallet/wallet.service';
import { Wallet, WalletTransaction } from '../modules/wallet/wallet.schema';
import { getCashbackTier, getNextCashbackTier } from '../modules/wallet/cashback';
import DashboardLayout from '../components/DashboardLayout';

export default function BuyerWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [walletData, transactionsData] = await Promise.all([
        getWalletByUserId(user.id),
        getWalletTransactionsByUserId(user.id),
      ]);

      setWallet(walletData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowUpCircle className="w-5 h-5 text-green-600" />;
      case 'debit':
        return <ArrowDownCircle className="w-5 h-5 text-red-600" />;
      case 'cashback':
        return <Gift className="w-5 h-5 text-blue-600" />;
      case 'penalty':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <WalletIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
        return 'text-green-600';
      case 'debit':
        return 'text-red-600';
      case 'cashback':
        return 'text-blue-600';
      case 'penalty':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTransactionBgColor = (type: string) => {
    switch (type) {
      case 'credit':
        return 'bg-green-50 border-green-200';
      case 'debit':
        return 'bg-red-50 border-red-200';
      case 'cashback':
        return 'bg-blue-50 border-blue-200';
      case 'penalty':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const totalBalance = wallet
    ? wallet.main_balance + wallet.cashback_balance - wallet.penalty_balance
    : 0;

  const currentTier = wallet ? getCashbackTier(totalBalance) : null;
  const nextTier = wallet ? getNextCashbackTier(totalBalance) : null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6">
                <div className="h-32 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg p-6">
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!wallet) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <WalletIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Wallet Not Found</h2>
          <p className="text-gray-600 mb-4">
            Your wallet could not be loaded. Please contact support.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600 mt-1">Manage your balance and view transactions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <WalletIcon className="w-8 h-8 opacity-80" />
              <span className="text-sm opacity-80">Available</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">
              EGP {wallet.main_balance.toLocaleString()}
            </h3>
            <p className="text-sm opacity-80">Main Balance</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Gift className="w-8 h-8 opacity-80" />
              <span className="text-sm opacity-80">Rewards</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">
              EGP {wallet.cashback_balance.toLocaleString()}
            </h3>
            <p className="text-sm opacity-80">Cashback Balance</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <AlertCircle className="w-8 h-8 opacity-80" />
              <span className="text-sm opacity-80">Penalties</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">
              EGP {wallet.penalty_balance.toLocaleString()}
            </h3>
            <p className="text-sm opacity-80">Penalty Balance</p>
          </div>
        </div>

        {currentTier && (
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Current Cashback Rate: {currentTier.percentage}%
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  You're earning {currentTier.percentage}% cashback on all orders over EGP{' '}
                  {currentTier.minAmount.toLocaleString()}
                </p>
                {nextTier && (
                  <p className="text-sm text-blue-600 font-medium">
                    Spend EGP {nextTier.additionalAmountNeeded.toLocaleString()} more to unlock{' '}
                    {nextTier.percentage}% cashback!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
            <p className="text-sm text-gray-600 mt-1">
              View all your wallet transactions
            </p>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <WalletIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No transactions yet</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reference
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.type)}
                            <span
                              className={`text-sm font-medium capitalize ${getTransactionColor(
                                transaction.type
                              )}`}
                            >
                              {transaction.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {transaction.reference_id ? (
                            <span className="font-mono text-xs">
                              {transaction.reference_id.slice(0, 8)}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-right text-sm font-semibold ${getTransactionColor(
                            transaction.type
                          )}`}
                        >
                          {transaction.amount >= 0 ? '+' : ''}
                          EGP {transaction.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {indexOfFirstTransaction + 1} to{' '}
                    {Math.min(indexOfLastTransaction, transactions.length)} of{' '}
                    {transactions.length} transactions
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

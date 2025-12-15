import { useState, useEffect } from 'react';
import { Building, Users, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { getAllCompanies, getAllUsers } from '../modules/crm/crm.service';
import { computeAndSaveUserRisk } from '../modules/risk/risk.service';

export default function AdminCRM() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'companies' | 'users'>('companies');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [companiesData, usersData] = await Promise.all([
        getAllCompanies(),
        getAllUsers(),
      ]);
      setCompanies(companiesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load CRM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComputeRisk = async (userId: string) => {
    try {
      await computeAndSaveUserRisk(userId);
      await loadData();
    } catch (error) {
      console.error('Failed to compute risk:', error);
    }
  };

  const filteredUsers = users.filter(
    (user) => riskFilter === 'all' || user.risk_level === riskFilter
  );

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">CRM Dashboard</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('companies')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'companies'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Building className="w-4 h-4 inline mr-2" />
            Companies
          </button>
          <button
            onClick={() => setViewMode('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Users
          </button>
        </div>
      </div>

      {viewMode === 'companies' ? (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">{companies.length} companies</div>
          {companies.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No companies found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {companies.map((company) => (
                <div key={company.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                      {company.country && (
                        <p className="text-sm text-gray-600">{company.country}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(company.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Buyers</p>
                      <p className="text-lg font-semibold text-gray-900">{company.buyer_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Vendors</p>
                      <p className="text-lg font-semibold text-gray-900">{company.vendor_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Orders</p>
                      <p className="text-lg font-semibold text-gray-900">{company.total_orders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">GMV</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {company.total_gmv.toFixed(0)} EGP
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">{filteredUsers.length} users</div>
            <div className="flex gap-2">
              {(['all', 'low', 'medium', 'high'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setRiskFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    riskFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Risk
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        {user.company && (
                          <div className="text-xs text-gray-500">{user.company.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{user.role}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.order_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.total_spent.toFixed(0)} EGP
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.risk_level ? (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(
                              user.risk_level
                            )}`}
                          >
                            {user.risk_level} ({user.risk_score})
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">Not calculated</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleComputeRisk(user.id)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Compute Risk
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

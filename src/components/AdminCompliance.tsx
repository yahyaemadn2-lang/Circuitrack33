import { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { getComplianceStats } from '../modules/crm/crm.service';

export default function AdminCompliance() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getComplianceStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load compliance stats:', error);
    } finally {
      setLoading(false);
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

  if (!stats) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Failed to load compliance data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Compliance Dashboard</h2>
        <p className="text-gray-600">Monitor user agreements and regulatory compliance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Registration Terms</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.terms_acceptance_rate.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">
              {stats.users_with_terms} of {stats.total_users} users accepted
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Vendor Declarations</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.vendors_with_declaration}
              </p>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">Out of {stats.total_vendors} vendors</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Missing Declarations</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.vendors_missing_declaration}
              </p>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">Vendors need attention</p>
          </div>
        </div>
      </div>

      {stats.vendors_missing_declaration > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Vendors Without Compliance Declaration
            </h3>
          </div>

          {stats.missing_vendors.length === 0 ? (
            <p className="text-gray-600">All vendors have submitted declarations</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.missing_vendors.map((vendor: any) => (
                    <tr key={vendor.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vendor.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vendor.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          Missing Declaration
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Compliance Requirements</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>All users must accept registration terms confirming B2B use</li>
              <li>Vendors must accept export control and safety regulations declaration</li>
              <li>Orders require acceptance of terms at checkout</li>
              <li>Regular audits ensure ongoing compliance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

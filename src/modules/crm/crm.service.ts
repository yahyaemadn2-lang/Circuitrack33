import { supabase } from '../../lib/supabase';
import { computeUserRisk } from '../risk/risk.service';

export interface CompanyData {
  id: string;
  name: string;
  country?: string;
  tax_id?: string;
  buyer_count: number;
  vendor_count: number;
  total_orders: number;
  total_gmv: number;
  avg_order_value: number;
  risk_level?: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface UserCRMData {
  id: string;
  email: string;
  role: string;
  created_at: string;
  company?: {
    id: string;
    name: string;
  };
  order_count: number;
  total_spent: number;
  risk_level?: 'low' | 'medium' | 'high';
  risk_score?: number;
}

export async function getAllCompanies(): Promise<CompanyData[]> {
  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const companiesWithMetrics = await Promise.all(
    (companies || []).map(async (company) => {
      const metrics = await computeCompanyMetrics(company.id);
      return {
        id: company.id,
        name: company.name,
        country: company.country,
        tax_id: company.tax_id,
        buyer_count: metrics.buyer_count,
        vendor_count: metrics.vendor_count,
        total_orders: metrics.total_orders,
        total_gmv: metrics.total_gmv,
        avg_order_value: metrics.avg_order_value,
        created_at: company.created_at,
      };
    })
  );

  return companiesWithMetrics;
}

export async function computeCompanyMetrics(companyId: string) {
  const { data: users } = await supabase
    .from('company_users')
    .select('user_id, user:users(role)')
    .eq('company_id', companyId);

  const buyer_count = users?.filter((u: any) => u.user?.role === 'buyer').length || 0;
  const vendor_count = users?.filter((u: any) => u.user?.role === 'vendor').length || 0;

  const { data: orders } = await supabase
    .from('orders')
    .select('subtotal, status')
    .eq('company_id', companyId);

  const total_orders = orders?.length || 0;
  const total_gmv = orders?.reduce((sum, o) => sum + (parseFloat(o.subtotal) || 0), 0) || 0;
  const avg_order_value = total_orders > 0 ? total_gmv / total_orders : 0;

  return {
    buyer_count,
    vendor_count,
    total_orders,
    total_gmv,
    avg_order_value,
  };
}

export async function getAllUsers(): Promise<UserCRMData[]> {
  const { data: users, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      role,
      created_at,
      company_users(company:companies(id, name))
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const usersWithData = await Promise.all(
    (users || []).map(async (user: any) => {
      const { data: orders } = await supabase
        .from('orders')
        .select('subtotal')
        .eq('user_id', user.id);

      const order_count = orders?.length || 0;
      const total_spent = orders?.reduce((sum, o) => sum + (parseFloat(o.subtotal) || 0), 0) || 0;

      const { data: riskScore } = await supabase
        .from('risk_scores')
        .select('level, score')
        .eq('user_id', user.id)
        .maybeSingle();

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        company: user.company_users?.[0]?.company || undefined,
        order_count,
        total_spent,
        risk_level: riskScore?.level,
        risk_score: riskScore?.score,
      };
    })
  );

  return usersWithData;
}

export async function getComplianceStats() {
  const { data: allUsers } = await supabase.from('users').select('id, role');
  const totalUsers = allUsers?.length || 0;

  const { data: agreements } = await supabase
    .from('user_agreements')
    .select('user_id, agreement_type');

  const usersWithTerms = new Set(
    agreements?.filter((a) => a.agreement_type === 'registration_terms').map((a) => a.user_id)
  );

  const vendors = allUsers?.filter((u) => u.role === 'vendor') || [];
  const vendorsWithDeclaration = new Set(
    agreements?.filter((a) => a.agreement_type === 'vendor_declaration').map((a) => a.user_id)
  );

  const vendorsMissingDeclaration = vendors.filter((v) => !vendorsWithDeclaration.has(v.id));

  const termsAcceptanceRate = totalUsers > 0 ? (usersWithTerms.size / totalUsers) * 100 : 0;

  return {
    total_users: totalUsers,
    users_with_terms: usersWithTerms.size,
    terms_acceptance_rate: termsAcceptanceRate,
    total_vendors: vendors.length,
    vendors_with_declaration: vendorsWithDeclaration.size,
    vendors_missing_declaration: vendorsMissingDeclaration.length,
    missing_vendors: vendorsMissingDeclaration,
  };
}

import { supabase } from '../../lib/supabase';

export interface RiskScore {
  id: string;
  user_id: string;
  score: number;
  level: 'low' | 'medium' | 'high';
  reasons: string[];
  last_calculated: string;
}

export interface UserRiskAnalysis {
  score: number;
  level: 'low' | 'medium' | 'high';
  reasons: string[];
}

export async function computeUserRisk(userId: string): Promise<UserRiskAnalysis> {
  let score = 0;
  const reasons: string[] = [];

  try {
    const { data: user } = await supabase
      .from('users')
      .select('*, created_at')
      .eq('id', userId)
      .single();

    if (!user) {
      return { score: 0, level: 'low', reasons: ['User not found'] };
    }

    const accountAge = Date.now() - new Date(user.created_at).getTime();
    const daysOld = accountAge / (1000 * 60 * 60 * 24);

    const { data: orders } = await supabase
      .from('orders')
      .select('id, status, subtotal, created_at')
      .eq('user_id', userId);

    const orderCount = orders?.length || 0;
    const recentOrders = orders?.filter(
      (o) => Date.now() - new Date(o.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
    ) || [];

    if (daysOld < 7 && orderCount > 10) {
      score += 30;
      reasons.push('High order volume for new account');
    }

    if (recentOrders.length > 15) {
      score += 20;
      reasons.push('Very high recent order volume');
    }

    const cancelledOrders = orders?.filter((o) => o.status === 'cancelled') || [];
    const cancelRate = orderCount > 0 ? cancelledOrders.length / orderCount : 0;

    if (cancelRate > 0.3 && orderCount > 5) {
      score += 25;
      reasons.push('High order cancellation rate');
    }

    const { data: wallet } = await supabase
      .from('wallets')
      .select('main_balance, cashback_balance, penalty_balance')
      .eq('user_id', userId)
      .single();

    if (wallet && wallet.penalty_balance > 0) {
      score += 15;
      reasons.push('Has penalty balance');
    }

    const { data: company } = await supabase
      .from('company_users')
      .select('company:companies(name, tax_id)')
      .eq('user_id', userId)
      .single();

    if (!company || !company.company) {
      score += 10;
      reasons.push('No company information');
    }

    const totalGMV = orders?.reduce((sum, o) => sum + (parseFloat(o.subtotal) || 0), 0) || 0;

    if (totalGMV > 100000 && daysOld < 30) {
      score += 20;
      reasons.push('Very high GMV for new account');
    }

    const { data: agreements } = await supabase
      .from('user_agreements')
      .select('agreement_type')
      .eq('user_id', userId);

    const hasRegistrationTerms = agreements?.some((a) => a.agreement_type === 'registration_terms');

    if (!hasRegistrationTerms) {
      score += 15;
      reasons.push('Missing registration terms acceptance');
    }

    if (user.role === 'vendor') {
      const hasVendorDeclaration = agreements?.some((a) => a.agreement_type === 'vendor_declaration');
      if (!hasVendorDeclaration) {
        score += 10;
        reasons.push('Vendor missing compliance declaration');
      }
    }

    let level: 'low' | 'medium' | 'high' = 'low';
    if (score >= 50) {
      level = 'high';
    } else if (score >= 25) {
      level = 'medium';
    }

    if (reasons.length === 0) {
      reasons.push('No risk factors identified');
    }

    return { score, level, reasons };
  } catch (error) {
    console.error('Error computing risk:', error);
    return { score: 0, level: 'low', reasons: ['Error computing risk'] };
  }
}

export async function saveRiskScore(userId: string, analysis: UserRiskAnalysis): Promise<RiskScore> {
  const { data, error } = await supabase
    .from('risk_scores')
    .upsert(
      {
        user_id: userId,
        score: analysis.score,
        level: analysis.level,
        reasons: JSON.stringify(analysis.reasons),
        last_calculated: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRiskScore(userId: string): Promise<RiskScore | null> {
  const { data, error } = await supabase
    .from('risk_scores')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAllRiskScores(): Promise<RiskScore[]> {
  const { data, error } = await supabase
    .from('risk_scores')
    .select('*, user:users(email, role)')
    .order('score', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function computeAndSaveUserRisk(userId: string): Promise<RiskScore> {
  const analysis = await computeUserRisk(userId);
  return await saveRiskScore(userId, analysis);
}

export async function recordAgreement(
  userId: string,
  agreementType: string,
  metadata?: any
): Promise<void> {
  const { error } = await supabase.from('user_agreements').insert({
    user_id: userId,
    agreement_type: agreementType,
    accepted_at: new Date().toISOString(),
    metadata: metadata || {},
  });

  if (error) throw error;
}

export async function getUserAgreements(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('user_agreements')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function hasAgreement(userId: string, agreementType: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_agreements')
    .select('id')
    .eq('user_id', userId)
    .eq('agreement_type', agreementType)
    .maybeSingle();

  return !!data;
}

export interface CashbackConfig {
  enabled: boolean;
  basePercentage: number;
  minimumOrderAmount: number;
  tieredRates?: Array<{
    minAmount: number;
    percentage: number;
  }>;
}

const DEFAULT_CASHBACK_CONFIG: CashbackConfig = {
  enabled: true,
  basePercentage: 1.0,
  minimumOrderAmount: 100,
  tieredRates: [
    { minAmount: 100, percentage: 1.0 },
    { minAmount: 1000, percentage: 1.5 },
    { minAmount: 5000, percentage: 2.0 },
    { minAmount: 10000, percentage: 2.5 },
  ],
};

export function calculateCashback(
  orderTotal: number,
  config: CashbackConfig = DEFAULT_CASHBACK_CONFIG
): number {
  if (!config.enabled) {
    return 0;
  }

  if (orderTotal < config.minimumOrderAmount) {
    return 0;
  }

  let applicablePercentage = config.basePercentage;

  if (config.tieredRates && config.tieredRates.length > 0) {
    const sortedRates = [...config.tieredRates].sort((a, b) => b.minAmount - a.minAmount);

    for (const tier of sortedRates) {
      if (orderTotal >= tier.minAmount) {
        applicablePercentage = tier.percentage;
        break;
      }
    }
  }

  const cashbackAmount = (orderTotal * applicablePercentage) / 100;

  return Math.round(cashbackAmount * 100) / 100;
}

export function getCashbackTier(orderTotal: number): {
  percentage: number;
  minAmount: number;
} | null {
  const config = DEFAULT_CASHBACK_CONFIG;

  if (!config.enabled || orderTotal < config.minimumOrderAmount) {
    return null;
  }

  if (config.tieredRates && config.tieredRates.length > 0) {
    const sortedRates = [...config.tieredRates].sort((a, b) => b.minAmount - a.minAmount);

    for (const tier of sortedRates) {
      if (orderTotal >= tier.minAmount) {
        return tier;
      }
    }
  }

  return {
    percentage: config.basePercentage,
    minAmount: config.minimumOrderAmount,
  };
}

export function getNextCashbackTier(orderTotal: number): {
  percentage: number;
  minAmount: number;
  additionalAmountNeeded: number;
} | null {
  const config = DEFAULT_CASHBACK_CONFIG;

  if (!config.enabled || !config.tieredRates) {
    return null;
  }

  const sortedRates = [...config.tieredRates].sort((a, b) => a.minAmount - b.minAmount);

  for (const tier of sortedRates) {
    if (orderTotal < tier.minAmount) {
      return {
        percentage: tier.percentage,
        minAmount: tier.minAmount,
        additionalAmountNeeded: tier.minAmount - orderTotal,
      };
    }
  }

  return null;
}

export interface GAAPIncomeStatement {
  metadata: {
    organizationId: string;
    generatedAt: Date;
    interval: string;
  };
  revenue: {
    grossPotentialRent: number;
    vacancyLoss: number;
    otherIncome: number;
    effectiveGrossRevenue: number;
  };
  expenses: {
    operating: {
      categories: Record<string, number>;
      total: number;
    };
    capital: {
      categories: Record<string, number>;
      total: number;
    };
    total: number;
  };
  metrics: {
    netOperatingIncome: number;
    operatingExpenseRatio: number;
  };
}

export function calculateNOI(egr: number, opex: number): number {
  return egr - opex;
}

export function calculateMovingAverage(data: number[], window: number = 6): number {
  if (data.length === 0) return 0;
  const subset = data.slice(-window);
  return subset.reduce((a, b) => a + b, 0) / subset.length;
}

export function calculateStandardDeviation(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  return Math.sqrt(values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / n);
}

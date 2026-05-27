export interface MonthlyBudget {
  id: string;
  userId: string;
  year: number;
  month: number;
  amount: number;
  currency: string;
  createdAt: string;
}

export interface UpsertBudgetRequest {
  amount: number;
  currency: string;
}

export interface BudgetSummary {
  year: number;
  month: number;
  currency: string;
  budgetAmount: number | null;
  totalSpent: number | null;
  remaining: number | null;
  usagePercent: number | null;
  hasBudget: boolean;
}

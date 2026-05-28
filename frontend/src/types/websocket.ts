export type BudgetAlertMessage = {
  type: 'BUDGET_ALERT';
  threshold: 50 | 80 | 100;
  usagePercent: number;
  totalSpent: number;
  budgetAmount: number;
  currency: string;
  year: number;
  month: number;
};

export type ConnectedMessage = { type: 'CONNECTED' };

export type ServerMessage = BudgetAlertMessage | ConnectedMessage;

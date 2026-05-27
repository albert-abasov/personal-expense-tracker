export interface Transaction {
  id: string;
  categoryId: string;
  categoryName: string;
  title: string;
  amount: number;
  currency: string;
  transactionDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionPage {
  data: Transaction[];
  page: number;
  size: number;
  total: number;
}

export interface CreateTransactionRequest {
  title: string;
  amount: number;
  currency: string;
  transactionDate: string;
  categoryId: string;
  notes?: string;
}

export interface UpdateTransactionRequest {
  title: string;
  amount: number;
  currency: string;
  transactionDate: string;
  categoryId: string;
  notes?: string;
}

export interface TransactionFilters {
  q?: string;
  categoryId?: string;
  dateRange?: 'this_month' | 'last_month';
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  page?: number;
  size?: number;
  sort?: string;
}

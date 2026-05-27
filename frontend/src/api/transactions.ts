import client from './client';
import type {
  Transaction,
  TransactionPage,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionFilters,
} from '@/types/transactions';

export async function getTransactions(filters: TransactionFilters = {}): Promise<TransactionPage> {
  const response = await client.get('/api/v1/transactions', { params: filters });
  if (response.status !== 200) {
    throw new Error(response.data?.error || 'Failed to fetch transactions');
  }
  return response.data;
}

export async function getTransaction(id: string): Promise<Transaction> {
  const response = await client.get(`/api/v1/transactions/${id}`);
  if (response.status !== 200) {
    throw new Error(response.data?.error || 'Failed to fetch transaction');
  }
  return response.data;
}

export async function createTransaction(req: CreateTransactionRequest): Promise<Transaction> {
  const response = await client.post('/api/v1/transactions', req);
  if (response.status !== 201) {
    throw new Error(response.data?.error || 'Failed to create transaction');
  }
  return response.data;
}

export async function updateTransaction(id: string, req: UpdateTransactionRequest): Promise<Transaction> {
  const response = await client.put(`/api/v1/transactions/${id}`, req);
  if (response.status !== 200) {
    throw new Error(response.data?.error || 'Failed to update transaction');
  }
  return response.data;
}

export async function deleteTransaction(id: string): Promise<void> {
  const response = await client.delete(`/api/v1/transactions/${id}`);
  if (response.status !== 204) {
    throw new Error(response.data?.error || 'Failed to delete transaction');
  }
}

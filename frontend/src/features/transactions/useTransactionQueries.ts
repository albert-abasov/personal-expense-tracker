import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as transactionApi from '@/api/transactions';
import type {
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionFilters,
} from '@/types/transactions';

const TRANSACTIONS_QUERY_KEY = ['transactions'];

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, filters],
    queryFn: () => transactionApi.getTransactions(filters),
    staleTime: 30_000,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateTransactionRequest) => transactionApi.createTransaction(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateTransactionRequest }) =>
      transactionApi.updateTransaction(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionApi.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
    },
  });
}

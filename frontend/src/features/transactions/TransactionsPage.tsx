import { useState } from 'react';
import { TransactionList } from './TransactionList';
import { TransactionForm } from './TransactionForm';
import { TransactionFilterBar } from './TransactionFilterBar';
import { useCreateTransaction, useUpdateTransaction } from './useTransactionQueries';
import type {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionFilters,
} from '@/types/transactions';

export function TransactionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [filters, setFilters] = useState<TransactionFilters>({ page: 0, size: 20 });

  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();

  const handleFormSubmit = async (data: CreateTransactionRequest | UpdateTransactionRequest) => {
    if (editingTransaction) {
      await updateTransaction.mutateAsync({
        id: editingTransaction.id,
        req: data as UpdateTransactionRequest,
      });
    } else {
      await createTransaction.mutateAsync(data as CreateTransactionRequest);
    }
    setIsFormOpen(false);
    setEditingTransaction(undefined);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handlePageChange = (page: number) => {
    setFilters((f) => ({ ...f, page }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Track your income and expenses</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <button
            onClick={() => {
              setEditingTransaction(undefined);
              setIsFormOpen(true);
            }}
            className="mb-6 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
          >
            + New Transaction
          </button>

          <TransactionFilterBar filters={filters} onChange={setFilters} />

          <TransactionList
            filters={filters}
            onEdit={handleEdit}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <TransactionForm
        onSubmit={handleFormSubmit}
        defaultValues={editingTransaction}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(undefined);
        }}
        isLoading={createTransaction.isPending || updateTransaction.isPending}
        error={createTransaction.error?.message || updateTransaction.error?.message || null}
      />
    </div>
  );
}

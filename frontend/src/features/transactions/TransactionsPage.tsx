import { useState } from 'react';
import { Plus } from 'lucide-react';
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
    <div className="py-8">
      {/* Page header */}
      <div className="mb-8 pl-2 border-l-4 border-indigo-600">
        <h1 className="text-4xl font-bold text-slate-900">Transactions</h1>
        <p className="text-slate-500 mt-2">Track your income and expenses</p>
      </div>

      {/* Header + New button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => {
            setEditingTransaction(undefined);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm"
        >
          <Plus size={18} />
          New Transaction
        </button>
      </div>

      {/* Filter bar */}
      <TransactionFilterBar filters={filters} onChange={setFilters} />

      {/* Transactions list */}
      <TransactionList
        filters={filters}
        onEdit={handleEdit}
        onPageChange={handlePageChange}
      />

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

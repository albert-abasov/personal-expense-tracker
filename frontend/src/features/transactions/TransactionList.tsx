import { Pencil, Trash2, Receipt } from 'lucide-react';
import { useTransactions, useDeleteTransaction } from './useTransactionQueries';
import type { Transaction } from '@/types/transactions';
import type { TransactionFilters } from '@/types/transactions';
import { CurrencyAmount, Badge } from '@/components';

interface TransactionListProps {
  filters: TransactionFilters;
  onEdit: (transaction: Transaction) => void;
  onPageChange: (page: number) => void;
}

export function TransactionList({ filters, onEdit, onPageChange }: TransactionListProps) {
  const { data, isLoading, error } = useTransactions(filters);
  const deleteTransaction = useDeleteTransaction();

  const handleDelete = (id: string) => {
    if (confirm('Delete this transaction?')) {
      deleteTransaction.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center text-slate-500">
        Loading transactions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center text-red-600">
        Error loading transactions
      </div>
    );
  }

  const { data: rows = [], page = 0, size = 20, total = 0 } = data ?? {};
  const totalPages = Math.ceil(total / size);

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
        <Receipt size={40} className="text-slate-300 mx-auto mb-4" />
        <p className="font-medium text-slate-700">No transactions found</p>
        <p className="text-sm text-slate-500">Create one to get started!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 font-semibold">
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Title</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(tx.transactionDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{tx.title}</td>
                  <td className="px-6 py-4 text-sm">
                    <Badge label={tx.categoryName} />
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-800">
                    <CurrencyAmount amount={tx.amount} currency={tx.currency} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onEdit(tx)}
                      className="inline-flex items-center justify-center p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      disabled={deleteTransaction.isPending}
                      className="inline-flex items-center justify-center p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-between items-center text-sm text-slate-600">
          <span className="font-medium">{total} transactions</span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-slate-600 font-medium">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

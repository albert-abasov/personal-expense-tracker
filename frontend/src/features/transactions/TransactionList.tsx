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

  if (isLoading) return <div className="text-center text-gray-500 py-8">Loading...</div>;
  if (error) return <div className="text-center text-red-600 py-8">Error loading transactions</div>;

  const { data: rows = [], page = 0, size = 20, total = 0 } = data ?? {};
  const totalPages = Math.ceil(total / size);

  if (rows.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <p>No transactions found. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-left font-semibold">Title</th>
              <th className="px-4 py-3 text-left font-semibold">Category</th>
              <th className="px-4 py-3 text-right font-semibold">Amount</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tx) => (
              <tr key={tx.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-xs text-gray-500">{tx.transactionDate}</td>
                <td className="px-4 py-3">{tx.title}</td>
                <td className="px-4 py-3 text-xs">
                  <Badge label={tx.categoryName} color="#3B82F6" />
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  <CurrencyAmount amount={tx.amount} currency={tx.currency} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onEdit(tx)}
                    className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    disabled={deleteTransaction.isPending}
                    className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4 text-sm text-gray-600">
          <span>{total} total</span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useCategories } from '../categories/useCategoryQueries';
import type { Transaction, CreateTransactionRequest, UpdateTransactionRequest } from '@/types/transactions';

interface TransactionFormProps {
  onSubmit: (data: CreateTransactionRequest | UpdateTransactionRequest) => Promise<void>;
  defaultValues?: Partial<Transaction>;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function TransactionForm({
  onSubmit,
  defaultValues,
  isOpen,
  onClose,
  isLoading = false,
  error = null,
}: TransactionFormProps) {
  const { data: categories = [] } = useCategories();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      setTitle(defaultValues.title ?? '');
      setAmount(defaultValues.amount != null ? String(defaultValues.amount) : '');
      setTransactionDate(defaultValues.transactionDate ?? '');
      setCategoryId(defaultValues.categoryId ?? '');
      setNotes(defaultValues.notes ?? '');
    } else {
      setTitle('');
      setAmount('');
      setTransactionDate(new Date().toISOString().slice(0, 10));
      setCategoryId(categories[0]?.id ?? '');
      setNotes('');
    }
  }, [defaultValues, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        amount: parseFloat(amount),
        currency: 'USD',
        transactionDate: transactionDate,
        categoryId: categoryId,
        notes: notes.trim() || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const busy = isSubmitting || isLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold mb-4">
          {defaultValues ? 'Edit Transaction' : 'New Transaction'}
        </h2>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>
          )}

          <div className="mb-4">
            <label htmlFor="tx-title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <input
              id="tx-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Coffee"
              maxLength={255}
              required
              disabled={busy}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="tx-amount" className="block text-sm font-medium mb-2">
              Amount (USD)
            </label>
            <input
              id="tx-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              disabled={busy}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="tx-date" className="block text-sm font-medium mb-2">
              Date
            </label>
            <input
              id="tx-date"
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
              disabled={busy}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="tx-category" className="block text-sm font-medium mb-2">
              Category
            </label>
            <select
              id="tx-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              disabled={busy}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="tx-notes" className="block text-sm font-medium mb-2">
              Notes (optional)
            </label>
            <textarea
              id="tx-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional details..."
              maxLength={2000}
              rows={3}
              disabled={busy}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !title.trim() || !amount || !categoryId || !transactionDate}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

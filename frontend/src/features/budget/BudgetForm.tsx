import { useState } from 'react'
import { useUpsertBudget } from './useBudgetQueries'
import { UpsertBudgetRequest } from '@/types/budget'

interface BudgetFormProps {
  isOpen: boolean
  onClose: () => void
  year: number
  month: number
  defaultValues?: UpsertBudgetRequest
  isLoading?: boolean
}

export default function BudgetForm({
  isOpen,
  onClose,
  year,
  month,
  defaultValues,
  isLoading,
}: BudgetFormProps) {
  const { mutateAsync } = useUpsertBudget()
  const [amount, setAmount] = useState(defaultValues?.amount?.toString() ?? '')
  const [currency, setCurrency] = useState(defaultValues?.currency ?? 'USD')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const amountNum = parseFloat(amount)
      if (!amount || isNaN(amountNum) || amountNum <= 0) {
        setError('Amount must be a valid number greater than 0')
        setIsSubmitting(false)
        return
      }

      if (currency.length !== 3) {
        setError('Currency must be a 3-letter ISO code')
        setIsSubmitting(false)
        return
      }

      await mutateAsync({
        year,
        month,
        request: { amount: amountNum, currency },
      })

      setAmount('')
      setCurrency('USD')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save budget')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold mb-4">
          {defaultValues ? 'Edit Budget' : 'Set Budget'}
        </h2>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <input
              id="currency"
              type="text"
              maxLength={3}
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="USD"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting || isLoading ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

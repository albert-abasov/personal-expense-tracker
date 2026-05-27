import { useBudgetSummary, useUpsertBudget } from './useBudgetQueries'
import { useState } from 'react'
import BudgetForm from './BudgetForm'

interface BudgetSummaryCardProps {
  year: number
  month: number
}

export default function BudgetSummaryCard({ year, month }: BudgetSummaryCardProps) {
  const { data: summary, isLoading, error } = useBudgetSummary(year, month)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { isPending: isSubmitting } = useUpsertBudget()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-24 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded">
          {error instanceof Error ? error.message : 'Error loading budget summary'}
        </div>
      </div>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Budget Summary</h2>

        {!summary.hasBudget ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No budget set for this month</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Set Budget
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Budget</p>
                <p className="text-xl font-semibold">
                  {summary.currency} {summary.budgetAmount?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Spent</p>
                <p className="text-xl font-semibold">
                  {summary.currency} {summary.totalSpent?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p
                  className={`text-xl font-semibold ${
                    (summary.remaining ?? 0) < 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {summary.currency} {summary.remaining?.toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Usage</span>
                <span className="text-sm font-medium">{summary.usagePercent?.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-colors ${
                    (summary.usagePercent ?? 0) >= 100
                      ? 'bg-red-500'
                      : (summary.usagePercent ?? 0) >= 90
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(summary.usagePercent ?? 0, 100)}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => setIsFormOpen(true)}
              className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              Edit Budget
            </button>
          </div>
        )}
      </div>

      <BudgetForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        year={year}
        month={month}
        defaultValues={
          summary.hasBudget
            ? { amount: summary.budgetAmount ?? 0, currency: summary.currency }
            : undefined
        }
        isLoading={isSubmitting}
      />
    </>
  )
}

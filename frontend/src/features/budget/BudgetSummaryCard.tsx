import { useBudgetSummary, useUpsertBudget } from './useBudgetQueries'
import { useState } from 'react'
import BudgetForm from './BudgetForm'
import { CurrencyAmount } from '@/components'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface BudgetSummaryCardProps {
  year: number
  month: number
}

export default function BudgetSummaryCard({ year, month }: BudgetSummaryCardProps) {
  const { data: summary, isLoading, error } = useBudgetSummary(year, month)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { isPending: isSubmitting } = useUpsertBudget()
  const monthName = MONTH_NAMES[month - 1]

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="h-24 bg-slate-200 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
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
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="mb-4">
          <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">{monthName} Budget</span>
        </div>

        {!summary.hasBudget ? (
          <div className="text-center py-8">
            <p className="text-slate-600 mb-4">No budget set for this month</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
            >
              Set Budget
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">Budget</p>
                <p className="text-lg font-bold text-slate-800">
                  {summary.budgetAmount !== null ? (
                    <CurrencyAmount amount={summary.budgetAmount} currency={summary.currency} />
                  ) : (
                    '—'
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">Spent</p>
                <p className="text-lg font-bold text-slate-800">
                  {summary.totalSpent !== null ? (
                    <CurrencyAmount amount={summary.totalSpent} currency={summary.currency} />
                  ) : (
                    '—'
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">Remaining</p>
                <p
                  className={`text-lg font-bold ${
                    (summary.remaining ?? 0) < 0 ? 'text-red-500' : 'text-emerald-600'
                  }`}
                >
                  {summary.remaining !== null ? (
                    <CurrencyAmount amount={summary.remaining} currency={summary.currency} />
                  ) : (
                    '—'
                  )}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">Usage</span>
                <span className="text-sm font-semibold text-slate-700">{summary.usagePercent?.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    (summary.usagePercent ?? 0) >= 100
                      ? 'bg-red-500'
                      : (summary.usagePercent ?? 0) >= 90
                        ? 'bg-amber-500'
                        : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.min(summary.usagePercent ?? 0, 100)}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => setIsFormOpen(true)}
              className="w-full px-3 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
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

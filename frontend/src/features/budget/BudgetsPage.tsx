import { useState } from 'react'
import BudgetSummaryCard from './BudgetSummaryCard'
import { useAllBudgets, useDeleteBudget } from './useBudgetQueries'
import { CurrencyAmount } from '@/components'

export default function BudgetsPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  const { data: budgets, isLoading } = useAllBudgets()
  const { mutateAsync: deleteBudget } = useDeleteBudget()

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  const handleDeleteBudget = async (budgetYear: number, budgetMonth: number) => {
    if (!window.confirm(`Delete budget for ${budgetYear}-${String(budgetMonth).padStart(2, '0')}?`)) {
      return
    }

    try {
      await deleteBudget({ year: budgetYear, month: budgetMonth })
    } catch (err) {
      alert(`Error deleting budget: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const monthName = new Date(year, month - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">Budgets</h1>

        {/* Month selector */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              ← Prev
            </button>
            <span className="text-lg font-semibold">{monthName}</span>
            <button
              onClick={handleNextMonth}
              className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Budget summary for current month */}
        <BudgetSummaryCard year={year} month={month} />
      </div>

      {/* All budgets table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">All Budgets</h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading budgets...</div>
        ) : budgets && budgets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Year</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Month</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((budget) => (
                  <tr key={budget.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">{budget.year}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {String(budget.month).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                      <CurrencyAmount amount={budget.amount} currency={budget.currency} />
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <button
                        onClick={() => handleDeleteBudget(budget.year, budget.month)}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">No budgets created yet</div>
        )}
      </div>
    </div>
  )
}

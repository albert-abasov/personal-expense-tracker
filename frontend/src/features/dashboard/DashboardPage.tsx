import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBudgetSummary } from '../budget/useBudgetQueries';
import { useTransactions } from '../transactions/useTransactionQueries';
import BudgetSummaryCard from '../budget/BudgetSummaryCard';
import { CurrencyAmount, LoadingSpinner, Badge } from '@/components';

export function DashboardPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { data: summary } = useBudgetSummary(year, month);
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions({
    size: 5,
    sort: 'transaction_date,desc',
    dateRange: 'this_month',
  });

  const transactions = transactionsData?.data || [];
  const totalTransactions = transactionsData?.total || 0;

  // Calculate stats
  const totalSpent = summary?.totalSpent || 0;
  const transactionCount = transactions.length;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your expense tracker</p>
      </div>

      {/* Top row: Budget + Quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <BudgetSummaryCard year={year} month={month} />
        </div>

        {/* Quick stat cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">This Month's Spending</p>
          <div className="text-2xl font-bold text-gray-900">
            {summary ? (
              <CurrencyAmount amount={totalSpent} currency={summary.currency} />
            ) : (
              <span>—</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Transactions</p>
          <div className="text-2xl font-bold text-gray-900">{totalTransactions}</div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <Link to="/transactions" className="text-sm text-blue-600 hover:text-blue-700">
            View all →
          </Link>
        </div>

        {transactionsLoading ? (
          <div className="p-6 flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">No transactions this month</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-gray-200 text-left text-sm font-medium text-gray-700">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(tx.transactionDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{tx.title}</td>
                    <td className="px-6 py-4 text-sm">
                      <Badge label={tx.categoryName} color={tx.categoryName ? '#3B82F6' : undefined} />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                      <CurrencyAmount amount={tx.amount} currency={tx.currency} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

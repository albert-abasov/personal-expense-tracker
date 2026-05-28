import { Link } from 'react-router-dom';
import { DollarSign, Receipt } from 'lucide-react';
import { useBudgetSummary } from '../budget/useBudgetQueries';
import { useTransactions } from '../transactions/useTransactionQueries';
import { useAuth } from '../auth/AuthContext';
import BudgetSummaryCard from '../budget/BudgetSummaryCard';
import { CurrencyAmount, LoadingSpinner, Badge } from '@/components';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function DashboardPage() {
  const { user } = useAuth();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthName = MONTH_NAMES[now.getMonth()];

  const { data: summary } = useBudgetSummary(year, month);
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions({
    size: 5,
    sort: 'transaction_date,desc',
    dateRange: 'this_month',
  });

  const transactions = transactionsData?.data || [];
  const totalTransactions = transactionsData?.total || 0;
  const totalSpent = summary?.totalSpent || 0;
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="py-8">
      {/* Page header */}
      <div className="mb-8 pl-2 border-l-4 border-indigo-600">
        <h1 className="text-4xl font-bold text-slate-900">Good morning, {firstName}!</h1>
        <p className="text-slate-500 mt-2">Here's your financial overview for {monthName} {year}</p>
      </div>

      {/* Top row: Budget + Quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <BudgetSummaryCard year={year} month={month} />
        </div>

        {/* Spending card */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">This Month's Spending</p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <DollarSign size={16} className="text-indigo-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {summary ? (
              <CurrencyAmount amount={totalSpent} currency={summary.currency} />
            ) : (
              <span>—</span>
            )}
          </div>
        </div>

        {/* Transactions card */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">This Month's Transactions</p>
            </div>
            <div className="p-2 bg-violet-100 rounded-lg">
              <Receipt size={16} className="text-violet-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800">{totalTransactions}</div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">Recent Transactions</h2>
          <Link to="/transactions" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View all →
          </Link>
        </div>

        {transactionsLoading ? (
          <div className="p-6 flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium">No transactions this month</p>
            <p className="text-slate-500 text-sm mt-1">Start tracking your expenses to see them here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 font-semibold">
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Title</th>
                  <th className="px-6 py-4 text-left">Category</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(tx.transactionDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{tx.title}</td>
                    <td className="px-6 py-4 text-sm">
                      <Badge label={tx.categoryName} />
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 text-right">
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

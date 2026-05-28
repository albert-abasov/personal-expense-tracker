import { useCategories } from '../categories/useCategoryQueries';
import type { TransactionFilters } from '@/types/transactions';

interface TransactionFilterBarProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

export function TransactionFilterBar({ filters, onChange }: TransactionFilterBarProps) {
  const { data: categories = [] } = useCategories();

  return (
    <div className="mb-6 flex flex-wrap gap-2 items-center">
      <input
        type="text"
        placeholder="Search title or notes..."
        value={filters.q ?? ''}
        onChange={(e) => onChange({ ...filters, q: e.target.value || undefined, page: 0 })}
        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-56"
      />

      <select
        value={filters.categoryId ?? ''}
        onChange={(e) => onChange({ ...filters, categoryId: e.target.value || undefined, page: 0 })}
        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">All categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        value={filters.dateRange ?? ''}
        onChange={(e) =>
          onChange({
            ...filters,
            dateRange: (e.target.value as 'this_month' | 'last_month') || undefined,
            dateFrom: undefined,
            dateTo: undefined,
            page: 0,
          })
        }
        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">All time</option>
        <option value="this_month">This month</option>
        <option value="last_month">Last month</option>
      </select>

      {!filters.dateRange && (
        <>
          <input
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined, page: 0 })}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <input
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined, page: 0 })}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </>
      )}

      <button
        onClick={() => onChange({})}
        className="px-3 py-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors"
      >
        Clear filters
      </button>
    </div>
  );
}

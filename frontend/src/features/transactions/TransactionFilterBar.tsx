import { useCategories } from '../categories/useCategoryQueries';
import type { TransactionFilters } from '@/types/transactions';

interface TransactionFilterBarProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

export function TransactionFilterBar({ filters, onChange }: TransactionFilterBarProps) {
  const { data: categories = [] } = useCategories();

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <input
        type="text"
        placeholder="Search title or notes..."
        value={filters.q ?? ''}
        onChange={(e) => onChange({ ...filters, q: e.target.value || undefined, page: 0 })}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
      />

      <select
        value={filters.categoryId ?? ''}
        onChange={(e) => onChange({ ...filters, categoryId: e.target.value || undefined, page: 0 })}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined, page: 0 })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </>
      )}

      <button
        onClick={() => onChange({})}
        className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Clear filters
      </button>
    </div>
  );
}

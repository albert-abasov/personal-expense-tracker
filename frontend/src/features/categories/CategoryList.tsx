import { Tag, Pencil, Trash2 } from 'lucide-react'
import { useCategories } from './useCategoryQueries'
import type { Category } from '@/types/categories'

interface CategoryListProps {
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
}

export function CategoryList({ onEdit, onDelete, isDeleting = false }: CategoryListProps) {
  const { data: categories = [], isLoading, error } = useCategories()

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      onDelete(id)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center text-slate-500">
        Loading categories...
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center text-red-600">
        Error loading categories
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
        <Tag size={40} className="text-slate-300 mx-auto mb-4" />
        <p className="font-medium text-slate-700">No categories yet</p>
        <p className="text-sm text-slate-500">Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 font-semibold">
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Created</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-slate-400" />
                    {category.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(category.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onEdit(category)}
                    className="inline-flex items-center justify-center p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={isDeleting}
                    className="inline-flex items-center justify-center p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

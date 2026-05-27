import { useCategories, useDeleteCategory } from './useCategoryQueries'
import type { Category } from '@/types/categories'

interface CategoryListProps {
  onEdit: (category: Category) => void
}

export function CategoryList({ onEdit }: CategoryListProps) {
  const { data: categories = [], isLoading, error } = useCategories()
  const deleteCategory = useDeleteCategory()

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategory.mutate(id)
    }
  }

  if (isLoading) {
    return <div className="text-center text-gray-500 py-8">Loading categories...</div>
  }

  if (error) {
    return <div className="text-center text-red-600 py-8">Error loading categories</div>
  }

  if (categories.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <p>No categories yet. Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left font-semibold">Name</th>
            <th className="px-4 py-3 text-left font-semibold">Color</th>
            <th className="px-4 py-3 text-left font-semibold">Created</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3">{category.name}</td>
              <td className="px-4 py-3">
                {category.color ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-xs text-gray-500">{category.color}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {new Date(category.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onEdit(category)}
                  className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  disabled={deleteCategory.isPending}
                  className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CategoryList } from './CategoryList'
import { CategoryForm } from './CategoryForm'
import { CategoryDeleteGuard } from './CategoryDeleteGuard'
import { useCreateCategory, useUpdateCategory, useDeleteCategory } from './useCategoryQueries'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/categories'

export function CategoriesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleteGuardOpen, setIsDeleteGuardOpen] = useState(false)

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const handleFormSubmit = async (data: CreateCategoryRequest | UpdateCategoryRequest) => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          req: data as UpdateCategoryRequest,
        })
      } else {
        await createCategory.mutateAsync(data as CreateCategoryRequest)
      }
      setIsFormOpen(false)
      setEditingCategory(undefined)
    } catch (err) {
      const error = err as any
      if (error?.response?.status === 409) {
        throw new Error(error.response.data?.details?.error || 'Category name already exists')
      }
      throw error
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  const handleDeleteAttempt = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id)
    } catch (err) {
      const error = err as any
      if (error?.response?.status === 409) {
        setDeleteError(error.response.data?.details?.error || 'Cannot delete this category')
        setIsDeleteGuardOpen(true)
      } else {
        setDeleteError(error?.message || 'Failed to delete category')
        setIsDeleteGuardOpen(true)
      }
    }
  }

  return (
    <div className="py-8">
      {/* Page header */}
      <div className="mb-8 pl-2 border-l-4 border-indigo-600">
        <h1 className="text-4xl font-bold text-slate-900">Categories</h1>
        <p className="text-slate-500 mt-2">Manage your expense categories</p>
      </div>

      {/* Header + New button */}
      <div className="mb-6 flex justify-between items-center">
        <div /> {/* Empty spacer for alignment */}
        <button
          onClick={() => {
            setEditingCategory(undefined)
            setIsFormOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm"
        >
          <Plus size={18} />
          New Category
        </button>
      </div>

      {/* Categories list */}
      <CategoryList
        onEdit={handleEdit}
        onDelete={handleDeleteAttempt}
        isDeleting={deleteCategory.isPending}
      />

      <CategoryForm
        onSubmit={handleFormSubmit}
        defaultValues={editingCategory}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingCategory(undefined)
        }}
        isLoading={createCategory.isPending || updateCategory.isPending}
        error={createCategory.error?.message || updateCategory.error?.message || null}
      />

      <CategoryDeleteGuard
        isOpen={isDeleteGuardOpen}
        onClose={() => {
          setIsDeleteGuardOpen(false)
          setDeleteError(null)
        }}
        error={deleteError}
      />
    </div>
  )
}

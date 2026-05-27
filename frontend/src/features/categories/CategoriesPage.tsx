import { useState } from 'react'
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage your expense categories</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <button
            onClick={() => {
              setEditingCategory(undefined)
              setIsFormOpen(true)
            }}
            className="mb-6 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
          >
            + New Category
          </button>

          <CategoryList onEdit={handleEdit} />
        </div>
      </div>

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

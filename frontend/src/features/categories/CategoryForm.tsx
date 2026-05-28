import { useState, useEffect } from 'react'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/categories'

interface CategoryFormProps {
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => Promise<void>
  defaultValues?: Partial<Category>
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
  error?: string | null
}

export function CategoryForm({
  onSubmit,
  defaultValues,
  isOpen,
  onClose,
  isLoading = false,
  error = null,
}: CategoryFormProps) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (defaultValues) {
      setName(defaultValues.name || '')
    } else {
      setName('')
    }
  }, [defaultValues, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({ name: name.trim() })
      setName('')
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-4 mb-6">
          {defaultValues ? 'Edit Category' : 'New Category'}
        </h2>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isSubmitting || isLoading}
              required
              maxLength={100}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading || !name.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

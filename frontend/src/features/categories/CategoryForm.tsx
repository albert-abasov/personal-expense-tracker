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
  const [color, setColor] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (defaultValues) {
      setName(defaultValues.name || '')
      setColor(defaultValues.color || '')
    } else {
      setName('')
      setColor('')
    }
  }, [defaultValues, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        color: color.trim() || undefined,
      })
      setName('')
      setColor('')
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold mb-4">
          {defaultValues ? 'Edit Category' : 'New Category'}
        </h2>

        <form onSubmit={handleSubmit}>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>}

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Groceries"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting || isLoading}
              required
              maxLength={100}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="color" className="block text-sm font-medium mb-2">
              Color (optional)
            </label>
            <div className="flex gap-3 items-end">
              <input
                id="color"
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#FF0000"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting || isLoading}
                pattern="^#[0-9A-Fa-f]{6}$"
                maxLength={7}
              />
              {color && /^#[0-9A-Fa-f]{6}$/.test(color) && (
                <div
                  className="w-8 h-8 rounded border-2 border-gray-300"
                  style={{ backgroundColor: color }}
                />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Format: #RRGGBB (e.g., #22C55E)</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading || !name.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

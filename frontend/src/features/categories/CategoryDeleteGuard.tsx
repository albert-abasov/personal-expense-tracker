interface CategoryDeleteGuardProps {
  isOpen: boolean
  onClose: () => void
  error: string | null
}

export function CategoryDeleteGuard({ isOpen, onClose, error }: CategoryDeleteGuardProps) {
  if (!isOpen || !error) return null

  const isConflict = error.includes('associated transactions') || error.includes('Conflict')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-4 mb-6">
          Cannot Delete Category
        </h2>

        {isConflict ? (
          <p className="text-sm text-slate-700 mb-6">
            This category has transactions associated with it. Please reassign or delete those
            transactions first.
          </p>
        ) : (
          <p className="text-sm text-slate-700 mb-6">{error}</p>
        )}

        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

interface CategoryDeleteGuardProps {
  isOpen: boolean
  onClose: () => void
  error: string | null
}

export function CategoryDeleteGuard({ isOpen, onClose, error }: CategoryDeleteGuardProps) {
  if (!isOpen || !error) return null

  const isConflict = error.includes('associated transactions') || error.includes('Conflict')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold mb-4">Cannot Delete Category</h2>

        {isConflict ? (
          <div>
            <p className="text-sm text-gray-700 mb-4">
              This category has transactions associated with it. Please reassign or delete those
              transactions first.
            </p>
            <p className="text-xs text-gray-500 mb-6">
              Future versions will allow bulk reassignment or deletion of transactions.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-700 mb-6">{error}</p>
        )}

        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  )
}

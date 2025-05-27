import { useState } from 'react'
import { TrackingCriteria } from '../types/vessel'
import { TRACKING_CRITERIA_CATEGORIES } from '@/constants/tracking-criteria'
import CriteriaCheckbox from './CriteriaCheckbox'
import { cn } from '@/utils/cn'

type TrackingCriteriaCategory = keyof typeof TRACKING_CRITERIA_CATEGORIES

interface CriteriaCategoryGroupProps {
  category: TrackingCriteriaCategory
  criteria: Array<TrackingCriteria & { creditCost?: number }>
  selectedCriteria: string[]
  onToggleCriteria: (criteriaId: string) => void
  collapsed?: boolean
  disabled?: boolean
  showCreditCosts?: boolean
  categoryDescription?: string
  className?: string
}

export default function CriteriaCategoryGroup({
  category,
  criteria,
  selectedCriteria,
  onToggleCriteria,
  collapsed: initialCollapsed = false,
  disabled = false,
  showCreditCosts = false,
  categoryDescription,
  className,
}: CriteriaCategoryGroupProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed)

  const selectedCount = criteria.filter((c) =>
    selectedCriteria.includes(c.id)
  ).length
  const allSelected = selectedCount === criteria.length && criteria.length > 0

  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all
      criteria.forEach((criterion) => {
        if (selectedCriteria.includes(criterion.id)) {
          onToggleCriteria(criterion.id)
        }
      })
    } else {
      // Select all
      criteria.forEach((criterion) => {
        if (!selectedCriteria.includes(criterion.id)) {
          onToggleCriteria(criterion.id)
        }
      })
    }
  }

  const totalCreditCost = showCreditCosts
    ? criteria.reduce((sum, c) => sum + (c.creditCost || 0), 0)
    : 0

  return (
    <div className={cn('border border-gray-200 rounded-lg', className)}>
      <button
        type="button"
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-expanded={!isCollapsed}
        aria-label={`${category} category, ${selectedCount} of ${criteria.length} selected`}
      >
        <div className="flex items-center space-x-3">
          <svg
            className={cn(
              'h-5 w-5 text-gray-400 transition-transform',
              isCollapsed ? '-rotate-90' : 'rotate-0'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-gray-900">{TRACKING_CRITERIA_CATEGORIES[category].name}</h3>
            {categoryDescription && (
              <p className="text-xs text-gray-500 mt-0.5">{categoryDescription}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {selectedCount} of {criteria.length} selected
          </span>
          {showCreditCosts && totalCreditCost > 0 && (
            <span className="text-sm text-gray-600 font-medium">
              Total: {totalCreditCost} credits/day
            </span>
          )}
        </div>
      </button>

      {!isCollapsed && (
        <div className="px-4 pb-4">
          {criteria.length > 0 ? (
            <>
              <div className="flex justify-end mb-3">
                <button
                  type="button"
                  className={cn(
                    'text-sm font-medium transition-colors',
                    disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-primary-600 hover:text-primary-700'
                  )}
                  onClick={handleSelectAll}
                  disabled={disabled}
                >
                  {allSelected ? 'Deselect all' : 'Select all'}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {criteria.map((criterion) => (
                  <CriteriaCheckbox
                    key={criterion.id}
                    criterion={criterion}
                    checked={selectedCriteria.includes(criterion.id)}
                    onChange={() => onToggleCriteria(criterion.id)}
                    disabled={disabled}
                    creditCost={showCreditCosts ? criterion.creditCost : undefined}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No criteria available
            </p>
          )}
        </div>
      )}
    </div>
  )
}
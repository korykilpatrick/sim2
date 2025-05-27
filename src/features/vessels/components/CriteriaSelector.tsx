import { TrackingCriteria } from '../types/vessel'
import { cn } from '@/utils/cn'
import { TRACKING_CRITERIA_CATEGORIES } from '@/constants/tracking-criteria'

type TrackingCriteriaCategory = keyof typeof TRACKING_CRITERIA_CATEGORIES

interface CriteriaSelectorProps {
  criteria: TrackingCriteria[]
  selectedCriteria: string[]
  onToggleCriteria: (criteriaId: string) => void
  groupByCategory?: boolean
  showDescription?: boolean
}

export default function CriteriaSelector({
  criteria,
  selectedCriteria,
  onToggleCriteria,
  groupByCategory = false,
  showDescription = true,
}: CriteriaSelectorProps) {
  // Helper to render a single criterion
  const renderCriterion = (criterion: TrackingCriteria) => (
    <div
      key={criterion.id}
      className={cn(
        'border rounded-lg p-4 cursor-pointer transition-all',
        selectedCriteria.includes(criterion.id)
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 hover:border-gray-400',
      )}
      onClick={() => onToggleCriteria(criterion.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggleCriteria(criterion.id)
        }
      }}
      aria-pressed={selectedCriteria.includes(criterion.id)}
    >
      <div className="flex items-start">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          checked={selectedCriteria.includes(criterion.id)}
          onChange={() => onToggleCriteria(criterion.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${criterion.name}`}
        />
        <div className="ml-3 flex-1">
          <p className="font-medium text-gray-900">{criterion.name}</p>
          {showDescription && (
            <p className="text-sm text-gray-500 mt-1">
              {criterion.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  // Group criteria by category if requested
  if (groupByCategory) {
    const categorizedCriteria = new Map<TrackingCriteriaCategory, TrackingCriteria[]>()
    
    // Group criteria by their category
    criteria.forEach((criterion) => {
      // Find which category this criterion belongs to
      const categoryEntry = Object.entries(TRACKING_CRITERIA_CATEGORIES).find(
        ([_, categoryData]) => 
          (categoryData.criteria as readonly string[]).includes(criterion.type)
      )
      
      if (categoryEntry) {
        const [category] = categoryEntry as [TrackingCriteriaCategory, typeof TRACKING_CRITERIA_CATEGORIES[TrackingCriteriaCategory]]
        if (!categorizedCriteria.has(category)) {
          categorizedCriteria.set(category, [])
        }
        categorizedCriteria.get(category)!.push(criterion)
      }
    })

    return (
      <div className="space-y-6">
        {Array.from(categorizedCriteria.entries()).map(([category, categoryCriteria]) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">
              {TRACKING_CRITERIA_CATEGORIES[category].name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryCriteria.map(renderCriterion)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Default ungrouped layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {criteria.map(renderCriterion)}
    </div>
  )
}

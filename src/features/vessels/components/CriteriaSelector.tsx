import { TrackingCriteria } from '../types/vessel'
import { cn } from '@/utils/cn'

interface CriteriaSelectorProps {
  criteria: TrackingCriteria[]
  selectedCriteria: string[]
  onToggleCriteria: (criteriaId: string) => void
}

export default function CriteriaSelector({
  criteria,
  selectedCriteria,
  onToggleCriteria,
}: CriteriaSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {criteria.map((criterion) => (
        <div
          key={criterion.id}
          className={cn(
            'border rounded-lg p-4 cursor-pointer transition-all',
            selectedCriteria.includes(criterion.id)
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400',
          )}
          onClick={() => onToggleCriteria(criterion.id)}
        >
          <div className="flex items-start">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={selectedCriteria.includes(criterion.id)}
              onChange={() => onToggleCriteria(criterion.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-900">{criterion.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {criterion.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

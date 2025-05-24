import { useState } from 'react'
import { Card } from '@/components/common'
import { useMonitoringCriteria } from '../../hooks/useAreaMonitoring'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'
import { AlertCircle, Check } from 'lucide-react'
import type { MonitoringCriteria } from '../../types'

interface MonitoringCriteriaSelectorProps {
  selectedCriteria: string[]
  onCriteriaChange: (criteria: string[]) => void
}

export function MonitoringCriteriaSelector({
  selectedCriteria,
  onCriteriaChange,
}: MonitoringCriteriaSelectorProps) {
  const { data: criteriaData, isLoading } = useMonitoringCriteria()
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const criteria: MonitoringCriteria[] = criteriaData || []

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    )
  }

  const toggleCriterion = (criterionId: string) => {
    onCriteriaChange(
      selectedCriteria.includes(criterionId)
        ? selectedCriteria.filter((id) => id !== criterionId)
        : [...selectedCriteria, criterionId],
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  // Group criteria by category
  const categorizedCriteria = criteria.reduce(
    (
      acc: Record<string, MonitoringCriteria[]>,
      criterion: MonitoringCriteria,
    ) => {
      const category = criterion.category || 'Other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(criterion)
      return acc
    },
    {} as Record<string, MonitoringCriteria[]>,
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Select what you want to monitor in this area
        </p>
        {selectedCriteria.length > 0 && (
          <span className="text-sm font-medium text-primary-600">
            {selectedCriteria.length} selected
          </span>
        )}
      </div>

      {Object.entries(categorizedCriteria).map(([category, items]) => (
        <Card key={category} className="overflow-hidden">
          <button
            className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
            onClick={() => toggleCategory(category)}
          >
            <span className="font-medium text-gray-900">{category}</span>
            <span className="text-sm text-gray-500">
              {
                (items as MonitoringCriteria[]).filter((item) =>
                  selectedCriteria.includes(item.id),
                ).length
              }
              /{(items as MonitoringCriteria[]).length}
            </span>
          </button>

          {expandedCategories.includes(category) && (
            <div className="border-t border-gray-100">
              {(items as MonitoringCriteria[]).map((criterion) => (
                <label
                  key={criterion.id}
                  className="flex items-start p-4 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="mt-1 rounded border-gray-300 text-primary-600"
                    checked={selectedCriteria.includes(criterion.id)}
                    onChange={() => toggleCriterion(criterion.id)}
                  />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {criterion.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {criterion.description}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {criterion.creditsPerAlert} credits per alert
                    </p>
                  </div>
                  {selectedCriteria.includes(criterion.id) && (
                    <Check className="h-5 w-5 text-primary-600 ml-2" />
                  )}
                </label>
              ))}
            </div>
          )}
        </Card>
      ))}

      {selectedCriteria.length === 0 && (
        <div className="rounded-lg bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please select at least one monitoring criterion to continue.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

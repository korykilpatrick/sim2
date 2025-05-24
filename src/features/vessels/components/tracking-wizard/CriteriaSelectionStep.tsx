import { useQuery } from '@tanstack/react-query'
import { vesselsApi } from '../../services/vessels'
import { vesselKeys } from '../../hooks'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'
import Alert from '@/components/feedback/Alert'
import CriteriaSelector from '../CriteriaSelector'

interface CriteriaSelectionStepProps {
  selectedCriteria: string[]
  onCriteriaChange: (criteria: string[]) => void
}

export function CriteriaSelectionStep({
  selectedCriteria,
  onCriteriaChange,
}: CriteriaSelectionStepProps) {
  const {
    data: criteriaData,
    isLoading,
    error,
  } = useQuery({
    queryKey: vesselKeys.trackingCriteria(),
    queryFn: () => vesselsApi.getTrackingCriteria(),
  })

  const toggleCriteria = (criteriaId: string) => {
    const newCriteria = selectedCriteria.includes(criteriaId)
      ? selectedCriteria.filter((id) => id !== criteriaId)
      : [...selectedCriteria, criteriaId]
    onCriteriaChange(newCriteria)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Failed to load tracking criteria. Please try again."
      />
    )
  }

  const criteria = criteriaData || []

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-medium text-gray-900 mb-2">
          Choose tracking criteria
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select the activities and events you want to monitor for this vessel
        </p>
      </div>

      <CriteriaSelector
        criteria={criteria}
        selectedCriteria={selectedCriteria}
        onToggleCriteria={toggleCriteria}
      />

      {selectedCriteria.length === 0 && (
        <Alert
          type="warning"
          message="Please select at least one tracking criteria"
        />
      )}
    </div>
  )
}

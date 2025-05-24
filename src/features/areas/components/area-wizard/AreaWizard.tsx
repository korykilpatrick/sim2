import { useState } from 'react'
import { FormWizard, useWizard } from '@/components/forms/wizard'
import { AreaDefinitionStep } from './AreaDefinitionStep'
import { AreaConfigurationStep } from './AreaConfigurationStep'
import { AreaReviewStep } from './AreaReviewStep'
import type { CreateAreaRequest } from '../../types'

interface AreaWizardProps {
  onComplete: (data: CreateAreaRequest) => void
  onCancel: () => void
}

export function AreaWizard({ onComplete }: AreaWizardProps) {
  const [areaGeometry, setAreaGeometry] = useState<
    GeoJSON.Polygon | undefined
  >()
  const [areaName, setAreaName] = useState('')
  const [description, setDescription] = useState('')
  const [monitoringCriteria, setMonitoringCriteria] = useState<string[]>([])
  const [updateFrequency, setUpdateFrequency] = useState<3 | 6 | 12 | 24>(6)
  const [durationMonths, setDurationMonths] = useState(1)

  const handleComplete = () => {
    if (!areaGeometry || !areaName || monitoringCriteria.length === 0) return

    onComplete({
      name: areaName,
      description,
      geometry: areaGeometry,
      criteria: monitoringCriteria,
      updateFrequency,
      duration: durationMonths * 30, // Convert months to days
      alertsEnabled: true,
    })
  }

  const wizard = useWizard({
    steps: [
      {
        id: 'define',
        label: 'Define Area',
        description: 'Draw the area on the map',
      },
      {
        id: 'configure',
        label: 'Configure Monitoring',
        description: 'Set monitoring parameters',
      },
      {
        id: 'review',
        label: 'Review & Confirm',
        description: 'Review your configuration',
      },
    ],
    onComplete: handleComplete,
  })

  const handleStepValidation = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return areaGeometry !== undefined && areaName.length > 0
      case 1:
        return monitoringCriteria.length > 0
      case 2:
        return true
      default:
        return false
    }
  }

  return (
    <FormWizard
      wizard={wizard}
      onStepValidate={handleStepValidation}
      navigationClassName="mt-8"
    >
      <AreaDefinitionStep
        areaGeometry={areaGeometry}
        onAreaGeometryChange={setAreaGeometry}
        areaName={areaName}
        onAreaNameChange={setAreaName}
        description={description}
        onDescriptionChange={setDescription}
      />
      <AreaConfigurationStep
        monitoringCriteria={monitoringCriteria}
        onMonitoringCriteriaChange={setMonitoringCriteria}
        updateFrequency={updateFrequency}
        onUpdateFrequencyChange={setUpdateFrequency}
        durationMonths={durationMonths}
        onDurationMonthsChange={setDurationMonths}
        areaSize={areaGeometry ? calculateAreaSize(areaGeometry) : 0}
      />
      <AreaReviewStep
        areaName={areaName}
        description={description}
        areaGeometry={areaGeometry}
        monitoringCriteria={monitoringCriteria}
        updateFrequency={updateFrequency}
        durationMonths={durationMonths}
      />
    </FormWizard>
  )
}

// Helper function to calculate area size (simplified for now)
function calculateAreaSize(_geometry: GeoJSON.Polygon): number {
  // In a real implementation, this would use turf.js or similar
  // to calculate the actual area in square kilometers
  return 100 // Default 100 km² for now
}

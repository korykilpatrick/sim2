import React, { useState } from 'react'
import { FormWizard, WizardStep, useWizard } from '@/components/forms/wizard'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/common/Card'
import { VesselSelectionStep } from './VesselSelectionStep'
import { CriteriaSelectionStep } from './CriteriaSelectionStep'
import { DurationConfigStep } from './DurationConfigStep'
import { formatInputDate, addDuration } from '@/utils/date'
import type { Vessel } from '../../types'

export interface TrackingWizardData {
  vessel: Vessel | null
  criteria: string[]
  trackingDays: number
  endDate: string
}

interface TrackingWizardProps {
  onComplete: (data: TrackingWizardData) => void
  initialData?: Partial<TrackingWizardData>
}

export function TrackingWizard({
  onComplete,
  initialData,
}: TrackingWizardProps) {
  const [formData, setFormData] = useState<TrackingWizardData>({
    vessel: initialData?.vessel || null,
    criteria: initialData?.criteria || [],
    trackingDays: initialData?.trackingDays || 30,
    endDate:
      initialData?.endDate ||
      formatInputDate(addDuration(new Date(), 30, 'days')),
  })

  const wizard = useWizard({
    steps: [
      {
        id: 'vessel',
        label: 'Select Vessel',
        description: 'Choose a vessel to track',
      },
      {
        id: 'criteria',
        label: 'Tracking Criteria',
        description: 'Select what to monitor',
      },
      { id: 'duration', label: 'Duration', description: 'Set tracking period' },
    ],
    onComplete: () => onComplete(formData),
  })

  const canProceedFromVessel = formData.vessel !== null
  const canProceedFromCriteria = formData.criteria.length > 0
  const canComplete =
    canProceedFromVessel && canProceedFromCriteria && formData.trackingDays > 0

  const handleStepValidation = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return canProceedFromVessel
      case 1:
        return canProceedFromCriteria
      case 2:
        return canComplete
      default:
        return true
    }
  }

  React.useEffect(() => {
    if (canProceedFromVessel && wizard.currentStep === 0) {
      wizard.markStepComplete('vessel')
    }
    if (canProceedFromCriteria && wizard.currentStep === 1) {
      wizard.markStepComplete('criteria')
    }
    if (canComplete && wizard.currentStep === 2) {
      wizard.markStepComplete('duration')
    }
  }, [canProceedFromVessel, canProceedFromCriteria, canComplete, wizard])

  return (
    <FormWizard
      wizard={wizard}
      onStepValidate={handleStepValidation}
      contentClassName="min-h-[400px]"
    >
      <WizardStep>
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Select Vessel</CardTitle>
          </CardHeader>
          <CardContent>
            <VesselSelectionStep
              initialVessel={formData.vessel}
              onVesselSelect={(vessel) => setFormData({ ...formData, vessel })}
            />
          </CardContent>
        </Card>
      </WizardStep>

      <WizardStep>
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Select Tracking Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <CriteriaSelectionStep
              selectedCriteria={formData.criteria}
              onCriteriaChange={(criteria) =>
                setFormData({ ...formData, criteria })
              }
            />
          </CardContent>
        </Card>
      </WizardStep>

      <WizardStep>
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Configure Tracking Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <DurationConfigStep
              vessel={formData.vessel}
              selectedCriteria={formData.criteria}
              trackingDays={formData.trackingDays}
              endDate={formData.endDate}
              onDaysChange={(trackingDays) =>
                setFormData({ ...formData, trackingDays })
              }
              onEndDateChange={(endDate) =>
                setFormData({ ...formData, endDate })
              }
            />
          </CardContent>
        </Card>
      </WizardStep>
    </FormWizard>
  )
}

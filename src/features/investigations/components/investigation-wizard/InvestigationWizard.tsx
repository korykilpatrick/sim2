import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormWizard, useWizard } from '@/components/forms/wizard'
import { ScopeSelectionStep } from './ScopeSelectionStep'
import { DetailsConfigurationStep } from './DetailsConfigurationStep'
import { SourceSelectionStep } from './SourceSelectionStep'
import { ReviewSubmitStep } from './ReviewSubmitStep'
import { InvestigationRequest } from '../../types'
import { useCreateInvestigation } from '../../hooks/useInvestigations'
import Toast from '@/components/feedback/Toast'

export default function InvestigationWizard() {
  const navigate = useNavigate()
  const createInvestigation = useCreateInvestigation()
  const [showSuccess, setShowSuccess] = useState(false)
  const [investigationData, setInvestigationData] = useState<
    Partial<InvestigationRequest>
  >({
    scope: 'vessel',
    priority: 'standard',
    objectives: [],
    requestedSources: {
      satelliteImagery: true,
      osint: true,
      sigint: true,
      webcams: false,
      humint: false,
      proprietaryTools: true,
    },
    contactPreferences: {
      email: true,
      phone: false,
      platformMessage: true,
    },
    timeframe: {
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    },
  })

  const handleComplete = async () => {
    try {
      const result = await createInvestigation.mutateAsync(
        investigationData as InvestigationRequest,
      )
      setShowSuccess(true)
      setTimeout(() => {
        navigate(`/investigations/${result.id}`)
      }, 2000)
    } catch (error) {
      console.error('Failed to create investigation:', error)
    }
  }

  const updateData = (data: Partial<InvestigationRequest>) => {
    setInvestigationData((prev) => ({ ...prev, ...data }))
  }

  const wizard = useWizard({
    steps: [
      { id: 'scope', label: 'Investigation Scope' },
      { id: 'details', label: 'Details & Objectives' },
      { id: 'sources', label: 'Intelligence Sources' },
      { id: 'review', label: 'Review & Submit' },
    ],
    onComplete: handleComplete,
  })

  const handleStepValidation = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return !!investigationData.scope
      case 1:
        return (
          !!investigationData.title &&
          !!investigationData.description &&
          (investigationData.objectives?.length || 0) > 0
        )
      case 2:
        return true
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <>
      <FormWizard wizard={wizard} onStepValidate={handleStepValidation}>
        <ScopeSelectionStep data={investigationData} onUpdate={updateData} />
        <DetailsConfigurationStep
          data={investigationData}
          onUpdate={updateData}
        />
        <SourceSelectionStep data={investigationData} onUpdate={updateData} />
        <ReviewSubmitStep data={investigationData} />
      </FormWizard>

      {showSuccess && (
        <Toast
          id="investigation-success"
          message="Investigation request submitted successfully!"
          type="success"
          onClose={() => setShowSuccess(false)}
        />
      )}
    </>
  )
}

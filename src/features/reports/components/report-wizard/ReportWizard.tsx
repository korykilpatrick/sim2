import { useState } from 'react'
import { FormWizard, useWizard } from '@/components/forms/wizard'
import { VesselSelectionStep } from './VesselSelectionStep'
import { ReportTypeSelectionStep } from './ReportTypeSelectionStep'
import { ReportConfigurationStep } from './ReportConfigurationStep'
import type { Vessel } from '@/features/vessels/types'
import type { ReportTemplate } from '../../types'
import type { ReportConfiguration } from './ReportConfigurationStep'

interface ReportWizardProps {
  onComplete: (data: {
    vessel: Vessel
    reportType: ReportTemplate['type']
    configuration: ReportConfiguration
  }) => void
  onCancel: () => void
}

export function ReportWizard({ onComplete }: ReportWizardProps) {
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [configuration, setConfiguration] = useState<ReportConfiguration>({})

  const handleComplete = () => {
    if (!selectedVessel || !selectedTemplate) return
    
    onComplete({
      vessel: selectedVessel,
      reportType: selectedTemplate.type,
      configuration,
    })
  }

  const wizard = useWizard({
    steps: [
      { id: 'vessel', label: 'Select Vessel', description: 'Choose the vessel for your report' },
      { id: 'report-type', label: 'Report Type', description: 'Choose the type of report to generate' },
      { id: 'configure', label: 'Configure Report', description: 'Configure report parameters' },
    ],
    onComplete: handleComplete,
  })

  const handleStepValidation = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return selectedVessel !== null
      case 1:
        return selectedTemplate !== null
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
    >
      <VesselSelectionStep
        selectedVessel={selectedVessel}
        onSelectVessel={setSelectedVessel}
      />
      <ReportTypeSelectionStep
        selectedTemplate={selectedTemplate}
        onSelectTemplate={setSelectedTemplate}
        selectedVessel={selectedVessel}
      />
      <ReportConfigurationStep
        reportType={selectedTemplate?.type}
        configuration={configuration}
        onConfigurationChange={setConfiguration}
      />
    </FormWizard>
  )
}
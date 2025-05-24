import { useReportTemplates } from '../../hooks'
import { ReportTemplates } from '../ReportTemplates'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'
import { AlertCircle } from 'lucide-react'
import type { ReportTemplate } from '../../types'
import type { Vessel } from '@/features/vessels/types'

interface ReportTypeSelectionStepProps {
  selectedTemplate: ReportTemplate | null
  onSelectTemplate: (template: ReportTemplate) => void
  selectedVessel: Vessel | null
}

export function ReportTypeSelectionStep({
  selectedTemplate,
  onSelectTemplate,
  selectedVessel,
}: ReportTypeSelectionStepProps) {
  const { data: templatesData, isLoading } = useReportTemplates()
  const templates = templatesData || []

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (!selectedVessel) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Please select a vessel first before choosing a report type.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Available Report Types
      </h3>
      <ReportTemplates
        templates={templates}
        onSelectTemplate={onSelectTemplate}
        selectedVessel={selectedVessel}
        selectedTemplateId={selectedTemplate?.id}
      />
    </div>
  )
}
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import Button from '@/components/common/Button'
import { ReportTemplate } from '../types'
import { FileText, Clock, CreditCard } from 'lucide-react'

interface ReportTemplatesProps {
  templates: ReportTemplate[]
  onSelectTemplate: (template: ReportTemplate) => void
  selectedVessel?: { id: string; name: string }
  selectedTemplateId?: string
}

export const ReportTemplates: React.FC<ReportTemplatesProps> = ({
  templates,
  onSelectTemplate,
  selectedVessel,
  selectedTemplateId,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {templates.map((template) => (
        <Card
          key={template.id}
          className={`hover:shadow-lg transition-shadow cursor-pointer ${
            selectedTemplateId === template.id
              ? 'ring-2 ring-primary-500 border-primary-500'
              : ''
          }`}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-primary-600 mr-2" />
                <CardTitle>{template.name}</CardTitle>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  template.type === 'compliance'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {template.type}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{template.description}</p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm">
                <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Base cost:</span>
                <span className="ml-auto font-medium">
                  {template.baseCredits} credits
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Processing time:</span>
                <span className="ml-auto">{template.processingTime}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Includes:
              </p>
              <ul className="space-y-1">
                {template.features.slice(0, 3).map((feature, index) => (
                  <li
                    key={index}
                    className="text-xs text-gray-600 flex items-start"
                  >
                    <span className="text-green-500 mr-1">•</span>
                    {feature}
                  </li>
                ))}
                {template.features.length > 3 && (
                  <li className="text-xs text-gray-500 italic">
                    +{template.features.length - 3} more features
                  </li>
                )}
              </ul>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={() => onSelectTemplate(template)}
              disabled={!selectedVessel}
            >
              {selectedVessel
                ? `Generate for ${selectedVessel.name}`
                : 'Select a vessel first'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/common/Button'
import Input from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import { Card } from '@/components/common/Card'
import Alert from '@/components/feedback/Alert'
import { InvestigationRequest } from '../types'

const investigationSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  scope: z.enum(['vessel', 'area', 'event'] as const),
  priority: z.enum(['standard', 'urgent', 'critical'] as const),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  objectives: z.array(z.string()).min(1, 'At least one objective is required'),
  vesselIds: z.array(z.string()).optional(),
  timeframe: z.object({
    start: z.string(),
    end: z.string(),
  }),
  requestedSources: z.object({
    satelliteImagery: z.boolean(),
    osint: z.boolean(),
    sigint: z.boolean(),
    webcams: z.boolean(),
    humint: z.boolean(),
    proprietaryTools: z.boolean(),
  }),
  additionalRequests: z.string().optional(),
  contactPreferences: z.object({
    email: z.boolean(),
    phone: z.boolean(),
    platformMessage: z.boolean(),
  }),
})

type FormData = z.infer<typeof investigationSchema>

interface InvestigationRequestFormProps {
  onSubmit: (data: InvestigationRequest) => void
  onCancel: () => void
  initialData?: Partial<InvestigationRequest>
}

export function InvestigationRequestForm({
  onSubmit,
  onCancel,
  initialData,
}: InvestigationRequestFormProps) {
  const [objectives, setObjectives] = useState<string[]>(
    initialData?.objectives || [''],
  )
  const [currentObjective, setCurrentObjective] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(investigationSchema),
    defaultValues: {
      title: initialData?.title || '',
      scope: initialData?.scope || 'vessel',
      priority: initialData?.priority || 'standard',
      description: initialData?.description || '',
      objectives: initialData?.objectives || [],
      vesselIds: initialData?.vesselIds || [],
      timeframe: initialData?.timeframe || {
        start: new Date().toISOString().split('T')[0],
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      },
      requestedSources: initialData?.requestedSources || {
        satelliteImagery: true,
        osint: true,
        sigint: true,
        webcams: false,
        humint: false,
        proprietaryTools: true,
      },
      additionalRequests: initialData?.additionalRequests || '',
      contactPreferences: initialData?.contactPreferences || {
        email: true,
        phone: false,
        platformMessage: true,
      },
    },
  })

  const scope = watch('scope')

  const addObjective = () => {
    if (currentObjective.trim()) {
      setObjectives([...objectives, currentObjective.trim()])
      setCurrentObjective('')
    }
  }

  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index))
  }

  const onFormSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      objectives,
    } as InvestigationRequest)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Investigation Details</h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <Input
              label="Investigation Title"
              {...register('title')}
              error={errors.title?.message}
              placeholder="Enter a descriptive title for your investigation"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Investigation Scope"
              {...register('scope')}
              error={errors.scope?.message}
            >
              <option value="vessel">Vessel Activity</option>
              <option value="area">Maritime Area</option>
              <option value="event">Specific Event</option>
            </Select>

            <Select
              label="Priority Level"
              {...register('priority')}
              error={errors.priority?.message}
            >
              <option value="standard">Standard</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Provide detailed information about what you need investigated..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {scope === 'vessel' && (
            <div>
              <Input
                label="Vessel IMO Numbers"
                placeholder="Enter vessel IMO numbers separated by commas"
                onChange={(e) => {
                  const value = e.target.value
                  const imos = value.split(',').map((imo) => imo.trim())
                  register('vesselIds').onChange({
                    target: { value: imos, name: 'vesselIds' },
                  })
                }}
              />
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Investigation Objectives</h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              What specific questions do you need answered?
            </p>
            <div className="flex gap-2">
              <Input
                value={currentObjective}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCurrentObjective(e.target.value)
                }
                placeholder="Enter an objective"
                onKeyPress={(e: React.KeyboardEvent) =>
                  e.key === 'Enter' && (e.preventDefault(), addObjective())
                }
              />
              <Button type="button" onClick={addObjective}>
                Add
              </Button>
            </div>
          </div>

          {objectives.length > 0 && (
            <ul className="space-y-2">
              {objectives.map((objective, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm">{objective}</span>
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Intelligence Sources</h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Select the intelligence sources you want utilized for this
            investigation
          </p>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('requestedSources.satelliteImagery')}
                className="mr-2"
              />
              <span>Satellite Imagery</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('requestedSources.osint')}
                className="mr-2"
              />
              <span>OSINT (Open-Source Intelligence)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('requestedSources.sigint')}
                className="mr-2"
              />
              <span>SIGINT (Signals Intelligence)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('requestedSources.webcams')}
                className="mr-2"
              />
              <span>Webcams & Sensors</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('requestedSources.humint')}
                className="mr-2"
              />
              <span>HUMINT (Human Intelligence)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('requestedSources.proprietaryTools')}
                className="mr-2"
              />
              <span>Proprietary Analytical Tools</span>
            </label>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Timeframe & Delivery</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Investigation Start Date"
              {...register('timeframe.start')}
              error={errors.timeframe?.start?.message}
            />
            <Input
              type="date"
              label="Investigation End Date"
              {...register('timeframe.end')}
              error={errors.timeframe?.end?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Requests
            </label>
            <textarea
              {...register('additionalRequests')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Any specific data, imagery, or analysis requests..."
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Contact Preferences</h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            How would you like to be contacted about this investigation?
          </p>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('contactPreferences.email')}
                className="mr-2"
              />
              <span>Email notifications</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('contactPreferences.phone')}
                className="mr-2"
              />
              <span>Phone updates</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('contactPreferences.platformMessage')}
                className="mr-2"
              />
              <span>Platform messages</span>
            </label>
          </div>
        </div>
      </Card>

      <Alert
        variant="info"
        message="Once submitted, a SynMax analyst will review your request and contact you to refine the scope and objectives. You'll receive a cost estimate before the investigation begins."
      />

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Submit Investigation Request
        </Button>
      </div>
    </form>
  )
}

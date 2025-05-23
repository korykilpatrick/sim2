import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import { useMonitoringCriteria, useAreaCostCalculation } from '../hooks/useAreaMonitoring'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'
import { clsx } from '@/utils/clsx'
import type { CreateAreaRequest } from '../types'

interface AreaConfigFormData {
  name: string
  description?: string
  updateFrequency: '3' | '6' | '12' | '24'
  duration: number
  alertsEnabled: boolean
}

interface AreaConfigFormProps {
  area?: GeoJSON.Polygon | GeoJSON.MultiPolygon
  areaSize?: number // km²
  onSubmit: (data: CreateAreaRequest) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export const AreaConfigForm: React.FC<AreaConfigFormProps> = ({
  area,
  areaSize = 0,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([])
  const [duration, setDuration] = useState(30)
  const [updateFrequency, setUpdateFrequency] = useState<3 | 6 | 12 | 24>(6)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AreaConfigFormData>({
    defaultValues: {
      updateFrequency: '6',
      duration: 30,
      alertsEnabled: true,
    },
  })

  const { data: criteriaData, isLoading: isLoadingCriteria } = useMonitoringCriteria()
  
  const { data: costData } = useAreaCostCalculation({
    sizeKm2: areaSize,
    criteria: selectedCriteria,
    updateFrequency,
    duration,
  })

  const toggleCriteria = (criteriaId: string) => {
    setSelectedCriteria((prev) =>
      prev.includes(criteriaId)
        ? prev.filter((id) => id !== criteriaId)
        : [...prev, criteriaId],
    )
  }

  const onFormSubmit = (data: AreaConfigFormData) => {
    if (!area) {
      return
    }

    onSubmit({
      ...data,
      geometry: area,
      criteria: selectedCriteria,
      updateFrequency: Number(data.updateFrequency),
    })
  }

  const criteria = criteriaData?.data || []

  // Group criteria by category
  const criteriaByCategory = criteria.reduce((acc, criterion) => {
    if (!acc[criterion.category]) {
      acc[criterion.category] = []
    }
    acc[criterion.category].push(criterion)
    return acc
  }, {} as Record<string, typeof criteria>)

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Area Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Area Name"
            placeholder="e.g., Persian Gulf Monitoring"
            {...register('name', { required: 'Area name is required' })}
            error={errors.name?.message}
          />
          
          <Input
            label="Description (optional)"
            placeholder="Brief description of this monitoring area"
            {...register('description')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Update Frequency"
              {...register('updateFrequency')}
              onChange={(e) => setUpdateFrequency(Number(e.target.value) as 3 | 6 | 12 | 24)}
              error={errors.updateFrequency?.message}
            >
              <option value="3">Every 3 hours</option>
              <option value="6">Every 6 hours</option>
              <option value="12">Every 12 hours</option>
              <option value="24">Every 24 hours</option>
            </Select>

            <Input
              label="Monitoring Duration (days)"
              type="number"
              min="1"
              max="365"
              {...register('duration', {
                required: 'Duration is required',
                min: { value: 1, message: 'Minimum 1 day' },
                max: { value: 365, message: 'Maximum 365 days' },
              })}
              onChange={(e) => setDuration(Number(e.target.value))}
              error={errors.duration?.message}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Area Size:</strong> {areaSize.toLocaleString()} km²
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monitoring Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingCriteria ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(criteriaByCategory).map(([category, items]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 capitalize">
                    {category.replace('_', ' ')}
                  </h4>
                  <div className="space-y-2">
                    {items.map((criterion) => (
                      <label
                        key={criterion.id}
                        className={clsx(
                          'flex items-start p-3 rounded-lg border cursor-pointer transition-colors',
                          selectedCriteria.includes(criterion.id)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:bg-gray-50',
                        )}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          checked={selectedCriteria.includes(criterion.id)}
                          onChange={() => toggleCriteria(criterion.id)}
                        />
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {criterion.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {criterion.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {criterion.creditsPerAlert} credits per alert
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {costData && (
        <Card>
          <CardHeader>
            <CardTitle>Cost Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Credits per day</span>
                <span className="font-medium">{costData.data.creditsPerDay}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total credits ({duration} days)</span>
                <span className="text-lg font-bold text-primary-600">
                  {costData.data.totalCredits}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!area || selectedCriteria.length === 0}
        >
          Create Area Monitoring
        </Button>
      </div>
    </form>
  )
}
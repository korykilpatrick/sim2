import { useState, useEffect } from 'react'
import Modal from '@components/common/Modal'
import Button from '@components/common/Button'
import Input from '@components/forms/Input'
import { useUpdateFleet } from '../hooks/useFleets'
import { useToast } from '@/hooks'
import type { Fleet, UpdateFleetInput } from '../types'

interface EditFleetModalProps {
  isOpen: boolean
  onClose: () => void
  fleet: Fleet | null
  onSuccess?: () => void
}

export function EditFleetModal({
  isOpen,
  onClose,
  fleet,
  onSuccess,
}: EditFleetModalProps) {
  const { showToast } = useToast()
  const updateFleet = useUpdateFleet()

  const [formData, setFormData] = useState<UpdateFleetInput>({
    name: '',
    description: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form when fleet changes
  useEffect(() => {
    if (fleet) {
      setFormData({
        name: fleet.name,
        description: fleet.description || '',
      })
    }
  }, [fleet])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Fleet name is required'
    }

    if (formData.name && formData.name.length < 3) {
      newErrors.name = 'Fleet name must be at least 3 characters'
    }

    if (formData.name && formData.name.length > 100) {
      newErrors.name = 'Fleet name must be less than 100 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !fleet) {
      return
    }

    try {
      await updateFleet.mutateAsync({
        id: fleet.id,
        data: formData,
      })
      showToast({
        type: 'success',
        message: 'Fleet updated successfully',
      })
      onSuccess?.()
      onClose()
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  if (!fleet) {
    return null
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Fleet" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Fleet Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter fleet name"
            error={errors.name}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Enter fleet description (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Fleet Information
          </h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Vessels: {fleet.vesselCount}</p>
            <p>Active Alerts: {fleet.activeAlerts || 0}</p>
            <p>Credits/Month: ${fleet.creditsPerMonth.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={updateFleet.isPending}
          >
            Update Fleet
          </Button>
        </div>
      </form>
    </Modal>
  )
}

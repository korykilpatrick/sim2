import { useState } from 'react'
import Modal from '@components/common/Modal'
import Button from '@components/common/Button'
import Input from '@components/forms/Input'
import { useCreateFleet } from '../hooks/useFleets'
import { useToast } from '@/hooks'
import type { CreateFleetInput } from '../types'

interface CreateFleetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateFleetModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateFleetModalProps) {
  const { showToast } = useToast()
  const createFleet = useCreateFleet()

  const [formData, setFormData] = useState<CreateFleetInput>({
    name: '',
    description: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Fleet name is required'
    }

    if (formData.name.length < 3) {
      newErrors.name = 'Fleet name must be at least 3 characters'
    }

    if (formData.name.length > 100) {
      newErrors.name = 'Fleet name must be less than 100 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await createFleet.mutateAsync(formData)
      showToast({
        type: 'success',
        message: 'Fleet created successfully',
      })
      onSuccess?.()
      onClose()
      resetForm()
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    })
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Fleet"
      size="md"
    >
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

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={createFleet.isPending}
          >
            Create Fleet
          </Button>
        </div>
      </form>
    </Modal>
  )
}

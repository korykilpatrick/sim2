import { useState } from 'react'
import Input from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import { Card } from '@/components/common/Card'
import Button from '@/components/common/Button'
import { InvestigationRequest } from '../../types'

interface DetailsConfigurationStepProps {
  data: Partial<InvestigationRequest>
  onUpdate: (data: Partial<InvestigationRequest>) => void
}

export function DetailsConfigurationStep({
  data,
  onUpdate,
}: DetailsConfigurationStepProps) {
  const [currentObjective, setCurrentObjective] = useState('')
  const [vesselInput, setVesselInput] = useState('')

  const addObjective = () => {
    if (currentObjective.trim()) {
      const newObjectives = [
        ...(data.objectives || []),
        currentObjective.trim(),
      ]
      onUpdate({ objectives: newObjectives })
      setCurrentObjective('')
    }
  }

  const removeObjective = (index: number) => {
    const newObjectives = (data.objectives || []).filter((_, i) => i !== index)
    onUpdate({ objectives: newObjectives })
  }

  const handleVesselInput = (value: string) => {
    setVesselInput(value)
    const vesselIds = value
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
    onUpdate({ vesselIds })
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Investigation Details</h3>
        </div>
        <div className="p-4 space-y-4">
          <Input
            label="Investigation Title"
            value={data.title || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onUpdate({ title: e.target.value })
            }
            placeholder="Enter a descriptive title for your investigation"
            required
          />

          <Select
            label="Priority Level"
            value={data.priority || 'standard'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onUpdate({
                priority: e.target.value as InvestigationRequest['priority'],
              })
            }
          >
            <option value="standard">Standard (5-7 business days)</option>
            <option value="urgent">Urgent (2-3 business days)</option>
            <option value="critical">Critical (24-48 hours)</option>
          </Select>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={data.description || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onUpdate({ description: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Provide detailed information about what you need investigated..."
              required
            />
          </div>

          {data.scope === 'vessel' && (
            <Input
              label="Vessel IMO Numbers"
              value={vesselInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleVesselInput(e.target.value)
              }
              placeholder="Enter vessel IMO numbers separated by commas (e.g., 9123456, 9234567)"
            />
          )}

          {data.scope === 'area' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                Area coordinates will be defined during consultation with your
                analyst
              </p>
            </div>
          )}

          {data.scope === 'event' && (
            <div className="space-y-4">
              <Input
                type="date"
                label="Event Date"
                value={data.eventDetails?.date || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onUpdate({
                    eventDetails: {
                      ...data.eventDetails,
                      date: e.target.value,
                      eventType: data.eventDetails?.eventType || '',
                    },
                  })
                }
              />
              <Input
                label="Event Type"
                value={data.eventDetails?.eventType || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onUpdate({
                    eventDetails: {
                      ...data.eventDetails,
                      eventType: e.target.value,
                      date: data.eventDetails?.date || '',
                    },
                  })
                }
                placeholder="e.g., STS Transfer, Dark Voyage, Port Call"
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
          <p className="text-sm text-gray-600">
            What specific questions do you need answered? Be as detailed as
            possible.
          </p>

          <div className="flex gap-2">
            <Input
              value={currentObjective}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCurrentObjective(e.target.value)
              }
              placeholder="Enter an objective or question"
              onKeyPress={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addObjective()
                }
              }}
            />
            <Button type="button" onClick={addObjective}>
              Add
            </Button>
          </div>

          {data.objectives && data.objectives.length > 0 && (
            <ul className="space-y-2">
              {data.objectives.map((objective, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm flex-1">{objective}</span>
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Investigation Timeframe</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Start Date"
              value={data.timeframe?.start || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onUpdate({
                  timeframe: {
                    ...data.timeframe,
                    start: e.target.value,
                    end: data.timeframe?.end || '',
                  },
                })
              }
            />
            <Input
              type="date"
              label="End Date"
              value={data.timeframe?.end || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onUpdate({
                  timeframe: {
                    ...data.timeframe,
                    end: e.target.value,
                    start: data.timeframe?.start || '',
                  },
                })
              }
            />
          </div>
        </div>
      </Card>
    </div>
  )
}

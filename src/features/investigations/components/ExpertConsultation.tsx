import { useState } from 'react'
import { Card } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Alert from '@/components/feedback/Alert'
import Modal from '@/components/common/Modal'
import { Investigation } from '../types'

interface ExpertConsultationProps {
  investigation: Investigation
  onSchedule: (date: string, notes: string) => void
}

export function ExpertConsultation({
  investigation,
  onSchedule,
}: ExpertConsultationProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [consultationNotes, setConsultationNotes] = useState('')
  const [timeSlot, setTimeSlot] = useState('')

  const availableSlots = [
    '09:00 - 09:30',
    '09:30 - 10:00',
    '10:00 - 10:30',
    '10:30 - 11:00',
    '14:00 - 14:30',
    '14:30 - 15:00',
    '15:00 - 15:30',
    '15:30 - 16:00',
  ]

  const handleSchedule = () => {
    if (selectedDate && timeSlot) {
      const scheduledDateTime = `${selectedDate} ${timeSlot}`
      onSchedule(scheduledDateTime, consultationNotes)
      setShowScheduleModal(false)
    }
  }

  const analystInfo = {
    name: investigation.analystName || 'Pending Assignment',
    expertise: 'Maritime Intelligence & Risk Analysis',
    experience: '15+ years in maritime security and compliance',
    languages: 'English, Spanish, Mandarin',
  }

  return (
    <>
      <Card>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Expert Consultation</h3>
            {investigation.status === 'under_review' ||
            investigation.status === 'in_progress' ? (
              <Button onClick={() => setShowScheduleModal(true)}>
                Schedule Consultation
              </Button>
            ) : (
              <span className="text-sm text-gray-500">
                Available after review
              </span>
            )}
          </div>
        </div>
        <div className="p-4 space-y-4">
          {investigation.consultation?.scheduled ? (
            <Alert
              variant="success"
              message={`Consultation Scheduled - Date: ${investigation.consultation.date}${investigation.consultation.notes ? ` - Notes: ${investigation.consultation.notes}` : ''}`}
            />
          ) : (
            <Alert
              variant="info"
              message="Schedule a consultation with your assigned analyst to discuss your investigation in detail. This is included in your investigation package."
            />
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Your Assigned Analyst</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-semibold">
                    {analystInfo.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{analystInfo.name}</p>
                  <p className="text-sm text-gray-600">
                    {analystInfo.expertise}
                  </p>
                </div>
              </div>
              <div className="ml-15 space-y-1 text-sm text-gray-600">
                <p>Experience: {analystInfo.experience}</p>
                <p>Languages: {analystInfo.languages}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Consultation Benefits</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-500 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">
                  Refine investigation scope and objectives
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-500 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">
                  Discuss preliminary findings and insights
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-500 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">
                  Get expert recommendations and next steps
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-500 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">
                  Ask questions about the investigation process
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Expert Consultation"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Time Slot (UTC)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`p-2 text-sm border rounded-md transition-colors ${
                      timeSlot === slot
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topics to Discuss (Optional)
            </label>
            <textarea
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="List any specific topics or questions you'd like to discuss..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowScheduleModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={!selectedDate || !timeSlot}
            >
              Schedule Consultation
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

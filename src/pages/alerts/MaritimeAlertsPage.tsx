import { useNavigate } from 'react-router-dom'
import Button from '@/components/common/Button'
import Header from '@/components/layout/Header'
import { MARITIME_ALERT_TYPES } from '@/constants/alerts'

export default function MaritimeAlertsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Maritime Alert</h1>
        <p className="text-gray-600 mb-8">
          Select the type of alert you'd like to create:
        </p>

        <div className="space-y-4">
          {MARITIME_ALERT_TYPES.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-lg shadow p-6 flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {alert.name}
                </h3>
                <p className="mt-1 text-gray-600">
                  {alert.description}
                </p>
              </div>
              
              <Button
                variant={alert.active ? 'synmax' : 'secondary'}
                onClick={() => navigate(`/alerts/create/${alert.id}`)}
              >
                Create
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">ℹ️</span>
            <div className="text-sm text-blue-800">
              <p className="font-semibold">Did you know?</p>
              <p>Promotional message for purchasing full Theia goes here</p>
              <button className="mt-2 text-blue-600 hover:text-blue-700 font-medium">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
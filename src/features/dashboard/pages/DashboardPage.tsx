import { useAuth } from '@/features/auth/hooks/useAuth'
import Button from '@/components/common/Button'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { } = useAuth()
  const navigate = useNavigate()

  const userProducts = [
    {
      id: 'vts',
      name: 'Vessel Tracking Service',
      description: 'Customized vessel tracking solution tied to IMO numbers. Monitor vessels with alerts for AIS reporting, dark events, spoofing, STS transfers, port calls, and risk assessment changes.',
      isActive: true,
    },
    {
      id: 'ams',
      name: 'Area Monitoring Service',
      description: 'Real-time monitoring of custom ocean areas. Track vessel entries/exits, dark ship events, GPS manipulation, and receive automated alerts for critical maritime activities in your defined AOI.',
      isActive: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 text-xl">👤</span>
            </div>
            <h1 className="ml-4 text-2xl font-bold text-gray-900">Welcome!</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-600 space-x-4">
          <button className="font-semibold text-gray-900">My Products</button>
          <button 
            onClick={() => navigate('/team')}
            className="hover:text-gray-900"
          >
            My Team
          </button>
          <button 
            onClick={() => navigate('/billing')}
            className="hover:text-gray-900"
          >
            Billing & Plan
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className="hover:text-gray-900"
          >
            Settings
          </button>
        </nav>
      </div>

      {/* Products Grid */}
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {userProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow p-6 flex items-start gap-6"
            >
              <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0" />
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {product.name}
                </h3>
                <p className="mt-2 text-gray-600">
                  {product.description}
                </p>
              </div>

              <Button
                variant={product.isActive ? 'secondary' : 'primary'}
                onClick={() => {
                  if (product.id === 'vts') {
                    navigate('/vessels')
                  } else if (product.id === 'ams') {
                    navigate('/areas')
                  }
                }}
              >
                Launch
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import Button from '@/components/common/Button'
import { ArrowRight, Shield, Ship, MapPin, FileText, AlertCircle, CreditCard } from 'lucide-react'

export default function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const products = [
    {
      id: 'vts',
      title: 'Vessel Tracking Service',
      description: 'Real-time vessel monitoring with customizable alerts and criteria-based tracking',
      icon: Ship,
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
      path: '/vessels',
    },
    {
      id: 'ams',
      title: 'Area Monitoring Service',
      description: 'Monitor specific geographic areas with automated alerts for vessel activity',
      icon: MapPin,
      color: 'text-secondary-500',
      bgColor: 'bg-secondary-50',
      path: '/areas',
    },
    {
      id: 'fts',
      title: 'Fleet Tracking Service',
      description: 'Comprehensive fleet management with real-time tracking and analytics',
      icon: Shield,
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
      path: '/fleets',
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      description: 'Generate compliance and chronology reports with detailed vessel history',
      icon: FileText,
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
      path: '/reports',
    },
    {
      id: 'mis',
      title: 'Maritime Investigation',
      description: 'Submit requests for investigation and get detailed maritime intelligence',
      icon: AlertCircle,
      color: 'text-secondary-500',
      bgColor: 'bg-secondary-50',
      path: '/investigations',
    },
    {
      id: 'credits',
      title: 'Purchase Credits',
      description: 'Buy credits to access our services with flexible pricing options',
      icon: CreditCard,
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
      path: '/credits',
    },
  ]

  const handleProductClick = (path: string) => {
    if (isAuthenticated) {
      navigate(path)
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-dark-500 to-dark-700">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="block">Welcome to</span>
              <span className="block bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                SynMax Intelligence Marketplace
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
              Access maritime intelligence and analytics with our pay-as-you-go platform. 
              Track vessels, monitor areas, and generate compliance reports with ease.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button
                size="lg"
                variant="synmax"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                className="min-w-[200px]"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
                className="min-w-[200px] border-white text-white hover:bg-white hover:text-dark-500"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-lg font-medium text-white">
            🎉 New users get 100 free credits! Start monitoring vessels today.
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Our Products</h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose from our suite of maritime intelligence services
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const Icon = product.icon
            return (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.path)}
                className="group relative cursor-pointer overflow-hidden rounded-xl bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`inline-flex rounded-lg ${product.bgColor} p-3`}>
                  <Icon className={`h-8 w-8 ${product.color}`} />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900 group-hover:text-primary-600">
                  {product.title}
                </h3>
                <p className="mt-2 text-gray-600">{product.description}</p>
                <div className="mt-4 flex items-center text-primary-600 transition-transform group-hover:translate-x-1">
                  <span className="text-sm font-medium">Learn more</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary-500 to-secondary-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Join thousands of maritime professionals using SynMax Intelligence
            </p>
            <Button
              size="lg"
              variant="synmax"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              className="mt-8"
            >
              Create Free Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
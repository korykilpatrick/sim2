import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Button from '@/components/common/Button'
import { Header } from '@/components/layout'
import { CheckCircle, Package } from 'lucide-react'

export default function PaymentConfirmationPage() {
  const navigate = useNavigate()

  // Generate a random order number
  const orderNumber = Math.random().toString(36).substring(2, 10).toUpperCase()

  // Save order number to localStorage for demonstration
  useEffect(() => {
    localStorage.setItem('lastOrderNumber', orderNumber)
  }, [orderNumber])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Confirmation Content */}
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-secondary-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-secondary-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>

          <p className="text-lg text-gray-600 mb-8">Order #{orderNumber}</p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                What happens next?
              </h2>
            </div>

            <div className="space-y-3 text-gray-600">
              <p>
                • You'll receive a confirmation email with your order details
                and login credentials
              </p>
              <p>• Your subscription is now active and ready to use</p>
              <p>• Access your products anytime from the dashboard</p>
              <p>
                • Monitor your usage and manage subscriptions in your account
                settings
              </p>
            </div>
          </div>

          <div className="text-center text-gray-600 mb-8">
            <p className="font-medium">Need help getting started?</p>
            <p>Contact our support team at support@synmax.com</p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" size="lg" onClick={() => navigate('/')}>
              Back to Marketplace
            </Button>
            <Button
              variant="synmax"
              size="lg"
              onClick={() => navigate('/dashboard')}
            >
              Launch Product Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

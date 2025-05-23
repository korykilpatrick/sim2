import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/common/Button'
import { Trash2, ArrowLeft, CreditCard } from 'lucide-react'

interface CartItem {
  id: string
  name: string
  description: string
  price: number
  credits: number
  type: 'vessel_tracking' | 'area_monitoring' | 'report' | 'credits'
  duration?: string
  criteria?: string[]
}

export default function CartPage() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Vessel Tracking - EVER GIVEN',
      description: 'IMO: 9811000 - 30 days tracking with AIS, Dark Event, and Port Call alerts',
      price: 499,
      credits: 50,
      type: 'vessel_tracking',
      duration: '30 days',
      criteria: ['AIS Reporting', 'Dark Event', 'Port Calls'],
    },
    {
      id: '2',
      name: 'Area Monitoring - Persian Gulf',
      description: 'Monitor vessel activity in defined area with real-time alerts',
      price: 799,
      credits: 80,
      type: 'area_monitoring',
      duration: '30 days',
    },
  ])

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  const totalCredits = cartItems.reduce((sum, item) => sum + item.credits, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </button>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <div className="rounded-lg bg-white p-8 text-center shadow">
                <p className="text-gray-500">Your cart is empty</p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/')}
                  className="mt-4"
                >
                  Browse Products
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {item.description}
                        </p>
                        {item.criteria && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.criteria.map((criterion) => (
                              <span
                                key={criterion}
                                className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700"
                              >
                                {criterion}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 flex items-center gap-4">
                          <span className="text-lg font-bold text-gray-900">
                            ${item.price}
                          </span>
                          <span className="text-sm text-gray-500">
                            {item.credits} credits
                          </span>
                          {item.duration && (
                            <span className="text-sm text-gray-500">
                              • {item.duration}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-4 p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              
              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-sm text-gray-600">
                    <span>Total Credits</span>
                    <span>{totalCredits} credits</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  variant="synmax"
                  fullWidth
                  size="lg"
                  onClick={() => navigate('/checkout')}
                  disabled={cartItems.length === 0}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/credits')}
                >
                  Purchase with Credits
                </Button>
              </div>

              <div className="mt-6 rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Need more credits?</strong> Purchase credit bundles for
                  better value and instant access to all services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/common/Button'
import Header from '@/components/layout/Header'

interface CartItem {
  id: string
  name: string
  description: string
  price: number
  image?: string
}

export default function CartPage() {
  const navigate = useNavigate()
  const [cartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Product Name',
      description: 'Product description goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ut metus quis mi sodales consectetur. Vivamus',
      price: 999.99,
    },
    {
      id: '2',
      name: 'Product Name',
      description: 'Product description goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ut metus quis mi sodales consectetur. Vivamus',
      price: 999.99,
    },
    {
      id: '3',
      name: 'Product Name',
      description: 'Product description goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ut metus quis mi sodales consectetur. Vivamus',
      price: 999.99,
    },
  ])

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Cart Content */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Your Cart ({cartItems.length} Products)
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Cart Items */}
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 pb-6 border-b last:border-0"
              >
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0" />
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-gray-600 text-sm">
                    {item.description}
                  </p>
                  <button 
                    onClick={() => navigate(`/products/${item.id}`)}
                    className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-8 pt-6 border-t">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              variant="synmax"
              size="lg"
              fullWidth
              onClick={() => navigate('/checkout')}
              className="mt-6"
            >
              Check Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
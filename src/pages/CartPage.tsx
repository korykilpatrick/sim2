import { useNavigate } from 'react-router-dom'
import Button from '@/components/common/Button'
import Header from '@/components/layout/Header'
import { useCartStore, cartSelectors } from '@/stores/cartStore'
import { Trash2 } from 'lucide-react'
import { calculateProductTotal, hasStandardPricing } from '@/utils/formatPrice'

export default function CartPage() {
  const navigate = useNavigate()
  const items = useCartStore(cartSelectors.items)
  const removeItem = useCartStore(cartSelectors.removeItem)
  const updateQuantity = useCartStore(cartSelectors.updateQuantity)
  const updateBillingCycle = useCartStore(cartSelectors.updateBillingCycle)
  const { subtotal, tax, total } = useCartStore(cartSelectors.total)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Cart Content */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Your Cart ({items.length}{' '}
          {items.length === 1 ? 'Product' : 'Products'})
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Button variant="synmax" onClick={() => navigate('/')}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Cart Items */}
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 pb-6 border-b last:border-0"
                >
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-gray-400">
                      {item.product.shortName ||
                        item.product.name.substring(0, 3).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="mt-1 text-gray-600 text-sm">
                      {item.product.descriptions.standard}
                    </p>

                    <div className="mt-3 flex items-center gap-4">
                      {hasStandardPricing(item.product) ? (
                        <select
                          value={item.billingCycle}
                          onChange={(e) =>
                            updateBillingCycle(
                              item.product.id,
                              e.target.value as 'monthly' | 'annual',
                            )
                          }
                          className="text-sm border rounded px-2 py-1"
                        >
                          {item.product.pricing.monthly !== null && (
                            <option value="monthly">Monthly</option>
                          )}
                          {item.product.pricing.annual !== null && (
                            <option value="annual">Annual</option>
                          )}
                        </select>
                      ) : (
                        <span className="text-sm text-gray-600">
                          {item.product.pricing.enterprise || 'Custom pricing'}
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Qty:</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.product.id,
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-16 text-sm border rounded px-2 py-1"
                        />
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/products/sim/${item.product.id}`)
                        }
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {(() => {
                        const total = calculateProductTotal(
                          item.product,
                          item.quantity,
                          item.billingCycle,
                        )
                        if (total === null) return 'Contact for pricing'
                        return (
                          <>
                            ${total.toLocaleString()}
                            <span className="text-sm font-normal text-gray-500">
                              /
                              {item.billingCycle === 'monthly'
                                ? 'month'
                                : 'year'}
                            </span>
                          </>
                        )
                      })()}
                    </p>
                    {item.billingCycle === 'annual' &&
                      item.product.pricing.monthly &&
                      item.product.pricing.annual && (
                        <p className="text-sm text-secondary-600">
                          Save $
                          {(
                            (item.product.pricing.monthly * 12 -
                              item.product.pricing.annual) *
                            item.quantity
                          ).toLocaleString()}
                        </p>
                      )}
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="mt-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-8 pt-6 border-t">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal (Monthly Equivalent)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                  <span>Total (Monthly Equivalent)</span>
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
        )}
      </div>
    </div>
  )
}

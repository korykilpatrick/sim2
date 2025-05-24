import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import Button from '@/components/common/Button'
import Input from '@/components/forms/Input'
import Header from '@/components/layout/Header'
import { useCartStore, cartSelectors } from '@/stores/cartStore'
import { calculateProductTotal } from '@/utils/formatPrice'
import { ArrowLeft } from 'lucide-react'

interface CheckoutForm {
  cardNumber: string
  cardName: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  email: string
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore(cartSelectors.items)
  const { subtotal, tax, total } = useCartStore(cartSelectors.total)
  const clearCart = useCartStore(cartSelectors.clearCart)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>()

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart')
    }
  }, [items.length, navigate])

  const onSubmit = (_data: CheckoutForm) => {
    // Process payment and clear cart
    clearCart()
    navigate('/payment-confirmation')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Checkout Form */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Payment Information
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Card Number */}
                  <div className="col-span-2">
                    <Input
                      placeholder="Card Number"
                      {...register('cardNumber', {
                        required: 'Card number is required',
                        pattern: {
                          value: /^[0-9]{16}$/,
                          message: 'Invalid card number',
                        },
                      })}
                      error={errors.cardNumber?.message}
                      className="bg-gray-200"
                    />
                  </div>

                  {/* Card Name */}
                  <div className="col-span-2">
                    <Input
                      placeholder="Name on Card"
                      {...register('cardName', {
                        required: 'Name on card is required',
                      })}
                      error={errors.cardName?.message}
                      className="bg-gray-200"
                    />
                  </div>

                  {/* Expiry Date */}
                  <Input
                    placeholder="MM"
                    {...register('expiryMonth', {
                      required: 'Month is required',
                      pattern: {
                        value: /^(0[1-9]|1[0-2])$/,
                        message: 'Invalid month',
                      },
                    })}
                    error={errors.expiryMonth?.message}
                    className="bg-gray-200"
                  />
                  <Input
                    placeholder="YY"
                    {...register('expiryYear', {
                      required: 'Year is required',
                      pattern: {
                        value: /^[0-9]{2}$/,
                        message: 'Invalid year',
                      },
                    })}
                    error={errors.expiryYear?.message}
                    className="bg-gray-200"
                  />

                  {/* CVV */}
                  <div className="col-span-2">
                    <Input
                      placeholder="CVV"
                      type="password"
                      {...register('cvv', {
                        required: 'CVV is required',
                        pattern: {
                          value: /^[0-9]{3,4}$/,
                          message: 'Invalid CVV',
                        },
                      })}
                      error={errors.cvv?.message}
                      className="bg-gray-200"
                    />
                  </div>

                  {/* Email */}
                  <div className="col-span-2">
                    <Input
                      placeholder="Email Address"
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      error={errors.email?.message}
                      className="bg-gray-200"
                    />
                  </div>
                </div>

                <Button type="submit" variant="synmax" size="lg" fullWidth>
                  Pay ${total.toFixed(2)}
                </Button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.product.name}
                      </p>
                      <p className="text-gray-500">
                        Qty: {item.quantity} •{' '}
                        {item.billingCycle === 'monthly' ? 'Monthly' : 'Annual'}
                      </p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {(() => {
                        const total = calculateProductTotal(
                          item.product,
                          item.quantity,
                          item.billingCycle,
                        )
                        return total === null
                          ? 'Contact for pricing'
                          : `$${total.toLocaleString()}`
                      })()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Monthly equivalent shown for annual subscriptions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

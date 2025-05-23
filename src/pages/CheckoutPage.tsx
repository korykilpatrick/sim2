import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Button from '@/components/common/Button'
import Input from '@/components/forms/Input'
import Header from '@/components/layout/Header'

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>()

  const onSubmit = (_data: CheckoutForm) => {
    // Process payment
    navigate('/payment-confirmation')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Checkout Form */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Payment</h1>

        <div className="bg-white rounded-lg shadow-lg p-8">
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

            <Button
              type="submit"
              variant="synmax"
              size="lg"
              fullWidth
            >
              Pay Now
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
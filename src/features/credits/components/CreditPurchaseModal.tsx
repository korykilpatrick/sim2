import { useState } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { CreditCard, Check } from 'lucide-react'
import { formatPrice } from '@/utils/formatPrice'

interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  savings: number
}

interface CreditPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPackage: CreditPackage | null
  onPurchaseComplete: (credits: number) => void
}

export default function CreditPurchaseModal({
  isOpen,
  onClose,
  selectedPackage,
  onPurchaseComplete,
}: CreditPurchaseModalProps) {
  const [step, setStep] = useState<'payment' | 'processing' | 'success'>(
    'payment',
  )
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePurchase = async () => {
    if (!selectedPackage) return

    setIsProcessing(true)
    setStep('processing')

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setStep('success')
    setIsProcessing(false)

    // Update user credits after short delay
    setTimeout(() => {
      onPurchaseComplete(selectedPackage.credits)
      handleClose()
    }, 1500)
  }

  const handleClose = () => {
    setStep('payment')
    setIsProcessing(false)
    onClose()
  }

  if (!selectedPackage) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Purchase Credits">
      <div className="space-y-6">
        {step === 'payment' && (
          <>
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{selectedPackage.name}</span>
                  <span className="font-medium">
                    {formatPrice(selectedPackage.credits)} credits
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per credit</span>
                  <span className="text-gray-600">
                    $
                    {(selectedPackage.price / selectedPackage.credits).toFixed(
                      2,
                    )}
                  </span>
                </div>
                {selectedPackage.savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Savings</span>
                    <span>{selectedPackage.savings}%</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${selectedPackage.price}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mock Payment Form */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Payment Information</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  This is a demo. No actual payment will be processed.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-synmax-500 focus:border-synmax-500"
                      disabled
                    />
                    <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-synmax-500 focus:border-synmax-500"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-synmax-500 focus:border-synmax-500"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handlePurchase}
                className="flex-1"
                disabled={isProcessing}
              >
                Complete Purchase
              </Button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-synmax-100 rounded-full mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-synmax-600"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Processing Payment
            </h3>
            <p className="text-gray-600">
              Please wait while we process your purchase...
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Purchase Successful!
            </h3>
            <p className="text-gray-600">
              {formatPrice(selectedPackage.credits)} credits have been added to
              your account.
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}

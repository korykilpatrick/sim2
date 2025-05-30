import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import Button from '@/components/common/Button'
import { Header } from '@/components/layout'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/features/products/services'
import { productKeys } from '@/features/products/services/productKeys'
import { useCartStore, cartSelectors } from '@/stores/cartStore'
import {
  formatPrice,
  hasStandardPricing,
  getProductPrice,
} from '@/utils/formatPrice'

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [addedToCart, setAddedToCart] = useState(false)
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'annual'>(
    'monthly',
  )
  const addItem = useCartStore(cartSelectors.addItem)

  const { data: product, isLoading } = useQuery({
    queryKey: productKeys.detail(productId!),
    queryFn: () => productApi.getProductById(productId!),
    enabled: !!productId,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Product not found
          </h1>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const handlePurchaseNow = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    navigate('/checkout', { state: { product } })
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (product) {
      addItem(product, selectedBilling)
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Back Navigation */}
      <div className="bg-gray-100 border-b">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="flex items-center justify-center bg-gray-200 rounded-lg h-96">
              <span className="text-gray-500 text-xl">Product Image</span>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <div className="mt-4">
                {hasStandardPricing(product) ? (
                  <>
                    <div className="flex gap-4">
                      {product.pricing.monthly !== null && (
                        <button
                          onClick={() => setSelectedBilling('monthly')}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            selectedBilling === 'monthly'
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          Monthly
                        </button>
                      )}
                      {product.pricing.annual !== null && (
                        <button
                          onClick={() => setSelectedBilling('annual')}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            selectedBilling === 'annual'
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          Annual
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-primary-600">
                      {formatPrice(getProductPrice(product, selectedBilling))}
                      <span className="text-base">
                        /{selectedBilling === 'monthly' ? 'month' : 'year'}
                      </span>
                      {selectedBilling === 'annual' &&
                        product.pricing.annual &&
                        product.pricing.monthly &&
                        product.pricing.annual <
                          product.pricing.monthly * 12 && (
                          <span className="text-sm text-secondary-600 ml-2">
                            Save $
                            {(
                              product.pricing.monthly * 12 -
                              product.pricing.annual
                            ).toLocaleString()}
                          </span>
                        )}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-2xl font-semibold text-primary-600">
                    {product.pricing.enterprise || 'Contact for pricing'}
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  {product.descriptions.detailed}
                </p>

                {product.descriptions.features && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Key Features
                    </h3>
                    <ul className="space-y-2">
                      {product.descriptions.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary-600 mr-2">•</span>
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.specifications && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Specifications
                    </h3>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {Object.entries(product.specifications).map(
                        ([key, value]) => (
                          <div key={key}>
                            <dt className="text-sm text-gray-500 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {value}
                            </dd>
                          </div>
                        ),
                      )}
                    </dl>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-3">
                <Button
                  variant="synmax"
                  size="lg"
                  fullWidth
                  onClick={handlePurchaseNow}
                >
                  Purchase Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={handleAddToCart}
                  className="border-gray-300"
                >
                  {addedToCart ? 'Added to Cart!' : 'Add to cart'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

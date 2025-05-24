import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import Button from '@/components/common/Button'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productService } from '@/services/products'
import { getPricingDisplayText } from '@/utils/formatPrice'

export default function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [currentSlide, setCurrentSlide] = useState(0)

  const promotionalSlides = [
    {
      id: 1,
      title: 'Welcome to SynMax Intelligence Marketplace',
      description: 'Access maritime intelligence and analytics with our pay-as-you-go platform. No contracts, no commitments.',
    },
    {
      id: 2,
      title: 'Price-Sensitive Maritime Solutions',
      description: 'Event-driven intelligence for banks, insurers, traders, and logistics firms. Only pay for what you need.',
    },
    {
      id: 3,
      title: '🎉 New Users Get 100 Free Credits!',
      description: 'Start monitoring vessels today with our flexible credit-based system. Sign up and claim your credits.',
    },
  ]

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts(),
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promotionalSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [promotionalSlides.length])

  const handleProductClick = (path: string) => {
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-dark-500 px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">SYNMAX</span>
            <span className="text-xl text-gray-300">Marketplace</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button
                variant="synmax"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  Sign In
                </Button>
                <button className="text-primary-500 hover:text-primary-400 text-sm">
                  🛒
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Promotional Slider */}
      <div className="relative h-64 overflow-hidden bg-gray-700">
        <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
          <div className="transition-opacity duration-500">
            <h2 className="text-2xl font-bold text-white">
              {promotionalSlides[currentSlide].title}
            </h2>
            <p className="mt-2 text-gray-300">
              {promotionalSlides[currentSlide].description}
            </p>
          </div>
        </div>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {promotionalSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-primary-500' : 'bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <div
                key={product.id}
                className={`rounded-lg bg-gray-200 p-6 ${
                  index === 0 ? 'bg-primary-100' : ''
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600">{product.descriptions.standard}</p>
                <div className="mt-3 text-sm text-gray-500">
                  {getPricingDisplayText(product)}
                </div>
                <Button
                  variant={index === 0 ? 'synmax' : 'secondary'}
                  size="sm"
                  onClick={() => handleProductClick(product.path)}
                  className="mt-4"
                >
                  Learn more
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
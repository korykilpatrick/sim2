import { useAuth } from '@/features/auth/hooks/useAuth'
import Button from '@/components/common/Button'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productService } from '@/services/products'
import { getPricingDisplayText } from '@/utils/formatPrice'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Fetch all products
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts(),
  })

  // Mock user's active products (in real app, this would come from user data)
  const activeProductIds = ['vessel-tracking', 'area-monitoring']
  const userProducts = allProducts
    .filter(product => activeProductIds.includes(product.id))
    .map(product => ({
      ...product,
      isActive: product.id === 'vessel-tracking', // Mock: only VTS is active
    }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 text-xl">👤</span>
            </div>
            <h1 className="ml-4 text-2xl font-bold text-gray-900">
              Welcome{user?.name ? `, ${user.name}` : ''}!
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-600 space-x-4">
          <button className="font-semibold text-gray-900">My Products</button>
          <button 
            onClick={() => navigate('/team')}
            className="hover:text-gray-900"
          >
            My Team
          </button>
          <button 
            onClick={() => navigate('/billing')}
            className="hover:text-gray-900"
          >
            Billing & Plan
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className="hover:text-gray-900"
          >
            Settings
          </button>
        </nav>
      </div>

      {/* Products Grid */}
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading your products...</p>
          </div>
        ) : userProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">You don't have any active products yet</p>
            <Button
              variant="synmax"
              onClick={() => navigate('/')}
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {userProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow p-6 flex items-start gap-6"
              >
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <span className="text-gray-400 text-xl font-semibold">
                    {product.shortName || product.name.substring(0, 3).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {product.descriptions.detailed}
                  </p>
                  <div className="mt-3 text-sm text-gray-500">
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1)} • 
                    {getPricingDisplayText(product)}
                  </div>
                </div>

                <Button
                  variant={product.isActive ? 'secondary' : 'primary'}
                  onClick={() => {
                    if (product.id === 'vessel-tracking') {
                      navigate('/vessels')
                    } else if (product.id === 'area-monitoring') {
                      navigate('/areas')
                    } else {
                      // For other products, navigate to their detail page
                      navigate(product.path)
                    }
                  }}
                >
                  {product.isActive ? 'Launch' : 'Activate'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

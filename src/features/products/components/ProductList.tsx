import { Product } from '@/types/product'
import ProductCard from './ProductCard'
import { NoSearchResults } from '@/components/empty-states/EmptyStatePresets'

interface ProductListProps {
  products: Product[]
  onAddToCart?: (product: Product) => void
  isLoading?: boolean
}

export default function ProductList({
  products,
  onAddToCart,
  isLoading,
}: ProductListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-64 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <NoSearchResults
        title="No products found"
        description="Try adjusting your search filters or check back later."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  )
}

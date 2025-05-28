import { useState } from 'react'
import { PageLayout } from '@/components/layout'
import { useProducts } from '../hooks'
import { ProductList, ProductSearch, ProductFilters } from '../components'
import { ProductFilter } from '../types'
import { useCartStore, cartSelectors } from '@/stores/cartStore'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Product } from '@/types/product'

export default function ProductsPage() {
  const [filters, setFilters] = useState<ProductFilter>({})
  const { data: products = [], isLoading } = useProducts(filters)
  const addItem = useCartStore(cartSelectors.addItem)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }))
  }

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    addItem(product, 'monthly')
  }

  return (
    <PageLayout
      title="Products"
      subtitle="Explore our maritime intelligence products and services"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <ProductSearch onSearch={handleSearch} />
          <ProductFilters filters={filters} onFilterChange={setFilters} />
        </div>

        <ProductList
          products={products}
          onAddToCart={handleAddToCart}
          isLoading={isLoading}
        />
      </div>
    </PageLayout>
  )
}

import { Product } from '@/types/product'
import { Card } from '@/components/common'
import { Button } from '@/components/common'
import { useNavigate } from 'react-router-dom'
import { formatPrice, hasStandardPricing } from '@/utils/formatPrice'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const navigate = useNavigate()

  const handleViewDetails = () => {
    navigate(`/products/${product.id}`)
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{product.shortName}</p>
        </div>

        <p className="text-sm text-gray-600 mb-4 flex-1">
          {product.descriptions.brief}
        </p>

        <div className="mb-4">
          {hasStandardPricing(product) ? (
            <div className="flex items-baseline gap-2">
              {product.pricing.monthly && (
                <span className="text-xl font-semibold text-primary-600">
                  {formatPrice(product.pricing.monthly)}/mo
                </span>
              )}
              {product.pricing.annual && !product.pricing.monthly && (
                <span className="text-xl font-semibold text-primary-600">
                  {formatPrice(product.pricing.annual)}/yr
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-600">
              {product.pricing.enterprise || 'Contact for pricing'}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="flex-1"
          >
            View Details
          </Button>
          {hasStandardPricing(product) && onAddToCart && (
            <Button
              variant="synmax"
              size="sm"
              onClick={() => onAddToCart(product)}
              className="flex-1"
            >
              Add to Cart
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/common'
import { cn } from '@utils/cn'
import { formatPrice } from '@utils/formatPrice'
import type { ProductUsageStats } from '../types'

interface ProductUsageTableProps {
  products: ProductUsageStats[]
  title?: string
}

export default function ProductUsageTable({
  products,
  title = 'Product Performance',
}: ProductUsageTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Users
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const isPositive = product.trend > 0
                const isNegative = product.trend < 0

                return (
                  <tr key={product.productId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.productName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.productId.toUpperCase()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {product.activeUsers.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {product.totalUsage.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {formatPrice(product.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {isPositive && (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        )}
                        {isNegative && (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        {product.trend === 0 && (
                          <Minus className="h-4 w-4 text-gray-400" />
                        )}
                        <span
                          className={cn(
                            'text-sm font-medium',
                            isPositive && 'text-green-600',
                            isNegative && 'text-red-600',
                            product.trend === 0 && 'text-gray-500',
                          )}
                        >
                          {isPositive && '+'}
                          {product.trend}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

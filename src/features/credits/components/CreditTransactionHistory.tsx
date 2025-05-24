import { formatDate } from '@/utils/date'
import { formatPrice } from '@/utils/formatPrice'
import { ArrowDownRight, ArrowUpRight, Package } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface CreditTransaction {
  id: string
  type: 'purchase' | 'usage' | 'refund'
  description: string
  amount: number
  balance: number
  createdAt: string
  service?: string
  referenceId?: string
}

interface CreditTransactionHistoryProps {
  transactions: CreditTransaction[]
}

export default function CreditTransactionHistory({
  transactions,
}: CreditTransactionHistoryProps) {
  const getTransactionIcon = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'purchase':
        return <ArrowDownRight className="h-5 w-5 text-green-600" />
      case 'usage':
        return <ArrowUpRight className="h-5 w-5 text-red-600" />
      case 'refund':
        return <Package className="h-5 w-5 text-blue-600" />
    }
  }

  const getTransactionColor = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'purchase':
        return 'text-green-600'
      case 'usage':
        return 'text-red-600'
      case 'refund':
        return 'text-blue-600'
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No transactions yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Your credit purchase and usage history will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              {getTransactionIcon(transaction.type)}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {transaction.description}
              </p>
              {transaction.service && (
                <p className="text-sm text-gray-600 mt-0.5">
                  {transaction.service}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(transaction.createdAt)}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p
              className={cn(
                'font-semibold',
                getTransactionColor(transaction.type),
              )}
            >
              {transaction.type === 'usage' ? '-' : '+'}
              {formatPrice(Math.abs(transaction.amount))}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">
              Balance: {formatPrice(transaction.balance)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

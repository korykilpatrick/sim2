import { AlertTriangle } from 'lucide-react'
import Button from '@/components/common/Button'
import { Link } from 'react-router-dom'

interface LowBalanceWarningProps {
  currentBalance: number
  threshold?: number
  onPurchaseClick?: () => void
}

export default function LowBalanceWarning({
  currentBalance,
  threshold = 50,
  onPurchaseClick,
}: LowBalanceWarningProps) {
  if (currentBalance > threshold) return null

  const isVeryLow = currentBalance <= 10
  const bgColor = isVeryLow
    ? 'bg-red-50 border-red-200'
    : 'bg-yellow-50 border-yellow-200'
  const iconColor = isVeryLow ? 'text-red-600' : 'text-yellow-600'
  const textColor = isVeryLow ? 'text-red-800' : 'text-yellow-800'

  return (
    <div
      className={`rounded-lg border p-4 ${bgColor}`}
      data-testid="low-balance-warning"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${textColor}`}>
            {isVeryLow
              ? 'Critical: Very low credit balance'
              : 'Low credit balance'}
          </h3>
          <div className={`mt-2 text-sm ${textColor}`}>
            <p>
              You have only {currentBalance} credits remaining.
              {isVeryLow
                ? ' Purchase more credits to continue using our services.'
                : ' Consider purchasing more credits to avoid service interruption.'}
            </p>
          </div>
          <div className="mt-3">
            {onPurchaseClick ? (
              <Button variant="primary" size="sm" onClick={onPurchaseClick}>
                Purchase Credits
              </Button>
            ) : (
              <Link to="/credits">
                <Button variant="primary" size="sm">
                  Purchase Credits
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

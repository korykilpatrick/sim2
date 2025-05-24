import { cn } from '@/utils/cn'

interface RiskScoreBadgeProps {
  score: number
  level: 'low' | 'medium' | 'high' | 'critical'
  showScore?: boolean
  className?: string
}

export default function RiskScoreBadge({
  score,
  level,
  showScore = true,
  className,
}: RiskScoreBadgeProps) {
  const levelConfig = {
    low: {
      label: 'Low Risk',
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    medium: {
      label: 'Medium Risk',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    high: {
      label: 'High Risk',
      className: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    critical: {
      label: 'Critical Risk',
      className: 'bg-red-100 text-red-800 border-red-200',
    },
  }

  const config = levelConfig[level]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border',
        config.className,
        className,
      )}
    >
      <span className="text-sm font-medium">{config.label}</span>
      {showScore && <span className="text-lg font-bold">{score}</span>}
    </div>
  )
}

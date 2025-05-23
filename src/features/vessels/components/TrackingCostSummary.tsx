interface TrackingCostSummaryProps {
  creditsPerDay: number
  totalCredits: number
  trackingDays: number
}

export default function TrackingCostSummary({
  creditsPerDay,
  totalCredits,
  trackingDays,
}: TrackingCostSummaryProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">Estimated Cost</p>
          <p className="text-sm text-gray-500">
            {creditsPerDay} credits/day × {trackingDays} days
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{totalCredits}</p>
          <p className="text-sm text-gray-500">total credits</p>
        </div>
      </div>
    </div>
  )
}

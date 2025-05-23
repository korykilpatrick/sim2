import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'

export default function EmptyTrackingState() {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No active tracking
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by tracking your first vessel
        </p>
        <div className="mt-6">
          <Link to="/vessels/track">
            <Button variant="primary">Track Vessel</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

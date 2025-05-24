import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/common/Card'
import Button from '@/components/common/Button'
import { VesselTracking } from '../types/vessel'
import { cn } from '@/utils/cn'

interface VesselTrackingCardProps {
  tracking: VesselTracking
}

export default function VesselTrackingCard({
  tracking,
}: VesselTrackingCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{tracking.vessel.name}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              IMO: {tracking.vessel.imo} | Flag: {tracking.vessel.flag}
            </p>
          </div>
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              tracking.vessel.riskLevel === 'low' &&
                'bg-green-100 text-green-800',
              tracking.vessel.riskLevel === 'medium' &&
                'bg-yellow-100 text-yellow-800',
              tracking.vessel.riskLevel === 'high' &&
                'bg-orange-100 text-orange-800',
              tracking.vessel.riskLevel === 'critical' &&
                'bg-red-100 text-red-800',
            )}
          >
            {tracking.vessel.riskLevel} risk
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Status:</dt>
            <dd className="font-medium text-gray-900">
              {tracking.vessel.status}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Last Position:</dt>
            <dd className="font-medium text-gray-900">
              {new Date(
                tracking.vessel.lastPosition.timestamp,
              ).toLocaleString()}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Alerts:</dt>
            <dd className="font-medium text-gray-900">
              {tracking.alertsCount}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Credits/Day:</dt>
            <dd className="font-medium text-gray-900">
              {tracking.creditsPerDay}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex gap-2">
          <Link to={`/vessels/${tracking.id}`} className="flex-1">
            <Button variant="outline" size="sm" fullWidth>
              View Details
            </Button>
          </Link>
          <Button variant="ghost" size="sm">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

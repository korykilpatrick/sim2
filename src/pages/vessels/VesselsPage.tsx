import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { vesselsApi } from '@/api/vessels'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'

export default function VesselsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: trackings, isLoading } = useQuery({
    queryKey: ['vessel-trackings'],
    queryFn: () => vesselsApi.getMyTrackings(),
  })

  const activeTrackings = trackings?.data?.filter(t => t.status === 'active') || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vessel Tracking</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor individual vessels with customizable alerts
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/vessels/track">
            <Button>
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Track New Vessel
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="max-w-md">
            <Input
              type="search"
              placeholder="Search by vessel name, IMO, or MMSI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Trackings */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Active Vessel Tracking ({activeTrackings.length})
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : activeTrackings.length === 0 ? (
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active tracking</h3>
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
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeTrackings.map((tracking) => (
              <Card key={tracking.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{tracking.vessel.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        IMO: {tracking.vessel.imo} | Flag: {tracking.vessel.flag}
                      </p>
                    </div>
                    <span
                      className={clsx(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        tracking.vessel.riskLevel === 'low' && 'bg-green-100 text-green-800',
                        tracking.vessel.riskLevel === 'medium' && 'bg-yellow-100 text-yellow-800',
                        tracking.vessel.riskLevel === 'high' && 'bg-orange-100 text-orange-800',
                        tracking.vessel.riskLevel === 'critical' && 'bg-red-100 text-red-800',
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
                      <dd className="font-medium text-gray-900">{tracking.vessel.status}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Last Position:</dt>
                      <dd className="font-medium text-gray-900">
                        {new Date(tracking.vessel.lastPosition.timestamp).toLocaleString()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Alerts:</dt>
                      <dd className="font-medium text-gray-900">{tracking.alertsCount}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Credits/Day:</dt>
                      <dd className="font-medium text-gray-900">{tracking.creditsPerDay}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" fullWidth>
                      View Details
                    </Button>
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
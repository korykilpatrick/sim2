import { useState } from 'react'
import { Card, CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'

export default function AreasPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = [
    { label: 'Active Monitoring', value: '0', change: '+0%' },
    { label: 'Total Alerts', value: '0', change: '+0%' },
    { label: 'Areas Covered', value: '0 km²', change: '+0%' },
    { label: 'Credits/Day', value: '0', change: '+0%' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Area Monitoring</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor specific maritime areas of interest with real-time alerts
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
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
            Create New Area
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <dt className="text-sm font-medium text-gray-500">{stat.label}</dt>
              <dd className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-semibold text-gray-900">{stat.value}</span>
                <span className="text-sm text-gray-500">{stat.change}</span>
              </dd>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="max-w-md">
            <Input
              type="search"
              placeholder="Search by area name or coordinates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
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
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No areas monitored</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by defining your first area of interest
          </p>
          <div className="mt-6">
            <Button variant="primary">Create Area</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
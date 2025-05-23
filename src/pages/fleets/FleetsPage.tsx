import { useState } from 'react'
import { Card, CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'

export default function FleetsPage() {
  const [activeTab, setActiveTab] = useState<'fleets' | 'vessels'>('fleets')
  const [searchQuery, setSearchQuery] = useState('')

  const stats = [
    { label: 'Total Fleets', value: '0', icon: '⚓' },
    { label: 'Tracked Vessels', value: '0', icon: '🚢' },
    { label: 'Active Alerts', value: '0', icon: '🔔' },
    { label: 'Credits/Month', value: '0', icon: '💳' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Tracking</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive fleet management and monitoring
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
            Create Fleet
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500">{stat.label}</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stat.value}</dd>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('fleets')}
            className={clsx(
              activeTab === 'fleets'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            )}
          >
            My Fleets
          </button>
          <button
            onClick={() => setActiveTab('vessels')}
            className={clsx(
              activeTab === 'vessels'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            )}
          >
            All Vessels
          </button>
        </nav>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="max-w-md">
            <Input
              type="search"
              placeholder={
                activeTab === 'fleets'
                  ? 'Search fleets...'
                  : 'Search vessels in fleets...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {activeTab === 'fleets' ? (
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No fleets created</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first fleet to start monitoring multiple vessels
            </p>
            <div className="mt-6">
              <Button variant="primary">Create Fleet</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No vessels in fleets</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
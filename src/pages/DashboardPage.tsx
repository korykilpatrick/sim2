import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import Button from '@/components/common/Button'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    { name: 'Active Vessel Tracking', value: '0', change: '+0%', changeType: 'positive' },
    { name: 'Area Monitoring', value: '0', change: '+0%', changeType: 'positive' },
    { name: 'Fleet Vessels', value: '0', change: '+0%', changeType: 'neutral' },
    { name: 'Reports Generated', value: '0', change: '+0%', changeType: 'positive' },
  ]

  const services = [
    {
      name: 'Vessel Tracking Service',
      description: 'Track individual vessels with customizable alerts',
      href: '/vessels',
      icon: '🚢',
      color: 'bg-blue-500',
    },
    {
      name: 'Area Monitoring Service',
      description: 'Monitor specific maritime areas of interest',
      href: '/areas',
      icon: '🗺️',
      color: 'bg-green-500',
    },
    {
      name: 'Fleet Tracking Service',
      description: 'Comprehensive fleet management and monitoring',
      href: '/fleets',
      icon: '⚓',
      color: 'bg-purple-500',
    },
    {
      name: 'Compliance Reports',
      description: 'Generate detailed vessel compliance reports',
      href: '/reports/compliance',
      icon: '📋',
      color: 'bg-yellow-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || 'User'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your maritime intelligence today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="overflow-hidden">
            <CardContent className="p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                {stat.name}
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {stat.value}
              </dd>
              <dd className="mt-1 flex items-baseline">
                <span
                  className={clsx(
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-gray-500',
                    'text-sm font-semibold',
                  )}
                >
                  {stat.change}
                </span>
                <span className="ml-2 text-sm text-gray-500">from last month</span>
              </dd>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Services Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Available Services
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Card key={service.name} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div
                    className={clsx(
                      service.color,
                      'flex h-12 w-12 items-center justify-center rounded-lg text-white text-2xl',
                    )}
                  >
                    {service.icon}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {service.name}
                    </h3>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-500">{service.description}</p>
                <div className="mt-4">
                  <Link to={service.href}>
                    <Button variant="outline" size="sm" fullWidth>
                      Get Started
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">No recent activity to display</p>
            <Link to="/vessels" className="mt-4 inline-block">
              <Button variant="primary" size="sm">
                Start Tracking Vessels
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
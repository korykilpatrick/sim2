import { DashboardService } from '../types'

export function useDashboardServices() {
  // In a real app, this might come from an API or be based on user permissions
  const services: DashboardService[] = [
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
      href: '/reports',
      icon: '📋',
      color: 'bg-yellow-500',
    },
  ]

  return {
    services,
  }
}

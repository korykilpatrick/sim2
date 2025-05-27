/**
 * @module useDashboardServices
 * @description Hook for retrieving available SIM services displayed on the dashboard.
 * Returns a static list of services with navigation links and styling information.
 */

import { DashboardService } from '../types'

/**
 * Get available dashboard services for navigation
 * @returns {Object} Object containing services array
 * @example
 * ```typescript
 * function ServicesGrid() {
 *   const { services } = useDashboardServices()
 *
 *   return (
 *     <div className="grid grid-cols-3 gap-4">
 *       {services.map(service => (
 *         <ServiceCard key={service.name} {...service} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
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
      name: 'Maritime Investigations',
      description: 'Request expert analysis and intelligence',
      href: '/investigations',
      icon: '🔍',
      color: 'bg-indigo-500',
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

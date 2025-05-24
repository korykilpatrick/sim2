// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  activity: () => [...dashboardKeys.all, 'activity'] as const,
  services: () => [...dashboardKeys.all, 'services'] as const,
}

export { useDashboardStats } from './useDashboardStats'
export { useDashboardServices } from './useDashboardServices'

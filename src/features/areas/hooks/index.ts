import type { AreaFilters } from '../types'

// Query keys
export const areaKeys = {
  all: ['areas'] as const,
  lists: () => [...areaKeys.all, 'list'] as const,
  list: (filters?: AreaFilters) => [...areaKeys.lists(), filters] as const,
  details: () => [...areaKeys.all, 'detail'] as const,
  detail: (id: string) => [...areaKeys.details(), id] as const,
  monitoring: (id: string) => [...areaKeys.all, 'monitoring', id] as const,
  alerts: (
    id: string,
    filters?: {
      severity?: 'low' | 'medium' | 'high' | 'critical'
      type?: string
      isRead?: boolean
      limit?: number
      page?: number
    },
  ) => [...areaKeys.all, 'alerts', id, filters] as const,
  statistics: () => [...areaKeys.all, 'statistics'] as const,
  criteria: () => [...areaKeys.all, 'monitoring-criteria'] as const,
  cost: (config: {
    sizeKm2: number
    criteria: string[]
    updateFrequency: number
    duration: number
  }) => [...areaKeys.all, 'cost', config] as const,
  vessels: (id: string) => [...areaKeys.all, 'vessels', id] as const,
}

export * from './useAreas'
export * from './useAreaMonitoring'

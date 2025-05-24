import type { ReportFilters } from '../types'

// Query keys
export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (filters?: ReportFilters) => [...reportKeys.lists(), filters] as const,
  details: () => [...reportKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
  status: (id: string) => [...reportKeys.all, 'status', id] as const,
  templates: () => [...reportKeys.all, 'templates'] as const,
  statistics: () => [...reportKeys.all, 'statistics'] as const,
  vesselReports: (vesselId: string) =>
    [...reportKeys.all, 'vessel', vesselId] as const,
}

export * from './useReports'

// Query keys
export const vesselKeys = {
  all: ['vessels'] as const,
  lists: () => [...vesselKeys.all, 'list'] as const,
  list: () => [...vesselKeys.lists()] as const,
  details: () => [...vesselKeys.all, 'detail'] as const,
  detail: (id: string) => [...vesselKeys.details(), id] as const,
  trackings: () => [...vesselKeys.all, 'trackings'] as const,
  tracking: (id: string) => [...vesselKeys.trackings(), id] as const,
  trackingCriteria: () => [...vesselKeys.all, 'tracking-criteria'] as const,
  search: (query: string) => [...vesselKeys.all, 'search', query] as const,
}

export { useVesselTrackings } from './useVesselTrackings'
export { useVesselSearch } from './useVesselSearch'

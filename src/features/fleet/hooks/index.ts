// Query keys
export const fleetKeys = {
  all: ['fleets'] as const,
  lists: () => [...fleetKeys.all, 'list'] as const,
  list: () => [...fleetKeys.lists()] as const,
  details: () => [...fleetKeys.all, 'detail'] as const,
  detail: (id: string) => [...fleetKeys.details(), id] as const,
  stats: () => [...fleetKeys.all, 'stats'] as const,
  search: (query: string) => [...fleetKeys.all, 'search', query] as const,
  vessels: (fleetId: string) =>
    [...fleetKeys.detail(fleetId), 'vessels'] as const,
  vesselSearch: (fleetId: string, query: string) =>
    [...fleetKeys.vessels(fleetId), 'search', query] as const,
}

export * from './useFleets'
export * from './useFleetVessels'

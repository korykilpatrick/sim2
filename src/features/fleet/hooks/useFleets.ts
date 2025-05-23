import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fleetService } from '../services/fleetService'
import type { CreateFleetInput, UpdateFleetInput } from '../types'

export const useFleets = () => {
  return useQuery({
    queryKey: ['fleets'],
    queryFn: fleetService.getFleets,
  })
}

export const useFleet = (id: string) => {
  return useQuery({
    queryKey: ['fleets', id],
    queryFn: () => fleetService.getFleet(id),
    enabled: !!id,
  })
}

export const useFleetStats = () => {
  return useQuery({
    queryKey: ['fleets', 'stats'],
    queryFn: fleetService.getFleetStats,
  })
}

export const useCreateFleet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFleetInput) => fleetService.createFleet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fleets'] })
      queryClient.invalidateQueries({ queryKey: ['fleets', 'stats'] })
    },
  })
}

export const useUpdateFleet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFleetInput }) =>
      fleetService.updateFleet(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['fleets'] })
      queryClient.invalidateQueries({ queryKey: ['fleets', id] })
      queryClient.invalidateQueries({ queryKey: ['fleets', 'stats'] })
    },
  })
}

export const useDeleteFleet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => fleetService.deleteFleet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fleets'] })
      queryClient.invalidateQueries({ queryKey: ['fleets', 'stats'] })
    },
  })
}

export const useSearchFleets = (query: string) => {
  return useQuery({
    queryKey: ['fleets', 'search', query],
    queryFn: () => fleetService.searchFleets(query),
    enabled: query.length > 0,
  })
}

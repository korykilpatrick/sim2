import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fleetService } from '../services/fleetService'
import type {
  AddVesselToFleetInput,
  RemoveVesselFromFleetInput,
} from '../types'

export const useFleetVessels = (fleetId: string) => {
  return useQuery({
    queryKey: ['fleets', fleetId, 'vessels'],
    queryFn: () => fleetService.getFleetVessels(fleetId),
    enabled: !!fleetId,
  })
}

export const useAddVesselToFleet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddVesselToFleetInput) =>
      fleetService.addVesselToFleet(data),
    onSuccess: (_, { fleetId }) => {
      queryClient.invalidateQueries({
        queryKey: ['fleets', fleetId, 'vessels'],
      })
      queryClient.invalidateQueries({ queryKey: ['fleets', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['fleets', fleetId] })
    },
  })
}

export const useRemoveVesselFromFleet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RemoveVesselFromFleetInput) =>
      fleetService.removeVesselFromFleet(data),
    onSuccess: (_, { fleetId }) => {
      queryClient.invalidateQueries({
        queryKey: ['fleets', fleetId, 'vessels'],
      })
      queryClient.invalidateQueries({ queryKey: ['fleets', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['fleets', fleetId] })
    },
  })
}

export const useSearchFleetVessels = (fleetId: string, query: string) => {
  return useQuery({
    queryKey: ['fleets', fleetId, 'vessels', 'search', query],
    queryFn: () => fleetService.searchFleetVessels(fleetId, query),
    enabled: !!fleetId && query.length > 0,
  })
}

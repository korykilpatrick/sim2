import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fleetService } from '../services/fleetService'
import type {
  AddVesselToFleetInput,
  RemoveVesselFromFleetInput,
} from '../types'
import { fleetKeys } from './'

export const useFleetVessels = (fleetId: string) => {
  return useQuery({
    queryKey: fleetKeys.vessels(fleetId),
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
        queryKey: fleetKeys.vessels(fleetId),
      })
      queryClient.invalidateQueries({ queryKey: fleetKeys.stats() })
      queryClient.invalidateQueries({ queryKey: fleetKeys.detail(fleetId) })
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
        queryKey: fleetKeys.vessels(fleetId),
      })
      queryClient.invalidateQueries({ queryKey: fleetKeys.stats() })
      queryClient.invalidateQueries({ queryKey: fleetKeys.detail(fleetId) })
    },
  })
}

export const useSearchFleetVessels = (fleetId: string, query: string) => {
  return useQuery({
    queryKey: fleetKeys.vesselSearch(fleetId, query),
    queryFn: () => fleetService.searchFleetVessels(fleetId, query),
    enabled: !!fleetId && query.length > 0,
  })
}
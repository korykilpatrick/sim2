import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fleetService } from '../services/fleetService'
import type { CreateFleetInput, UpdateFleetInput } from '../types'
import { useToast } from '@/hooks/useToast'
import { fleetKeys } from './'

export const useFleets = () => {
  return useQuery({
    queryKey: fleetKeys.all,
    queryFn: fleetService.getFleets,
  })
}

export const useFleet = (id: string) => {
  return useQuery({
    queryKey: fleetKeys.detail(id),
    queryFn: () => fleetService.getFleet(id),
    enabled: !!id,
  })
}

export const useFleetStats = () => {
  return useQuery({
    queryKey: fleetKeys.stats(),
    queryFn: fleetService.getFleetStats,
  })
}

export const useCreateFleet = () => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async (data: CreateFleetInput) => {
      // Note: Credit deduction will happen when vessels are added to the fleet
      // since CreateFleetInput doesn't include vessel IDs
      return fleetService.createFleet(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.all })
      queryClient.invalidateQueries({ queryKey: fleetKeys.stats() })
      showToast({ type: 'success', message: 'Fleet created successfully' })
    },
    onError: (error: Error) => {
      showToast({
        type: 'error',
        message: error.message || 'Failed to create fleet',
      })
    },
  })
}

export const useUpdateFleet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFleetInput }) =>
      fleetService.updateFleet(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.all })
      queryClient.invalidateQueries({ queryKey: fleetKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: fleetKeys.stats() })
    },
  })
}

export const useDeleteFleet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => fleetService.deleteFleet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.all })
      queryClient.invalidateQueries({ queryKey: fleetKeys.stats() })
    },
  })
}

export const useSearchFleets = (query: string) => {
  return useQuery({
    queryKey: fleetKeys.search(query),
    queryFn: () => fleetService.searchFleets(query),
    enabled: query.length > 0,
  })
}

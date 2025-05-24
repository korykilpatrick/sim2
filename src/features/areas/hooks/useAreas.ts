import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { areaApi } from '../services/areaService'
import type { AreaFilters, CreateAreaRequest } from '../types'
import { useCreditDeduction } from '@/features/shared/hooks'
import { creditService } from '@/features/shared/services'
import { calculateAreaSize } from '../utils'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/api/types'
import { areaKeys } from './'

export function useAreas(filters?: AreaFilters) {
  return useQuery({
    queryKey: areaKeys.list(filters),
    queryFn: () => areaApi.getAreas(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useArea(id: string) {
  return useQuery({
    queryKey: areaKeys.detail(id),
    queryFn: () => areaApi.getArea(id),
    enabled: !!id,
  })
}

export function useCreateArea() {
  const queryClient = useQueryClient()
  const { deductCredits } = useCreditDeduction()

  return useMutation({
    mutationFn: async (data: CreateAreaRequest) => {
      // Calculate credit cost
      const days = data.duration
      const areaSize = calculateAreaSize(data.geometry)
      const creditCost = creditService.calculateServiceCost('area_monitoring', {
        areaSize,
        days,
      })

      // Check if user has sufficient credits
      const hasSufficientCredits =
        await creditService.checkSufficientCredits(creditCost)
      if (!hasSufficientCredits) {
        throw new Error(
          `Insufficient credits. This monitoring requires ${creditCost} credits.`,
        )
      }

      // First deduct credits
      await deductCredits({
        amount: creditCost,
        description: `Area monitoring for "${data.name}"`,
        serviceId: `area_${Date.now()}`,
        serviceType: 'area_monitoring',
        metadata: {
          areaName: data.name,
          geometry: data.geometry,
          duration: data.duration,
          criteria: data.criteria,
        },
      })

      // Then create the area
      return areaApi.createArea(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areaKeys.all })
      queryClient.invalidateQueries({ queryKey: areaKeys.statistics() })
      toast.success('Area created successfully')
    },
    onError: (error: AxiosError<{ error?: ApiError }>) => {
      toast.error(
        error.response?.data?.error?.message ||
          error.message ||
          'Failed to create area',
      )
    },
  })
}

export function useUpdateArea(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<CreateAreaRequest>) =>
      areaApi.updateArea(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areaKeys.all })
      queryClient.invalidateQueries({ queryKey: areaKeys.detail(id) })
      toast.success('Area updated successfully')
    },
    onError: (error: AxiosError<{ error?: ApiError }>) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to update area',
      )
    },
  })
}

export function useDeleteArea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => areaApi.deleteArea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areaKeys.all })
      queryClient.invalidateQueries({ queryKey: areaKeys.statistics() })
      toast.success('Area deleted successfully')
    },
    onError: (error: AxiosError<{ error?: ApiError }>) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to delete area',
      )
    },
  })
}

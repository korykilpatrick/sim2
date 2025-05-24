import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { areaApi } from '../services/areaService'
import type { AreaFilters, CreateAreaRequest } from '../types'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api'
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

  return useMutation({
    mutationFn: (data: CreateAreaRequest) => areaApi.createArea(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areaKeys.all })
      queryClient.invalidateQueries({ queryKey: areaKeys.statistics() })
      toast.success('Area created successfully')
    },
    onError: (error: AxiosError<{ error?: ApiError }>) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to create area',
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

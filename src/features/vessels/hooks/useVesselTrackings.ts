import { useQuery } from '@tanstack/react-query'
import { vesselsApi } from '../services/vessels'

export function useVesselTrackings() {
  return useQuery({
    queryKey: ['vessel-trackings'],
    queryFn: () => vesselsApi.getMyTrackings(),
  })
}

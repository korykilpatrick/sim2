import { useQuery } from '@tanstack/react-query'
import { vesselsApi } from '../services/vessels'
import { vesselKeys } from './'

/**
 * Hook for fetching user's active vessel trackings.
 * Uses React Query for caching and automatic refetching.
 *
 * @returns Query result with vessel trackings data
 *
 * @example
 * const { data: trackings, isLoading, error } = useVesselTrackings();
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error />;
 *
 * trackings.data.map(tracking => (
 *   <TrackingCard key={tracking.id} tracking={tracking} />
 * ));
 */
export function useVesselTrackings() {
  return useQuery({
    queryKey: vesselKeys.trackings(),
    queryFn: () => vesselsApi.getMyTrackings(),
  })
}

import { useQuery } from '@tanstack/react-query'
import { productApi } from '../services'
import { productKeys } from '../services/productKeys'
import { ProductFilter } from '../types'

export default function useProducts(filters?: ProductFilter) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productApi.getProducts(filters),
  })
}

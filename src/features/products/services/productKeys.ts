/**
 * @module productKeys
 * @description Query key factory for React Query product-related queries.
 * Provides consistent and type-safe query keys for caching and invalidation.
 */

/**
 * Product query keys factory for React Query
 * @example
 * ```typescript
 * // Use in React Query hooks
 * const { data } = useQuery({
 *   queryKey: productKeys.detail('prod123'),
 *   queryFn: () => productService.getProduct('prod123')
 * })
 *
 * // Invalidate all product queries
 * queryClient.invalidateQueries({ queryKey: productKeys.all })
 *
 * // Invalidate specific product
 * queryClient.invalidateQueries({ queryKey: productKeys.detail('prod123') })
 * ```
 */
export const productKeys = {
  /** Base key for all product queries */
  all: ['products'] as const,

  /** Key for product list queries */
  lists: () => [...productKeys.all, 'list'] as const,

  /** Key for filtered product list with parameters */
  list: (params?: { category?: string; search?: string; sort?: string }) =>
    [...productKeys.lists(), params] as const,

  /** Base key for product detail queries */
  details: () => [...productKeys.all, 'detail'] as const,

  /** Key for specific product detail by ID */
  detail: (id: string) => [...productKeys.details(), id] as const,

  /** Key for products filtered by category */
  category: (category: string) =>
    [...productKeys.all, 'category', category] as const,

  /** Key for featured products query */
  featured: () => [...productKeys.all, 'featured'] as const,

  /** Key for product availability check */
  availability: (productId: string) =>
    [...productKeys.all, 'availability', productId] as const,
}

// Product query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: { category?: string; search?: string; sort?: string }) =>
    [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  category: (category: string) =>
    [...productKeys.all, 'category', category] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  availability: (productId: string) =>
    [...productKeys.all, 'availability', productId] as const,
}

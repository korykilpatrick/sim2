// Re-export product types from shared types
export type { Product } from '@/types/product'

// Product-specific interfaces
export interface ProductFilter {
  category?: 'tracking' | 'monitoring' | 'reporting' | 'investigation'
  priceRange?: {
    min?: number
    max?: number
  }
  searchQuery?: string
}

export interface ProductQueryParams {
  page?: number
  limit?: number
  filters?: ProductFilter
}

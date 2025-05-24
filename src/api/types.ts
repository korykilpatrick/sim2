/**
 * API-specific type definitions.
 * These types are used across all API endpoints and responses.
 */

import type { User } from '@/features/auth/types'

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T
  message?: string
  status: 'success' | 'error'
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

/**
 * API Error response
 */
export interface ApiErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  status: 'error'
}

/**
 * Authentication responses
 */
export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

/**
 * Search and filter parameters
 */
export interface SearchParams {
  query?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface VesselSearchParams extends SearchParams {
  flags?: string[]
  types?: string[]
  status?: string[]
}

export interface AreaSearchParams extends SearchParams {
  status?: 'active' | 'inactive'
  region?: string
}

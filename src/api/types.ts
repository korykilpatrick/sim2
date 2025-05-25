/**
 * API-specific type definitions.
 * These types are used across all API endpoints and responses.
 */


/**
 * Standard API response wrapper for all endpoints.
 *
 * @template T - The type of data returned in the response
 */
export interface ApiResponse<T = unknown> {
  /** Indicates whether the request was successful */
  success: boolean
  /** The response payload */
  data: T
  /** ISO timestamp of when the response was generated */
  timestamp: string
  /** Error details if the request failed */
  error?: {
    /** Human-readable error message */
    message: string
    /** Machine-readable error code for client handling */
    code: string
    /** Additional error context or validation details */
    details?: unknown
  }
}

/**
 * API response wrapper for paginated data sets.
 * Extends ApiResponse with pagination metadata.
 *
 * @template T - The type of items in the paginated array
 *
 * @example
 * // Response type for paginated vessel list
 * type VesselListResponse = PaginatedResponse<Vessel>
 */
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  /** Pagination metadata */
  meta: {
    /** Current page number (1-indexed) */
    page: number
    /** Number of items per page */
    limit: number
    /** Total number of items across all pages */
    total: number
    /** Total number of pages available */
    totalPages: number
  }
}

/**
 * Standardized error object for API error responses.
 * Used by error interceptors and error handling utilities.
 */
export interface ApiError {
  /** User-friendly error message */
  message: string
  /** Error code for programmatic handling (e.g., 'AUTH_EXPIRED', 'VALIDATION_ERROR') */
  code: string
  /** HTTP status code */
  status: number
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

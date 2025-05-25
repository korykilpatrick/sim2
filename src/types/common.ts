/**
 * Common type definitions used across multiple features.
 * These types represent shared concepts in the maritime intelligence domain.
 */

/**
 * Risk assessment levels for vessels, areas, and compliance reports.
 * Used consistently across all features requiring risk evaluation.
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

/**
 * Alert severity levels for maritime incidents and notifications.
 * Determines the urgency and visual treatment of alerts.
 */
export type AlertSeverity = 'info' | 'warning' | 'critical'

/**
 * Common status values for asynchronous operations and reports.
 * Used for tracking the lifecycle of reports, investigations, and processing tasks.
 */
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed'

/**
 * Standard pagination metadata returned by paginated API endpoints.
 * Consistent structure for all list-based responses.
 */
export interface PaginationMeta {
  /** Current page number (1-indexed) */
  page: number
  /** Number of items per page */
  limit: number
  /** Total number of items across all pages */
  total: number
  /** Total number of pages available */
  totalPages: number
}

/**
 * Common search and filter parameters used across features.
 * Base interface for feature-specific search parameters.
 */
export interface BaseSearchParams {
  /** Search query string */
  query?: string
  /** Page number for pagination (1-indexed) */
  page?: number
  /** Number of items per page */
  limit?: number
  /** Field to sort by */
  sortBy?: string
  /** Sort direction */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Date range filter used in multiple features.
 * Consistent structure for filtering by date ranges.
 */
export interface DateRange {
  /** Start date (inclusive) in ISO format */
  startDate: string
  /** End date (inclusive) in ISO format */
  endDate: string
}

/**
 * Geographic coordinate pair.
 * Used for vessel positions, area boundaries, and location-based features.
 */
export interface Coordinates {
  /** Latitude in decimal degrees (-90 to 90) */
  lat: number
  /** Longitude in decimal degrees (-180 to 180) */
  lng: number
}

/**
 * Standard timestamp fields for auditing.
 * Applied to all entities that track creation and modification times.
 */
export interface Timestamps {
  /** ISO timestamp of entity creation */
  createdAt: string
  /** ISO timestamp of last update */
  updatedAt: string
}

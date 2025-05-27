/**
 * Date formatting utilities for consistent date display across the application
 * 
 * @module utils/date/formatters
 */

import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { DATE_FORMATS } from './constants'

/**
 * Format a date for display (e.g., "Jan 15, 2024")
 * 
 * @param {Date | string | null | undefined} date - Date to format
 * @returns {string} Formatted date string or empty string if invalid
 * 
 * @example
 * ```typescript
 * formatDate(new Date()) // "Jan 15, 2024"
 * formatDate('2024-01-15T10:30:00Z') // "Jan 15, 2024"
 * formatDate(null) // ""
 * ```
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return ''

  return format(dateObj, DATE_FORMATS.display.date)
}

/**
 * Format a date with time for display (e.g., "Jan 15, 2024 10:30 AM")
 * 
 * @param {Date | string | null | undefined} date - Date to format
 * @returns {string} Formatted date-time string or empty string if invalid
 * 
 * @example
 * ```typescript
 * formatDateTime(new Date()) // "Jan 15, 2024 10:30 AM"
 * formatDateTime('2024-01-15T10:30:00Z') // "Jan 15, 2024 10:30 AM"
 * ```
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return ''

  return format(dateObj, DATE_FORMATS.display.dateTime)
}

/**
 * Format only the time portion of a date (e.g., "10:30 AM")
 * 
 * @param {Date | string | null | undefined} date - Date to format
 * @returns {string} Formatted time string or empty string if invalid
 * 
 * @example
 * ```typescript
 * formatTime(new Date()) // "10:30 AM"
 * formatTime('2024-01-15T22:30:00Z') // "10:30 PM"
 * ```
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return ''

  return format(dateObj, DATE_FORMATS.display.time)
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "in 3 days")
 * 
 * @param {Date | string | null | undefined} date - Date to format
 * @returns {string} Relative time string or empty string if invalid
 * 
 * @example
 * ```typescript
 * formatRelativeTime(new Date(Date.now() - 3600000)) // "1 hour ago"
 * formatRelativeTime(new Date(Date.now() + 86400000)) // "in 1 day"
 * ```
 */
export function formatRelativeTime(
  date: Date | string | null | undefined,
): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return ''

  return formatDistanceToNow(dateObj, { addSuffix: true })
}

/**
 * Format a date for API requests (YYYY-MM-DD)
 * 
 * @param {Date | null | undefined} date - Date to format
 * @returns {string} API-formatted date string or empty string if invalid
 * 
 * @example
 * ```typescript
 * formatApiDate(new Date('2024-01-15')) // "2024-01-15"
 * ```
 */
export function formatApiDate(date: Date | null | undefined): string {
  if (!date || !isValid(date)) return ''

  return format(date, DATE_FORMATS.api.date)
}

/**
 * Format a date-time for API requests (ISO 8601)
 * 
 * @param {Date | null | undefined} date - Date to format
 * @returns {string} API-formatted date-time string or empty string if invalid
 * 
 * @example
 * ```typescript
 * formatApiDateTime(new Date()) // "2024-01-15T10:30:00.000Z"
 * ```
 */
export function formatApiDateTime(date: Date | null | undefined): string {
  if (!date || !isValid(date)) return ''

  return format(date, DATE_FORMATS.api.dateTime)
}

/**
 * Format a date for HTML date input fields (YYYY-MM-DD)
 * 
 * @param {Date | null | undefined} date - Date to format
 * @returns {string} Input-formatted date string or empty string if invalid
 * 
 * @example
 * ```typescript
 * <input
 *   type="date"
 *   value={formatInputDate(selectedDate)}
 *   onChange={handleDateChange}
 * />
 * ```
 */
export function formatInputDate(date: Date | null | undefined): string {
  if (!date || !isValid(date)) return ''

  return format(date, DATE_FORMATS.input.date)
}

/**
 * Format a date-time for HTML datetime-local input fields
 * 
 * @param {Date | null | undefined} date - Date to format
 * @returns {string} Input-formatted date-time string or empty string if invalid
 * 
 * @example
 * ```typescript
 * <input
 *   type="datetime-local"
 *   value={formatInputDateTime(selectedDateTime)}
 *   onChange={handleDateTimeChange}
 * />
 * ```
 */
export function formatInputDateTime(date: Date | null | undefined): string {
  if (!date || !isValid(date)) return ''

  return format(date, DATE_FORMATS.input.dateTime)
}

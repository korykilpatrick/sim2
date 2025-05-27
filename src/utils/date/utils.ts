/**
 * Date utility functions for common date operations
 * 
 * @module utils/date/utils
 */

import {
  addDays,
  addMonths,
  addYears,
  differenceInDays,
  differenceInMonths,
  startOfDay,
  endOfDay,
  isAfter,
  isBefore,
  isWithinInterval,
  parseISO,
} from 'date-fns'
import { TIME_UNITS } from './constants'

/**
 * Add a duration to a date
 * 
 * @param {Date} date - Base date
 * @param {number} duration - Amount to add
 * @param {'days' | 'months' | 'years'} unit - Unit of duration
 * @returns {Date} New date with duration added
 * 
 * @example
 * ```typescript
 * const futureDate = addDuration(new Date(), 30, 'days')
 * const nextYear = addDuration(new Date(), 1, 'years')
 * ```
 */
export function addDuration(
  date: Date,
  duration: number,
  unit: 'days' | 'months' | 'years',
): Date {
  switch (unit) {
    case 'days':
      return addDays(date, duration)
    case 'months':
      return addMonths(date, duration)
    case 'years':
      return addYears(date, duration)
    default:
      return date
  }
}

/**
 * Calculate number of days between two dates
 * 
 * @param {Date | string} startDate - Start date
 * @param {Date | string} endDate - End date
 * @returns {number} Number of days between dates
 * 
 * @example
 * ```typescript
 * const days = getDaysBetween('2024-01-01', '2024-01-31') // 30
 * const overdue = getDaysBetween(dueDate, new Date())
 * ```
 */
export function getDaysBetween(
  startDate: Date | string,
  endDate: Date | string,
): number {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
  return differenceInDays(end, start)
}

/**
 * Calculate number of months between two dates
 * 
 * @param {Date | string} startDate - Start date
 * @param {Date | string} endDate - End date
 * @returns {number} Number of months between dates
 * 
 * @example
 * ```typescript
 * const months = getMonthsBetween('2024-01-01', '2024-12-31') // 11
 * ```
 */
export function getMonthsBetween(
  startDate: Date | string,
  endDate: Date | string,
): number {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
  return differenceInMonths(end, start)
}

/**
 * Get date range for the past N days from today
 * 
 * @param {number} days - Number of days to go back
 * @returns {Object} Object with startDate and endDate
 * @returns {Date} returns.startDate - Start of the date range
 * @returns {Date} returns.endDate - End of today
 * 
 * @example
 * ```typescript
 * const last30Days = getDateRangeFromDays(30)
 * // Use for filtering data:
 * const recentData = data.filter(item => 
 *   isDateInRange(item.date, last30Days.startDate, last30Days.endDate)
 * )
 * ```
 */
export function getDateRangeFromDays(days: number): {
  startDate: Date
  endDate: Date
} {
  const endDate = new Date()
  const startDate = addDays(endDate, -days)
  return {
    startDate: startOfDay(startDate),
    endDate: endOfDay(endDate),
  }
}

/**
 * Check if a date falls within a date range (inclusive)
 * 
 * @param {Date | string} date - Date to check
 * @param {Date | string} startDate - Range start date
 * @param {Date | string} endDate - Range end date
 * @returns {boolean} True if date is within range
 * 
 * @example
 * ```typescript
 * const isValid = isDateInRange(
 *   '2024-06-15',
 *   '2024-06-01',
 *   '2024-06-30'
 * ) // true
 * ```
 */
export function isDateInRange(
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string,
): boolean {
  const checkDate = typeof date === 'string' ? parseISO(date) : date
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate

  return isWithinInterval(checkDate, { start, end })
}

/**
 * Convert milliseconds to human-readable time string
 * 
 * @param {number} milliseconds - Time duration in milliseconds
 * @returns {string} Human-readable time string
 * 
 * @example
 * ```typescript
 * getRelativeTimeString(3600000) // "1 hour"
 * getRelativeTimeString(86400000) // "1 day"
 * getRelativeTimeString(2592000000) // "1 month"
 * ```
 */
export function getRelativeTimeString(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / TIME_UNITS.second)
  const minutes = Math.floor(milliseconds / TIME_UNITS.minute)
  const hours = Math.floor(milliseconds / TIME_UNITS.hour)
  const days = Math.floor(milliseconds / TIME_UNITS.day)
  const months = Math.floor(milliseconds / TIME_UNITS.month)
  const years = Math.floor(milliseconds / TIME_UNITS.year)

  if (years > 0) return `${years} year${years > 1 ? 's' : ''}`
  if (months > 0) return `${months} month${months > 1 ? 's' : ''}`
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`
  return `${seconds} second${seconds > 1 ? 's' : ''}`
}

/**
 * Check if a date is in the future
 * 
 * @param {Date | string} date - Date to check
 * @returns {boolean} True if date is after current time
 * 
 * @example
 * ```typescript
 * if (isDateInFuture(expirationDate)) {
 *   console.log('Still valid')
 * }
 * ```
 */
export function isDateInFuture(date: Date | string): boolean {
  const checkDate = typeof date === 'string' ? parseISO(date) : date
  return isAfter(checkDate, new Date())
}

/**
 * Check if a date is in the past
 * 
 * @param {Date | string} date - Date to check
 * @returns {boolean} True if date is before current time
 * 
 * @example
 * ```typescript
 * if (isDateInPast(dueDate)) {
 *   showOverdueWarning()
 * }
 * ```
 */
export function isDateInPast(date: Date | string): boolean {
  const checkDate = typeof date === 'string' ? parseISO(date) : date
  return isBefore(checkDate, new Date())
}

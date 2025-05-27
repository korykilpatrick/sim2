/**
 * Date format constants for consistent formatting across the application
 * 
 * @module utils/date/constants
 */

/**
 * Date format strings for different contexts
 * 
 * @example
 * ```typescript
 * import { format } from 'date-fns'
 * import { DATE_FORMATS } from './constants'
 * 
 * // Display format
 * format(new Date(), DATE_FORMATS.display.date) // "Jan 15, 2024"
 * 
 * // API format
 * format(new Date(), DATE_FORMATS.api.dateTime) // "2024-01-15T10:30:00Z"
 * ```
 */
export const DATE_FORMATS = {
  display: {
    date: 'MMM dd, yyyy',
    dateTime: 'MMM dd, yyyy HH:mm',
    time: 'HH:mm',
    relative: 'relative', // for "2 hours ago" style
  },
  input: {
    date: 'yyyy-MM-dd',
    dateTime: "yyyy-MM-dd'T'HH:mm",
  },
  api: {
    date: 'yyyy-MM-dd',
    dateTime: "yyyy-MM-dd'T'HH:mm:ss'Z'",
  },
} as const

/**
 * Pre-defined duration options for dropdowns and selectors
 * 
 * @example
 * ```typescript
 * function DurationSelector({ value, onChange }: Props) {
 *   return (
 *     <select value={value} onChange={onChange}>
 *       {DURATION_OPTIONS.map(option => (
 *         <option key={option.value} value={option.value}>
 *           {option.label}
 *         </option>
 *       ))}
 *     </select>
 *   )
 * }
 * ```
 */
export const DURATION_OPTIONS = [
  { value: 7, label: '1 week' },
  { value: 14, label: '2 weeks' },
  { value: 30, label: '1 month' },
  { value: 60, label: '2 months' },
  { value: 90, label: '3 months' },
  { value: 180, label: '6 months' },
  { value: 365, label: '1 year' },
] as const

/**
 * Time unit constants in milliseconds for calculations
 * 
 * @example
 * ```typescript
 * import { TIME_UNITS } from './constants'
 * 
 * // Calculate time differences
 * const hoursSince = Math.floor(elapsed / TIME_UNITS.hour)
 * const daysUntil = Math.ceil(remaining / TIME_UNITS.day)
 * 
 * // Set intervals
 * setInterval(updateClock, TIME_UNITS.second)
 * ```
 */
export const TIME_UNITS = {
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
} as const

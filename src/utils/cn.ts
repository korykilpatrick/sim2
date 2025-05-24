import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple class values into a single string with Tailwind CSS class merging.
 * Handles conditional classes, arrays, and duplicate utility conflicts.
 *
 * @param inputs - Class values to combine (strings, arrays, conditionals)
 * @returns Merged class string with Tailwind conflicts resolved
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-500', 'hover:bg-blue-600')
 * // Returns: "px-4 py-2 bg-blue-500 hover:bg-blue-600" (if isActive is true)
 *
 * @example
 * cn('p-4', 'px-8') // Returns: "px-8 py-4" (Tailwind merge resolves conflicts)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}

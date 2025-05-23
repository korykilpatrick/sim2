/**
 * Represents a class value that can be a string, number, boolean, or nested array.
 * Used for flexible class name composition.
 */
type ClassValue = string | number | boolean | undefined | null | ClassValue[]

/**
 * Concatenates class values into a single space-separated string.
 * Filters out falsy values and flattens nested arrays.
 * 
 * @param classes - Variable number of class values to concatenate
 * @returns Space-separated string of truthy class values
 * 
 * @example
 * clsx('foo', true && 'bar', 'baz')
 * // Returns: "foo bar baz"
 * 
 * @example
 * clsx(['a', 'b'], null, undefined, 0, false, '', 'c')
 * // Returns: "a b c"
 */
export function clsx(...classes: ClassValue[]): string {
  return classes.flat().filter(Boolean).join(' ')
}

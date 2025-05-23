type ClassValue = string | number | boolean | undefined | null | ClassValue[]

export function clsx(...classes: ClassValue[]): string {
  return classes.flat().filter(Boolean).join(' ')
}

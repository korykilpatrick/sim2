/**
 * Validation service for common validation rules
 * Used across the application for consistent validation
 */

export const validation = {
  /**
   * Email validation
   */
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },

  /**
   * IMO number validation (International Maritime Organization)
   */
  imo: (value: string): boolean => {
    // IMO numbers are 7 digits starting with IMO
    const imoRegex = /^IMO\d{7}$/i
    if (!imoRegex.test(value)) return false

    // Validate check digit (last digit)
    const digits = value.slice(3)
    let sum = 0
    for (let i = 0; i < 6; i++) {
      sum += parseInt(digits[i]) * (7 - i)
    }
    const checkDigit = sum % 10
    return checkDigit === parseInt(digits[6])
  },

  /**
   * MMSI validation (Maritime Mobile Service Identity)
   */
  mmsi: (value: string): boolean => {
    // MMSI is a 9-digit number
    const mmsiRegex = /^\d{9}$/
    return mmsiRegex.test(value)
  },

  /**
   * Password strength validation
   */
  password: {
    minLength: (value: string, length = 8): boolean => value.length >= length,
    hasUpperCase: (value: string): boolean => /[A-Z]/.test(value),
    hasLowerCase: (value: string): boolean => /[a-z]/.test(value),
    hasNumber: (value: string): boolean => /\d/.test(value),
    hasSpecialChar: (value: string): boolean =>
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value),

    isStrong: (value: string): boolean => {
      return (
        validation.password.minLength(value) &&
        validation.password.hasUpperCase(value) &&
        validation.password.hasLowerCase(value) &&
        validation.password.hasNumber(value) &&
        validation.password.hasSpecialChar(value)
      )
    },
  },

  /**
   * Phone number validation (basic)
   */
  phone: (value: string): boolean => {
    // Basic phone validation - digits, spaces, +, -, (, )
    const phoneRegex = /^[\d\s+\-()]+$/
    return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10
  },

  /**
   * URL validation
   */
  url: (value: string): boolean => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },

  /**
   * Date validation
   */
  date: {
    isValid: (value: string | Date): boolean => {
      const date = value instanceof Date ? value : new Date(value)
      return !isNaN(date.getTime())
    },

    isFuture: (value: string | Date): boolean => {
      const date = value instanceof Date ? value : new Date(value)
      return date > new Date()
    },

    isPast: (value: string | Date): boolean => {
      const date = value instanceof Date ? value : new Date(value)
      return date < new Date()
    },

    isInRange: (value: string | Date, min: Date, max: Date): boolean => {
      const date = value instanceof Date ? value : new Date(value)
      return date >= min && date <= max
    },
  },

  /**
   * Number validation
   */
  number: {
    isPositive: (value: number): boolean => value > 0,
    isNegative: (value: number): boolean => value < 0,
    isInRange: (value: number, min: number, max: number): boolean =>
      value >= min && value <= max,
    isInteger: (value: number): boolean => Number.isInteger(value),
  },

  /**
   * Credit card validation (basic Luhn algorithm)
   */
  creditCard: (value: string): boolean => {
    const digits = value.replace(/\D/g, '')
    if (digits.length < 13 || digits.length > 19) return false

    let sum = 0
    let isEven = false

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  },

  /**
   * Required field validation
   */
  required: (value: unknown): boolean => {
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    return value != null
  },
}

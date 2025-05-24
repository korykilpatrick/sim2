/**
 * Utility functions for handling product pricing
 */

import { Product } from '@/types/product'

/**
 * Get the display price for a product based on billing cycle
 * Returns null if pricing is not available
 */
export function getProductPrice(
  product: Product,
  billingCycle: 'monthly' | 'annual',
): number | null {
  return product.pricing[billingCycle]
}

/**
 * Format price for display
 * Returns "Contact for pricing" if price is null
 */
export function formatPrice(price: number | null): string {
  if (price === null) {
    return 'Contact for pricing'
  }
  return `$${price.toFixed(2)}`
}

/**
 * Calculate total price for a product
 * Returns null if pricing is not available
 */
export function calculateProductTotal(
  product: Product,
  quantity: number,
  billingCycle: 'monthly' | 'annual',
): number | null {
  const price = getProductPrice(product, billingCycle)
  if (price === null) {
    return null
  }
  return price * quantity
}

/**
 * Check if product has standard pricing
 */
export function hasStandardPricing(product: Product): boolean {
  return product.pricing.monthly !== null || product.pricing.annual !== null
}

/**
 * Get pricing display text for a product
 */
export function getPricingDisplayText(product: Product): string {
  if (hasStandardPricing(product)) {
    if (product.pricing.monthly !== null) {
      return formatPrice(product.pricing.monthly) + '/month'
    }
    if (product.pricing.annual !== null) {
      return formatPrice(product.pricing.annual) + '/year'
    }
  }
  return product.pricing.enterprise || 'Contact for pricing'
}

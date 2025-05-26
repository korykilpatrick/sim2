/**
 * Product and pricing API endpoints
 * Manages product catalog, pricing, and credit purchases
 * @module api/endpoints/products
 */

import { apiClient } from '../client'
import type { ApiResponse } from '../types'
import type { Product } from '@/types/product'

/**
 * Products API client for managing product catalog and credit operations
 */
export const productsApi = {
  /**
   * Get all available products in the marketplace
   * @returns {Promise<ApiResponse<Product[]>>} List of all products
   * @throws {ApiError} 401 - Not authenticated
   * @example
   * ```typescript
   * const response = await productsApi.getAll()
   * const products = response.data.data
   * 
   * // Group products by category
   * const productsByCategory = products.reduce((acc, product) => {
   *   if (!acc[product.category]) acc[product.category] = []
   *   acc[product.category].push(product)
   *   return acc
   * }, {})
   * 
   * Object.entries(productsByCategory).forEach(([category, products]) => {
   *   console.log(`${category}: ${products.length} products`)
   * })
   * ```
   */
  getAll: () => apiClient.get<ApiResponse<Product[]>>('/products'),

  /**
   * Get detailed product information
   * @param {string} id - Product UUID
   * @returns {Promise<ApiResponse<Product>>} Complete product details
   * @throws {ApiError} 404 - Product not found
   * @example
   * ```typescript
   * const response = await productsApi.getById(productId)
   * const product = response.data.data
   * console.log(`Product: ${product.name}`)
   * console.log(`Category: ${product.category}`)
   * console.log(`Base price: ${product.baseCredits} credits`)
   * console.log(`Features: ${product.features.join(', ')}`)
   * ```
   */
  getById: (id: string) =>
    apiClient.get<ApiResponse<Product>>(`/products/${id}`),

  /**
   * Get product pricing details including volume discounts
   * @param {string} productId - Product UUID
   * @returns {Promise<ApiResponse<Object>>} Pricing structure with discounts
   * @throws {ApiError} 404 - Product not found
   * @example
   * ```typescript
   * const response = await productsApi.getPricing(productId)
   * const pricing = response.data.data
   * 
   * console.log(`Base price: ${pricing.basePrice} credits`)
   * 
   * if (pricing.volumeDiscounts.length > 0) {
   *   console.log('Volume discounts:')
   *   pricing.volumeDiscounts.forEach(discount => {
   *     console.log(`- Buy ${discount.minQuantity}+: ${discount.discountPercentage}% off`)
   *   })
   * }
   * 
   * if (pricing.subscriptionDiscount) {
   *   console.log(`Subscription discount: ${pricing.subscriptionDiscount}%`)
   * }
   * ```
   */
  getPricing: (productId: string) =>
    apiClient.get<
      ApiResponse<{
        basePrice: number
        volumeDiscounts: Array<{
          minQuantity: number
          discountPercentage: number
        }>
        subscriptionDiscount?: number
      }>
    >(`/products/${productId}/pricing`),

  /**
   * Calculate total cost for a product with specific configuration
   * @param {string} productId - Product UUID
   * @param {Record<string, unknown>} config - Product-specific configuration
   * @returns {Promise<ApiResponse<Object>>} Total cost and itemized breakdown
   * @throws {ApiError} 400 - Invalid configuration
   * @throws {ApiError} 404 - Product not found
   * @example
   * ```typescript
   * // Calculate vessel tracking cost
   * const response = await productsApi.calculateCost('vessel-tracking', {
   *   vesselCount: 5,
   *   duration: 30,
   *   criteria: ['sanctions', 'dark_activity'],
   *   alerts: true
   * })
   * const { totalCost, breakdown } = response.data.data
   * 
   * console.log(`Total cost: ${totalCost} credits`)
   * console.log('Cost breakdown:')
   * breakdown.forEach(item => {
   *   console.log(`- ${item.item}: ${item.cost} credits`)
   * })
   * ```
   */
  calculateCost: (productId: string, config: Record<string, unknown>) =>
    apiClient.post<
      ApiResponse<{
        totalCost: number
        breakdown: Array<{
          item: string
          cost: number
        }>
      }>
    >(`/products/${productId}/calculate-cost`, config),

  /**
   * Get current user's credit balance
   * @returns {Promise<ApiResponse<Object>>} Credit balance details
   * @throws {ApiError} 401 - Not authenticated
   * @example
   * ```typescript
   * const response = await productsApi.getCreditBalance()
   * const credits = response.data.data
   * 
   * console.log(`Total balance: ${credits.balance} credits`)
   * console.log(`Reserved: ${credits.reserved} credits`)
   * console.log(`Available: ${credits.available} credits`)
   * 
   * if (credits.available < 100) {
   *   console.warn('Low credit balance!')
   * }
   * ```
   */
  getCreditBalance: () =>
    apiClient.get<
      ApiResponse<{
        balance: number
        reserved: number
        available: number
      }>
    >('/products/credits/balance'),

  /**
   * Purchase credits using saved payment method
   * @param {number} amount - Number of credits to purchase
   * @param {string} paymentMethodId - Saved payment method UUID
   * @returns {Promise<ApiResponse<Object>>} Transaction details and new balance
   * @throws {ApiError} 400 - Invalid amount or payment method
   * @throws {ApiError} 402 - Payment failed
   * @throws {ApiError} 404 - Payment method not found
   * @example
   * ```typescript
   * try {
   *   const response = await productsApi.purchaseCredits(1000, paymentMethodId)
   *   const { transactionId, newBalance } = response.data.data
   *   
   *   console.log(`Purchase successful! Transaction: ${transactionId}`)
   *   console.log(`New balance: ${newBalance} credits`)
   * } catch (error) {
   *   if (error.response?.status === 402) {
   *     console.error('Payment failed:', error.response.data.message)
   *   }
   * }
   * ```
   */
  purchaseCredits: (amount: number, paymentMethodId: string) =>
    apiClient.post<
      ApiResponse<{
        transactionId: string
        newBalance: number
      }>
    >('/products/credits/purchase', { amount, paymentMethodId }),
}

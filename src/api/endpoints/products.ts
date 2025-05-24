/**
 * Product and pricing API endpoints
 */

import { apiClient } from '../client'
import type { ApiResponse } from '../types'
import type { Product } from '@/types/product'

export const productsApi = {
  /**
   * Get all available products
   */
  getAll: () => apiClient.get<ApiResponse<Product[]>>('/products'),

  /**
   * Get product by ID
   */
  getById: (id: string) =>
    apiClient.get<ApiResponse<Product>>(`/products/${id}`),

  /**
   * Get product pricing details
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
   * Calculate cost for a product configuration
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
   * Get user's credit balance
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
   * Purchase credits
   */
  purchaseCredits: (amount: number, paymentMethodId: string) =>
    apiClient.post<
      ApiResponse<{
        transactionId: string
        newBalance: number
      }>
    >('/products/credits/purchase', { amount, paymentMethodId }),
}

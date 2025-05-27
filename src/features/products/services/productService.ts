/**
 * Product service for managing marketplace products and pricing
 * 
 * Handles fetching product catalogs, checking availability, and managing
 * product access permissions. All products represent credit packages or
 * subscription-based maritime intelligence services.
 * 
 * @module features/products/services/productService
 */

import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/api/types'
import { Product } from '@/types/product'

/**
 * Product availability information for access control
 */
export interface ProductAvailability {
  /** Unique identifier of the product */
  productId: string
  /** Whether the product is currently available for purchase */
  isAvailable: boolean
  /** Whether the current user has access to this product */
  userHasAccess: boolean
  /** Whether the product requires admin approval before purchase */
  requiresApproval: boolean
}

/**
 * Product API service for marketplace operations
 */
export const productApi = {
  /**
   * Fetches all available products with optional filtering and sorting
   * @param {Object} [params] - Query parameters for filtering and sorting
   * @param {string} [params.category] - Filter by product category
   * @param {string} [params.search] - Search products by name or description
   * @param {'price-asc' | 'price-desc' | 'name'} [params.sort] - Sort order for results
   * @returns {Promise<Product[]>} Array of products matching the criteria
   * @throws {Error} If the API request fails
   * @example
   * ```typescript
   * // Get all products
   * const products = await productApi.getProducts()
   * 
   * // Get credit packages sorted by price
   * const credits = await productApi.getProducts({
   *   category: 'credits',
   *   sort: 'price-asc'
   * })
   * ```
   */
  async getProducts(params?: {
    category?: string
    search?: string
    sort?: 'price-asc' | 'price-desc' | 'name'
  }): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products', {
      params,
    })
    return response.data.data
  },

  /**
   * Fetches a single product by its ID
   * @param {string} id - Unique product identifier
   * @returns {Promise<Product>} The product details
   * @throws {Error} If the product is not found or API request fails
   * @example
   * ```typescript
   * const product = await productApi.getProductById('prod_123')
   * console.log(product.name, product.price)
   * ```
   */
  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(
      `/products/${id}`,
    )
    return response.data.data
  },

  /**
   * Fetches all products in a specific category
   * @param {string} category - Product category to filter by
   * @returns {Promise<Product[]>} Array of products in the category
   * @throws {Error} If the category is invalid or API request fails
   * @example
   * ```typescript
   * // Get all credit packages
   * const creditPackages = await productApi.getProductsByCategory('credits')
   * 
   * // Get all subscription products
   * const subscriptions = await productApi.getProductsByCategory('subscriptions')
   * ```
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `/products/category/${category}`,
    )
    return response.data.data
  },

  /**
   * Fetches featured products for homepage display
   * @returns {Promise<Product[]>} Array of featured products
   * @throws {Error} If the API request fails
   * @example
   * ```typescript
   * const featured = await productApi.getFeaturedProducts()
   * // Display in hero section or promotions
   * ```
   */
  async getFeaturedProducts(): Promise<Product[]> {
    const response =
      await apiClient.get<ApiResponse<Product[]>>(`/products/featured`)
    return response.data.data
  },

  /**
   * Checks if a product is available for purchase by the current user
   * @param {string} productId - Product ID to check availability for
   * @param {string} [token] - Optional auth token for user-specific availability
   * @returns {Promise<ProductAvailability>} Availability status and access information
   * @throws {Error} If the product ID is invalid or API request fails
   * @example
   * ```typescript
   * const availability = await productApi.checkProductAvailability('prod_123', authToken)
   * if (availability.isAvailable && !availability.requiresApproval) {
   *   // Show purchase button
   * }
   * ```
   */
  async checkProductAvailability(
    productId: string,
    token?: string,
  ): Promise<ProductAvailability> {
    const response = await apiClient.post<ApiResponse<ProductAvailability>>(
      `/products/${productId}/check-availability`,
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    )
    return response.data.data
  },
}

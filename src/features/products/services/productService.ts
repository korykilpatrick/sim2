import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types/api'
import { Product } from '@/types/product'

export interface ProductAvailability {
  productId: string
  isAvailable: boolean
  userHasAccess: boolean
  requiresApproval: boolean
}

export const productApi = {
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

  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(
      `/products/${id}`,
    )
    return response.data.data
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `/products/category/${category}`,
    )
    return response.data.data
  },

  async getFeaturedProducts(): Promise<Product[]> {
    const response =
      await apiClient.get<ApiResponse<Product[]>>(`/products/featured`)
    return response.data.data
  },

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

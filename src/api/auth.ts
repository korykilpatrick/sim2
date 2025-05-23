import { apiClient } from './client'
import { AuthResponse, LoginCredentials, RegisterData } from '@/types/auth'
import { ApiResponse } from '@/types/api'

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials,
    )
    return response.data
  },

  register: async (data: RegisterData) => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data,
    )
    return response.data
  },

  logout: async () => {
    const response = await apiClient.post<ApiResponse>('/auth/logout')
    return response.data
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh',
      { refreshToken },
    )
    return response.data
  },

  getCurrentUser: async () => {
    const response = await apiClient.get<ApiResponse<AuthResponse['user']>>(
      '/auth/me',
    )
    return response.data
  },
}
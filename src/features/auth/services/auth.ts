import { apiClient } from '@/api/client'
import { AuthResponse, LoginCredentials, RegisterData } from '../types/auth'
import { ApiResponse } from '@/api/types'

/**
 * Authentication API service providing auth-related HTTP operations.
 */
export const authApi = {
  /**
   * Authenticates user with email and password.
   *
   * @param credentials - User login credentials
   * @returns Authentication response with user data and tokens
   */
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials,
    )
    return response.data.data
  },

  /**
   * Creates a new user account.
   *
   * @param data - Registration data including credentials and profile info
   * @returns Authentication response with user data and tokens
   */
  register: async (data: RegisterData) => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data,
    )
    return response.data.data
  },

  /**
   * Logs out the current user and invalidates tokens.
   *
   * @returns Success response
   */
  logout: async () => {
    const response = await apiClient.post<ApiResponse>('/auth/logout')
    return response.data
  },

  /**
   * Refreshes the access token using a refresh token.
   *
   * @param refreshToken - Valid refresh token
   * @returns New access and refresh tokens
   */
  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post<
      ApiResponse<{ accessToken: string; refreshToken: string }>
    >('/auth/refresh', { refreshToken })
    return response.data.data
  },

  /**
   * Fetches the current authenticated user's data.
   *
   * @returns Current user data
   */
  getCurrentUser: async () => {
    const response =
      await apiClient.get<ApiResponse<AuthResponse['user']>>('/auth/me')
    return response.data.data
  },
}

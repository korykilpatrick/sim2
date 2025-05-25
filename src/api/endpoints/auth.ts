/**
 * Authentication API endpoints
 */

import { apiClient } from '../client'
import type { ApiResponse } from '../types'
import type { User, AuthResponse } from '@/features/auth/types'

export const authApi = {
  /**
   * Login with email and password
   */
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials),

  /**
   * Register a new user
   */
  register: (data: { email: string; password: string; name: string }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data),

  /**
   * Refresh access token
   */
  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken }),

  /**
   * Get current user profile
   */
  getProfile: () => apiClient.get<ApiResponse<User>>('/auth/profile'),

  /**
   * Update user profile
   */
  updateProfile: (data: Partial<User>) =>
    apiClient.put<ApiResponse<User>>('/auth/profile', data),

  /**
   * Change password
   */
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/change-password',
      data,
    ),

  /**
   * Logout user
   */
  logout: () => apiClient.post('/auth/logout'),

  /**
   * Request password reset
   */
  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', {
      email,
    }),

  /**
   * Reset password with token
   */
  resetPassword: (token: string, newPassword: string) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
      token,
      newPassword,
    }),
}

/**
 * Authentication API endpoints
 * Handles user authentication, registration, profile management, and password operations
 * @module api/endpoints/auth
 */

import { apiClient } from '../client'
import type { ApiResponse } from '../types'
import type { User, AuthResponse } from '@/features/auth/types'

/**
 * Authentication API client providing user authentication and management endpoints
 */
export const authApi = {
  /**
   * Authenticate user with email and password
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.email - User's email address
   * @param {string} credentials.password - User's password
   * @returns {Promise<ApiResponse<AuthResponse>>} Authentication response with user data and tokens
   * @throws {ApiError} 400 - Invalid credentials format
   * @throws {ApiError} 401 - Invalid email or password
   * @throws {ApiError} 429 - Too many login attempts
   * @example
   * ```typescript
   * try {
   *   const response = await authApi.login({
   *     email: 'user@example.com',
   *     password: 'securePassword123'
   *   })
   *   const { user, accessToken, refreshToken } = response.data.data
   *   console.log('Logged in as:', user.name)
   * } catch (error) {
   *   console.error('Login failed:', error.message)
   * }
   * ```
   */
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials),

  /**
   * Register a new user account
   * @param {Object} data - Registration data
   * @param {string} data.email - User's email address
   * @param {string} data.password - User's password (min 8 characters)
   * @param {string} data.name - User's display name
   * @returns {Promise<ApiResponse<AuthResponse>>} Authentication response with new user data and tokens
   * @throws {ApiError} 400 - Invalid data format or password too weak
   * @throws {ApiError} 409 - Email already registered
   * @example
   * ```typescript
   * const response = await authApi.register({
   *   email: 'newuser@example.com',
   *   password: 'securePassword123',
   *   name: 'John Doe'
   * })
   * const { user, accessToken } = response.data.data
   * // User is automatically logged in after registration
   * ```
   */
  register: (data: { email: string; password: string; name: string }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data),

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Valid refresh token
   * @returns {Promise<ApiResponse<{accessToken: string; refreshToken: string}>>} New token pair
   * @throws {ApiError} 401 - Invalid or expired refresh token
   * @throws {ApiError} 403 - Refresh token revoked
   * @example
   * ```typescript
   * // Usually called automatically by axios interceptor
   * const response = await authApi.refreshToken(storedRefreshToken)
   * const { accessToken, refreshToken } = response.data.data
   * // Update stored tokens
   * ```
   */
  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh',
      { refreshToken },
    ),

  /**
   * Get current authenticated user's profile
   * @returns {Promise<ApiResponse<User>>} Current user profile data
   * @throws {ApiError} 401 - Not authenticated
   * @throws {ApiError} 404 - User not found (deleted account)
   * @example
   * ```typescript
   * const response = await authApi.getProfile()
   * const user = response.data.data
   * console.log('Current user:', user.name, user.email)
   * console.log('Subscription:', user.subscription?.plan || 'Free')
   * ```
   */
  getProfile: () => apiClient.get<ApiResponse<User>>('/auth/profile'),

  /**
   * Update current user's profile information
   * @param {Partial<User>} data - Profile fields to update
   * @returns {Promise<ApiResponse<User>>} Updated user profile
   * @throws {ApiError} 400 - Invalid data format
   * @throws {ApiError} 401 - Not authenticated
   * @throws {ApiError} 409 - Email already taken (if updating email)
   * @example
   * ```typescript
   * const response = await authApi.updateProfile({
   *   name: 'Jane Doe',
   *   preferences: {
   *     notifications: true,
   *     theme: 'dark'
   *   }
   * })
   * console.log('Profile updated:', response.data.data)
   * ```
   */
  updateProfile: (data: Partial<User>) =>
    apiClient.put<ApiResponse<User>>('/auth/profile', data),

  /**
   * Change current user's password
   * @param {Object} data - Password change data
   * @param {string} data.currentPassword - Current password for verification
   * @param {string} data.newPassword - New password (min 8 characters)
   * @returns {Promise<ApiResponse<{message: string}>>} Success message
   * @throws {ApiError} 400 - New password too weak
   * @throws {ApiError} 401 - Current password incorrect
   * @example
   * ```typescript
   * try {
   *   await authApi.changePassword({
   *     currentPassword: 'oldPassword123',
   *     newPassword: 'newSecurePassword456'
   *   })
   *   console.log('Password changed successfully')
   * } catch (error) {
   *   console.error('Password change failed:', error.message)
   * }
   * ```
   */
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/change-password',
      data,
    ),

  /**
   * Logout current user and invalidate tokens
   * @returns {Promise<void>} No response data
   * @example
   * ```typescript
   * await authApi.logout()
   * // Clear local storage and redirect to login
   * localStorage.removeItem('accessToken')
   * localStorage.removeItem('refreshToken')
   * window.location.href = '/login'
   * ```
   */
  logout: () => apiClient.post('/auth/logout'),

  /**
   * Request password reset email
   * @param {string} email - Email address of the account
   * @returns {Promise<ApiResponse<{message: string}>>} Success message
   * @throws {ApiError} 429 - Too many reset requests
   * @example
   * ```typescript
   * await authApi.forgotPassword('user@example.com')
   * // Email sent even if account doesn't exist (security)
   * console.log('If account exists, reset email has been sent')
   * ```
   */
  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', {
      email,
    }),

  /**
   * Reset password using token from email
   * @param {string} token - Password reset token from email
   * @param {string} newPassword - New password (min 8 characters)
   * @returns {Promise<ApiResponse<{message: string}>>} Success message
   * @throws {ApiError} 400 - Invalid or expired token
   * @throws {ApiError} 400 - New password too weak
   * @example
   * ```typescript
   * // Token usually extracted from URL params
   * const token = new URLSearchParams(window.location.search).get('token')
   * await authApi.resetPassword(token, 'newSecurePassword789')
   * console.log('Password reset successful, please login')
   * ```
   */
  resetPassword: (token: string, newPassword: string) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
      token,
      newPassword,
    }),
}

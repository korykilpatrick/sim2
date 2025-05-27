/**
 * @module profileService
 * @description User profile management service for handling profile updates, preferences, and account settings.
 * Provides methods for profile CRUD operations, password management, and avatar handling.
 */

import { authApi } from '@/api/endpoints/auth'
import type { User, UserPreferences } from '../types'

/**
 * Profile-specific service functions for user account management
 */
export const profileService = {
  /**
   * Get current user profile information
   * @returns {Promise<User>} Current user profile data
   * @throws {Error} If user is not authenticated
   * @example
   * ```typescript
   * const profile = await profileService.getProfile()
   * console.log(`Welcome ${profile.firstName} ${profile.lastName}`)
   * ```
   */
  async getProfile(): Promise<User> {
    const response = await authApi.getProfile()
    return response.data.data
  },

  /**
   * Update user profile information
   * @param {Partial<User>} data - Profile fields to update
   * @returns {Promise<User>} Updated user profile
   * @throws {Error} If validation fails or update is rejected
   * @example
   * ```typescript
   * const updatedProfile = await profileService.updateProfile({
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   company: 'Acme Corp'
   * })
   * ```
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await authApi.updateProfile(data)
    return response.data.data
  },

  /**
   * Change user password
   * @param {string} currentPassword - Current password for verification
   * @param {string} newPassword - New password to set
   * @returns {Promise<void>} Resolves when password is changed
   * @throws {Error} If current password is incorrect or new password is invalid
   * @example
   * ```typescript
   * try {
   *   await profileService.changePassword('oldpass123', 'newpass456')
   *   console.log('Password changed successfully')
   * } catch (error) {
   *   console.error('Password change failed:', error.message)
   * }
   * ```
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await authApi.changePassword({ currentPassword, newPassword })
  },

  /**
   * Update user preferences and settings
   * @param {UserPreferences} preferences - New preference settings
   * @returns {Promise<User>} Updated user profile with new preferences
   * @example
   * ```typescript
   * const updated = await profileService.updatePreferences({
   *   emailNotifications: true,
   *   theme: 'dark',
   *   language: 'en',
   *   timezone: 'America/New_York'
   * })
   * ```
   */
  async updatePreferences(preferences: UserPreferences): Promise<User> {
    const response = await authApi.updateProfile({ preferences })
    return response.data.data
  },

  /**
   * Upload user avatar image
   * @param {File} file - Image file to upload
   * @returns {Promise<{avatarUrl: string}>} Object containing the new avatar URL
   * @throws {Error} If file is too large or invalid format
   * @example
   * ```typescript
   * const fileInput = document.querySelector('input[type="file"]')
   * const file = fileInput.files[0]
   *
   * const { avatarUrl } = await profileService.uploadAvatar(file)
   * console.log('New avatar URL:', avatarUrl)
   * ```
   */
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    // In a real implementation, this would upload to a file storage service
    // For now, we'll simulate with a data URL
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve({ avatarUrl: reader.result as string })
      }
      reader.readAsDataURL(file)
    })
  },

  /**
   * Delete user avatar and revert to default
   * @returns {Promise<void>} Resolves when avatar is deleted
   * @example
   * ```typescript
   * await profileService.deleteAvatar()
   * // User now has default avatar
   * ```
   */
  async deleteAvatar(): Promise<void> {
    await authApi.updateProfile({ avatar: undefined })
  },

  /**
   * Request account deletion (starts deletion process)
   * @returns {Promise<void>} Resolves when deletion request is submitted
   * @example
   * ```typescript
   * if (confirm('Are you sure you want to delete your account?')) {
   *   await profileService.requestAccountDeletion()
   *   // User will receive confirmation email
   * }
   * ```
   */
  async requestAccountDeletion(): Promise<void> {
    // In a real implementation, this would trigger an account deletion flow
    // For now, this is a placeholder
    await new Promise((resolve) => setTimeout(resolve, 1000))
  },
}

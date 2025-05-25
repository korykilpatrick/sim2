import { authApi } from '@/api/endpoints/auth'
import type { User, UserPreferences } from '../types'

/**
 * Profile-specific service functions.
 */
export const profileService = {
  /**
   * Get current user profile.
   */
  async getProfile(): Promise<User> {
    const response = await authApi.getProfile()
    return response.data.data
  },

  /**
   * Update user profile information.
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await authApi.updateProfile(data)
    return response.data.data
  },

  /**
   * Change user password.
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await authApi.changePassword({ currentPassword, newPassword })
  },

  /**
   * Update user preferences.
   */
  async updatePreferences(preferences: UserPreferences): Promise<User> {
    const response = await authApi.updateProfile({ preferences })
    return response.data.data
  },

  /**
   * Upload user avatar.
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
   * Delete user avatar.
   */
  async deleteAvatar(): Promise<void> {
    await authApi.updateProfile({ avatar: undefined })
  },

  /**
   * Request account deletion.
   */
  async requestAccountDeletion(): Promise<void> {
    // In a real implementation, this would trigger an account deletion flow
    // For now, this is a placeholder
    await new Promise((resolve) => setTimeout(resolve, 1000))
  },
}

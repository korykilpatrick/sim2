import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageLayout } from '@/components/layout'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Avatar,
} from '@/components/common'
import { Input } from '@/components/forms'
import { LoadingSpinner } from '@/components/feedback'
import { useToast } from '@/hooks/useToast'
import { useAuthStore, profileService } from '@/features/auth/services'
import { validation } from '@/services/validation'
import type { User } from '@/features/auth/types'

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const { user, updateUser } = useAuthStore()
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<User>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch latest profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
  })

  // Update user when profile data changes
  if (profile && profile !== user) {
    updateUser(profile)
  }

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (data) => {
      updateUser(data)
      setIsEditing(false)
      setFormData({})
      setErrors({})
      showToast({ type: 'success', message: 'Profile updated successfully' })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: () => {
      showToast({ type: 'error', message: 'Failed to update profile' })
    },
  })

  // Avatar upload mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: profileService.uploadAvatar,
    onSuccess: async (data) => {
      await updateProfileMutation.mutateAsync({ avatar: data.avatarUrl })
    },
    onError: () => {
      showToast({ type: 'error', message: 'Failed to upload avatar' })
    },
  })

  const currentUser = profile || user

  const handleEdit = () => {
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        email: currentUser.email,
        company: currentUser.company,
        department: currentUser.department,
        phone: currentUser.phone,
      })
      setIsEditing(true)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({})
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (formData.email && !validation.email(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (formData.phone && !validation.phone(formData.phone)) {
      newErrors.phone = 'Invalid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      updateProfileMutation.mutate(formData)
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadAvatarMutation.mutate(file)
    }
  }

  if (isLoading || !currentUser) {
    return (
      <PageLayout title="Profile">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Profile"
      subtitle="Manage your account information and preferences"
    >
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6">
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="xl"
            />
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Profile Photo
              </h3>
              <p className="text-sm text-gray-500">Update your profile photo</p>
              <label className="mt-2 inline-block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="sr-only"
                  disabled={uploadAvatarMutation.isPending}
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={uploadAvatarMutation.isPending}
                  className="cursor-pointer"
                >
                  {uploadAvatarMutation.isPending
                    ? 'Uploading...'
                    : 'Change Photo'}
                </Button>
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              value={isEditing ? formData.name || '' : currentUser.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={!isEditing}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={isEditing ? formData.email || '' : currentUser.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={!isEditing}
              error={errors.email}
              required
            />
            <Input
              label="Company"
              value={
                isEditing ? formData.company || '' : currentUser.company || ''
              }
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              disabled={!isEditing}
            />
            <Input
              label="Department"
              value={
                isEditing
                  ? formData.department || ''
                  : currentUser.department || ''
              }
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              disabled={!isEditing}
            />
            <Input
              label="Phone Number"
              type="tel"
              value={isEditing ? formData.phone || '' : currentUser.phone || ''}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              disabled={!isEditing}
              error={errors.phone}
              placeholder="+1-555-0000"
            />
            <Input
              label="Role"
              value={currentUser.role}
              disabled
              hint="Contact support to change your role"
            />
          </div>

          {/* Account Info */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Account Information
            </h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Member Since</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {new Date(currentUser.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Last Login</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {currentUser.lastLogin
                    ? new Date(currentUser.lastLogin).toLocaleString()
                    : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Account Status</dt>
                <dd className="text-sm font-medium text-gray-900">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      currentUser.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {currentUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateProfileMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>Edit Profile</Button>
          )}
        </CardFooter>
      </Card>

      {/* Subscription Information */}
      {currentUser.subscription && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <dt className="text-sm text-gray-500">Current Plan</dt>
                <dd className="text-lg font-semibold text-gray-900 capitalize">
                  {currentUser.subscription.plan}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Credits Available</dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {currentUser.subscription.credits -
                    currentUser.subscription.creditsUsed}
                  <span className="text-sm font-normal text-gray-500">
                    {' '}
                    / {currentUser.subscription.credits}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Renewal Date</dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {new Date(
                    currentUser.subscription.renewalDate,
                  ).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Manage Subscription</Button>
          </CardFooter>
        </Card>
      )}
    </PageLayout>
  )
}

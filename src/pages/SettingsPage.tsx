import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { PageLayout } from '@/components/layout'
import {
  Card,
  CardContent,
  CardFooter,
  Button,
  Tabs,
  TabPanel,
} from '@/components/common'
import { Input, Select, Switch } from '@/components/forms'
import { Alert } from '@/components/feedback'
import { useToast } from '@/hooks/useToast'
import { useAuthStore, profileService } from '@/features/auth/services'
import { validation } from '@/services/validation'
import type { UserPreferences } from '@/features/auth/types'
import {
  Bell as BellIcon,
  ShieldCheck as ShieldCheckIcon,
  Paintbrush as PaintBrushIcon,
  CreditCard as CreditCardIcon,
  Key as KeyIcon,
  UserCircle as UserCircleIcon,
} from 'lucide-react'

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('notifications')

  // Form states
  const [preferences, setPreferences] = useState<UserPreferences>(
    user?.preferences || {
      theme: 'light',
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      defaultView: 'dashboard',
    },
  )

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  )

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: profileService.updatePreferences,
    onSuccess: (data) => {
      updateUser(data)
      showToast({
        type: 'success',
        message: 'Preferences updated successfully',
      })
    },
    onError: () => {
      showToast({ type: 'error', message: 'Failed to update preferences' })
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string
      newPassword: string
    }) => profileService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      showToast({ type: 'success', message: 'Password changed successfully' })
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setPasswordErrors({})
    },
    onError: () => {
      showToast({
        type: 'error',
        message:
          'Failed to change password. Please check your current password.',
      })
    },
  })

  const tabs = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <BellIcon className="w-4 h-4" />,
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: <PaintBrushIcon className="w-4 h-4" />,
    },
    {
      id: 'security',
      label: 'Security',
      icon: <ShieldCheckIcon className="w-4 h-4" />,
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: <CreditCardIcon className="w-4 h-4" />,
    },
    { id: 'api', label: 'API Keys', icon: <KeyIcon className="w-4 h-4" /> },
    {
      id: 'account',
      label: 'Account',
      icon: <UserCircleIcon className="w-4 h-4" />,
    },
  ]

  const handlePreferencesChange = (
    newPreferences: Partial<UserPreferences>,
  ) => {
    const updated = { ...preferences, ...newPreferences }
    setPreferences(updated)
  }

  const handleNotificationChange = (
    key: keyof UserPreferences['notifications'],
    value: boolean,
  ) => {
    const updated = {
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: value,
      },
    }
    setPreferences(updated)
  }

  const savePreferences = () => {
    updatePreferencesMutation.mutate(preferences)
  }

  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required'
    } else if (!validation.password.isStrong(passwordForm.newPassword)) {
      errors.newPassword =
        'Password must be at least 8 characters with uppercase, lowercase, and numbers'
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password'
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePasswordChange = () => {
    if (validatePasswordForm()) {
      changePasswordMutation.mutate({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
    }
  }

  return (
    <PageLayout
      title="Settings"
      subtitle="Manage your account settings and preferences"
    >
      <Card>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="px-6"
        />

        {/* Notifications Tab */}
        <TabPanel isActive={activeTab === 'notifications'}>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Notification Preferences
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Choose how you want to be notified about vessel tracking events
                and alerts.
              </p>

              <div className="space-y-4">
                <Switch
                  label="Email Notifications"
                  description="Receive alerts and updates via email"
                  checked={preferences.notifications.email}
                  onCheckedChange={(checked) =>
                    handleNotificationChange('email', checked)
                  }
                />
                <Switch
                  label="SMS Notifications"
                  description="Get text messages for critical alerts"
                  checked={preferences.notifications.sms}
                  onCheckedChange={(checked) =>
                    handleNotificationChange('sms', checked)
                  }
                />
                <Switch
                  label="Push Notifications"
                  description="Browser notifications for real-time updates"
                  checked={preferences.notifications.push}
                  onCheckedChange={(checked) =>
                    handleNotificationChange('push', checked)
                  }
                />
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-medium text-gray-900 mb-4">
                  Notification Types
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-[#0066FF] focus:ring-[#0066FF] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Vessel position updates
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-[#0066FF] focus:ring-[#0066FF] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Area monitoring alerts
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-[#0066FF] focus:ring-[#0066FF] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Dark activity detection
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-[#0066FF] focus:ring-[#0066FF] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Report completion
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={savePreferences}
              disabled={updatePreferencesMutation.isPending}
            >
              {updatePreferencesMutation.isPending
                ? 'Saving...'
                : 'Save Changes'}
            </Button>
          </CardFooter>
        </TabPanel>

        {/* Preferences Tab */}
        <TabPanel isActive={activeTab === 'preferences'}>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Display Preferences
              </h3>

              <div className="space-y-6">
                <Select
                  label="Theme"
                  value={preferences.theme}
                  onChange={(e) =>
                    handlePreferencesChange({
                      theme: e.target.value as 'light' | 'dark',
                    })
                  }
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                  ]}
                />

                <Select
                  label="Default Dashboard View"
                  value={preferences.defaultView}
                  onChange={(e) =>
                    handlePreferencesChange({
                      defaultView: e.target
                        .value as UserPreferences['defaultView'],
                    })
                  }
                  options={[
                    { value: 'dashboard', label: 'Dashboard' },
                    { value: 'vessels', label: 'Vessel Tracking' },
                    { value: 'areas', label: 'Area Monitoring' },
                    { value: 'reports', label: 'Reports' },
                  ]}
                  hint="This will be your landing page after login"
                />

                <Select
                  label="Time Zone"
                  value="UTC"
                  onChange={() => {}}
                  options={[
                    { value: 'UTC', label: 'UTC' },
                    { value: 'EST', label: 'Eastern Time' },
                    { value: 'CST', label: 'Central Time' },
                    { value: 'PST', label: 'Pacific Time' },
                  ]}
                />

                <Select
                  label="Date Format"
                  value="MM/DD/YYYY"
                  onChange={() => {}}
                  options={[
                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                  ]}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={savePreferences}
              disabled={updatePreferencesMutation.isPending}
            >
              {updatePreferencesMutation.isPending
                ? 'Saving...'
                : 'Save Changes'}
            </Button>
          </CardFooter>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel isActive={activeTab === 'security'}>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Change Password
              </h3>

              <div className="max-w-md space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  error={passwordErrors.currentPassword}
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  error={passwordErrors.newPassword}
                  hint="At least 8 characters with uppercase, lowercase, and numbers"
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  error={passwordErrors.confirmPassword}
                  required
                />
              </div>

              <div className="mt-6">
                <Button
                  onClick={handlePasswordChange}
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending
                    ? 'Changing...'
                    : 'Change Password'}
                </Button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Two-Factor Authentication
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Add an extra layer of security to your account with 2FA.
              </p>
              <Button variant="outline">Enable 2FA</Button>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Active Sessions
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Manage devices that are currently logged into your account.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Current Session
                    </p>
                    <p className="text-sm text-gray-500">Chrome on MacOS</p>
                  </div>
                  <span className="text-xs text-green-600 font-medium">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </TabPanel>

        {/* Billing Tab */}
        <TabPanel isActive={activeTab === 'billing'}>
          <CardContent className="space-y-6">
            <Alert
              variant="info"
              message="Manage your subscription and payment methods"
            />

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Payment Methods
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCardIcon className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        •••• 4242
                      </p>
                      <p className="text-sm text-gray-500">Expires 12/24</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Update
                  </Button>
                </div>
              </div>
              <Button variant="outline" className="mt-4">
                Add Payment Method
              </Button>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Billing History
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Professional Plan
                    </p>
                    <p className="text-sm text-gray-500">January 1, 2025</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">$99.00</p>
                    <Button size="sm" variant="ghost">
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </TabPanel>

        {/* API Keys Tab */}
        <TabPanel isActive={activeTab === 'api'}>
          <CardContent className="space-y-6">
            <Alert
              variant="warning"
              message="API keys provide full access to your account. Keep them secure and never share them publicly."
            />

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                API Keys
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Use API keys to integrate SIM with your applications.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Production Key
                    </p>
                    <p className="text-sm text-gray-500 font-mono">
                      sk_live_...4242
                    </p>
                    <p className="text-xs text-gray-400">
                      Created on Jan 15, 2025
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="mt-4">
                Create New API Key
              </Button>
            </div>
          </CardContent>
        </TabPanel>

        {/* Account Tab */}
        <TabPanel isActive={activeTab === 'account'}>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Export Account Data
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Download a copy of all your data from SIM.
              </p>
              <Button variant="outline">Request Data Export</Button>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Delete Account
              </h3>
              <Alert
                variant="error"
                message="Deleting your account is permanent and cannot be undone. All your data will be permanently removed."
              />
              <Button variant="danger" className="mt-4">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </TabPanel>
      </Card>
    </PageLayout>
  )
}

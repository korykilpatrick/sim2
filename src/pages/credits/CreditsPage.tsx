import { useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/common/Card'
import Button from '@/components/common/Button'
import { clsx } from '@/utils/clsx'

export default function CreditsPage() {
  const { user } = useAuth()
  const [selectedPackage, setSelectedPackage] = useState<string>('')

  const creditPackages = [
    {
      id: 'starter',
      name: 'Starter Pack',
      credits: 100,
      price: 99,
      savings: 0,
      popular: false,
    },
    {
      id: 'professional',
      name: 'Professional',
      credits: 500,
      price: 449,
      savings: 10,
      popular: true,
    },
    {
      id: 'business',
      name: 'Business',
      credits: 1000,
      price: 849,
      savings: 15,
      popular: false,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      credits: 5000,
      price: 3999,
      savings: 20,
      popular: false,
    },
  ]

  const usageHistory = []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Credits Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Purchase credits to access our maritime intelligence services
        </p>
      </div>

      {/* Current Balance */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Current Balance
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {user?.credits || 0} Credits
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <svg
                className="h-8 w-8 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152z" />
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 111.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 01-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.097-2.096a3.78 3.78 0 011.653-.713V4.75A.75.75 0 0110 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Credits */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Purchase Credits
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={clsx(
                'relative cursor-pointer transition-all',
                selectedPackage === pkg.id
                  ? 'ring-2 ring-primary-500 shadow-lg'
                  : 'hover:shadow-md',
              )}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              <Card>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-center">{pkg.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{pkg.credits}</span>
                    <span className="text-gray-500 ml-1">credits</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">${pkg.price}</span>
                  </div>
                  {pkg.savings > 0 && (
                    <p className="mt-2 text-sm text-green-600 font-medium">
                      Save {pkg.savings}%
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    ${(pkg.price / pkg.credits).toFixed(2)} per credit
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button variant="primary" size="lg" disabled={!selectedPackage}>
            Purchase Credits
          </Button>
        </div>
      </div>

      {/* Usage History */}
      <Card>
        <CardHeader>
          <CardTitle>Usage History</CardTitle>
        </CardHeader>
        <CardContent>
          {usageHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No usage history yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Usage history items would go here */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Info */}
      <Card>
        <CardHeader>
          <CardTitle>Service Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">
                Vessel Tracking (per vessel/day)
              </span>
              <span className="font-medium">5-15 credits</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">
                Area Monitoring (per day)
              </span>
              <span className="font-medium">10-50 credits</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">
                Fleet Tracking (per vessel/month)
              </span>
              <span className="font-medium">100 credits</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Compliance Report</span>
              <span className="font-medium">50 credits</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Chronology Report</span>
              <span className="font-medium">75 credits</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


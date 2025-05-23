import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import Button from '@/components/common/Button'

export default function ReportsPage() {
  const reportTypes = [
    {
      id: 'compliance',
      name: 'Vessel Compliance Report',
      description: 'Detailed assessment of vessel compliance status and regulatory adherence',
      icon: '📋',
      price: 50,
      features: [
        'Sanctions screening (OFAC, EU, UN)',
        'Regulatory compliance (IMO, SOLAS, MARPOL)',
        'AIS integrity & spoofing detection',
        'Ownership & beneficial control analysis',
        'Risk assessment score',
      ],
    },
    {
      id: 'chronology',
      name: 'Vessel Chronology Report',
      description: 'Comprehensive timeline of vessel activities over a selected period',
      icon: '📅',
      price: 75,
      features: [
        'Port calls with timestamps',
        'Ship-to-ship transfers',
        'Dark voyage periods',
        'GPS anomalies detection',
        'Ownership changes history',
      ],
    },
  ]

  const recentReports = []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate detailed compliance and chronology reports for any vessel
        </p>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {reportTypes.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{report.icon}</span>
                  <CardTitle>{report.name}</CardTitle>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {report.price} credits
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{report.description}</p>
              <div className="space-y-2 mb-6">
                {report.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
              <Button fullWidth>Generate Report</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {recentReports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No reports generated yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Report list would go here */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <dt className="text-sm font-medium text-gray-500">Total Reports</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <dt className="text-sm font-medium text-gray-500">This Month</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <dt className="text-sm font-medium text-gray-500">Credits Used</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layouts/PageLayout'
import { Card } from '@/components/common/Card'
import { SearchInput } from '@/components/search/SearchInput'
import { EmptyState } from '@/components/empty-states/EmptyState'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'
import Alert from '@/components/feedback/Alert'
import { Search } from 'lucide-react'
import { useInvestigations } from '../hooks/useInvestigations'
import { InvestigationFilters, InvestigationStatus } from '../types'
import { formatDate } from '@/utils/date'

const statusColors: Record<InvestigationStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function InvestigationsPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<InvestigationFilters>({
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const { data: investigations, isLoading, error } = useInvestigations(filters)

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query }))
  }

  const handleStatusFilter = (status: InvestigationStatus | 'all') => {
    setFilters((prev) => ({ ...prev, status }))
  }

  if (error) {
    return (
      <PageLayout
        title="Maritime Investigations"
        subtitle="Request expert analysis and intelligence"
      >
        <Alert
          variant="error"
          message="Failed to load investigations. Please try again later."
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Maritime Investigations"
      subtitle="Request expert analysis and intelligence"
      action={{
        label: 'Request New Investigation',
        onClick: () => navigate('/investigations/new'),
      }}
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder="Search investigations..."
              value={filters.search || ''}
              onValueChange={handleSearch}
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) =>
              handleStatusFilter(e.target.value as InvestigationStatus | 'all')
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Investigations List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : investigations && investigations.length > 0 ? (
          <div className="grid gap-4">
            {investigations.map((investigation) => (
              <Card
                key={investigation.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/investigations/${investigation.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {investigation.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            statusColors[investigation.status]
                          }`}
                        >
                          {investigation.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {investigation.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>ID: {investigation.id}</span>
                        <span>•</span>
                        <span className="capitalize">
                          {investigation.scope} Investigation
                        </span>
                        <span>•</span>
                        <span>
                          Created: {formatDate(investigation.createdAt)}
                        </span>
                        {investigation.progress > 0 && (
                          <>
                            <span>•</span>
                            <span>{investigation.progress}% Complete</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {investigation.estimatedCredits
                          ? `${investigation.estimatedCredits.toLocaleString()} Credits`
                          : 'Pricing TBD'}
                      </p>
                      {investigation.priority !== 'standard' && (
                        <p className="text-xs text-orange-600 mt-1">
                          {investigation.priority.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No investigations found"
            description="Start your first investigation to get expert maritime intelligence"
            action={{
              label: 'Request Investigation',
              onClick: () => navigate('/investigations/new'),
            }}
          />
        )}
      </div>
    </PageLayout>
  )
}

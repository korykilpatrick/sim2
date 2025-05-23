import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useReports,
  useReportTemplates,
  useReportStatistics,
  useCreateReport,
  useDownloadReport,
  useRetryReport,
  useCancelReport,
} from '../hooks'
import {
  ReportList,
  ReportTemplates,
  ReportStats,
} from '../components'
import { useVesselSearch } from '@/features/vessels/hooks'
import Button from '@/components/common/Button'
import Input from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'
import Modal from '@/components/common/Modal'
import { Plus, Search } from 'lucide-react'
import type { ReportFilters, ReportTemplate } from '../types'

export default function ReportsMainPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ReportFilters>({
    status: 'all',
    reportType: 'all',
  })
  const [isCreating, setIsCreating] = useState(false)
  const [selectedVessel, setSelectedVessel] = useState<any>(null)
  const [vesselSearchQuery, setVesselSearchQuery] = useState('')

  // Hooks
  const { data: reportsData, isLoading: isLoadingReports } = useReports(filters)
  const { data: templatesData, isLoading: isLoadingTemplates } = useReportTemplates()
  const { data: statsData, isLoading: isLoadingStats } = useReportStatistics()
  const createReportMutation = useCreateReport()
  const downloadReportMutation = useDownloadReport('')
  const retryReportMutation = useRetryReport()
  const cancelReportMutation = useCancelReport()

  // Vessel search
  const { searchResults: vesselSearchResults } = useVesselSearch(vesselSearchQuery)

  const reports = reportsData?.data?.data || []
  const templates = templatesData?.data?.data || []
  const stats = statsData?.data?.data || {
    totalReports: 0,
    completedToday: 0,
    pendingReports: 0,
    creditsUsedToday: 0,
    averageProcessingTime: 0,
    popularReportType: 'compliance' as const,
  }

  const handleCreateReport = async (template: ReportTemplate) => {
    if (!selectedVessel) return

    try {
      await createReportMutation.mutateAsync({
        vesselId: selectedVessel.id,
        reportType: template.type,
      })
      setIsCreating(false)
      setSelectedVessel(null)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleViewReport = (report: any) => {
    navigate(`/reports/${report.id}`)
  }

  const handleDownloadReport = (id: string, format: 'pdf' | 'excel' | 'json') => {
    downloadReportMutation.mutate(format)
  }

  if (isLoadingReports || isLoadingStats) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate compliance and chronology reports for vessels
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            variant="primary"
            onClick={() => setIsCreating(true)}
            icon={<Plus className="h-5 w-5" />}
          >
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats */}
      <ReportStats stats={stats} />

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="search"
            placeholder="Search reports..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            icon={<Search className="h-5 w-5 text-gray-400" />}
          />
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </Select>
          <Select
            value={filters.reportType}
            onChange={(e) => setFilters({ ...filters, reportType: e.target.value as any })}
          >
            <option value="all">All Types</option>
            <option value="compliance">Compliance</option>
            <option value="chronology">Chronology</option>
          </Select>
          <Select
            value={filters.sortBy || 'createdAt'}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
          >
            <option value="createdAt">Recent First</option>
            <option value="vesselName">Vessel Name</option>
            <option value="status">Status</option>
          </Select>
        </div>
      </div>

      {/* Reports List */}
      <ReportList
        reports={reports}
        onViewReport={handleViewReport}
        onDownloadReport={handleDownloadReport}
        onRetryReport={(id) => retryReportMutation.mutate(id)}
        onCancelReport={(id) => cancelReportMutation.mutate(id)}
      />

      {/* Create Report Modal */}
      <Modal
        isOpen={isCreating}
        onClose={() => {
          setIsCreating(false)
          setSelectedVessel(null)
          setVesselSearchQuery('')
        }}
        title="Generate New Report"
        size="xl"
      >
        <div className="space-y-6">
          {/* Vessel Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Step 1: Select Vessel
            </h3>
            <Input
              type="search"
              placeholder="Search by vessel name, IMO, or MMSI..."
              value={vesselSearchQuery}
              onChange={(e) => setVesselSearchQuery(e.target.value)}
              icon={<Search className="h-5 w-5 text-gray-400" />}
            />
            
            {vesselSearchResults && vesselSearchResults.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg">
                {vesselSearchResults.map((vessel: any) => (
                  <button
                    key={vessel.id}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                    onClick={() => {
                      setSelectedVessel(vessel)
                      setVesselSearchQuery(vessel.name)
                    }}
                  >
                    <p className="font-medium">{vessel.name}</p>
                    <p className="text-sm text-gray-500">
                      IMO: {vessel.imo} • Flag: {vessel.flag}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {selectedVessel && (
              <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-sm font-medium text-primary-900">
                  Selected Vessel:
                </p>
                <p className="text-sm text-primary-700">
                  {selectedVessel.name} (IMO: {selectedVessel.imo})
                </p>
              </div>
            )}
          </div>

          {/* Report Templates */}
          {selectedVessel && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Step 2: Select Report Type
              </h3>
              {isLoadingTemplates ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <ReportTemplates
                  templates={templates}
                  onSelectTemplate={handleCreateReport}
                  selectedVessel={selectedVessel}
                />
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
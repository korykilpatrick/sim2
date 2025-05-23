import { useAuth } from '@/features/auth/hooks/useAuth'
import { WelcomeSection } from '../components/WelcomeSection'
import { StatsGrid } from '../components/StatsGrid'
import { ServicesGrid } from '../components/ServicesGrid'
import { RecentActivity } from '../components/RecentActivity'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { useDashboardServices } from '../hooks/useDashboardServices'

export default function DashboardPage() {
  const { user } = useAuth()
  const { stats } = useDashboardStats()
  const { services } = useDashboardServices()

  return (
    <div className="space-y-8">
      <WelcomeSection userName={user?.name || 'User'} />
      <StatsGrid stats={stats} />
      <ServicesGrid services={services} />
      <RecentActivity />
    </div>
  )
}

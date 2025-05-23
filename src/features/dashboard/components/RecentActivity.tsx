import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/common/Card'
import Button from '@/components/common/Button'

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-gray-500">No recent activity to display</p>
          <Link to="/vessels" className="mt-4 inline-block">
            <Button variant="primary" size="sm">
              Start Tracking Vessels
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

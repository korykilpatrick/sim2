import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import { DashboardService } from '../types'
import { clsx } from '@/utils/clsx'

interface ServicesGridProps {
  services: DashboardService[]
}

export function ServicesGrid({ services }: ServicesGridProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Available Services
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <Card
            key={service.name}
            className="hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <div
                  className={clsx(
                    service.color,
                    'flex h-12 w-12 items-center justify-center rounded-lg text-white text-2xl',
                  )}
                >
                  {service.icon}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {service.name}
                  </h3>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                {service.description}
              </p>
              <div className="mt-4">
                <Link to={service.href}>
                  <Button variant="outline" size="sm" fullWidth>
                    Get Started
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

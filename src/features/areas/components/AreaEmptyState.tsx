import { EmptyState } from '@/components/empty-states'
import { MapPin } from 'lucide-react'

interface AreaEmptyStateProps {
  onCreateArea?: () => void
}

export function AreaEmptyState({ onCreateArea }: AreaEmptyStateProps) {
  return (
    <EmptyState
      icon={MapPin}
      title="No monitoring areas"
      description="Create your first area to start monitoring vessel activity"
      action={
        onCreateArea
          ? {
              label: 'Create Area',
              onClick: onCreateArea,
            }
          : undefined
      }
    />
  )
}
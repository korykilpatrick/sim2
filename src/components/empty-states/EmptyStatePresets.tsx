import { Search, FileText, Ship, MapPin, Users, BarChart } from 'lucide-react'
import { EmptyState } from './EmptyState'
import type { EmptyStateProps } from './types'

interface PresetProps
  extends Omit<EmptyStateProps, 'icon' | 'title' | 'description'> {
  title?: string
  description?: string
}

export function NoSearchResults(props: PresetProps) {
  return (
    <EmptyState
      icon={Search}
      title={props.title || 'No results found'}
      description={props.description || 'Try adjusting your search or filters'}
      {...props}
    />
  )
}

export function NoReports(props: PresetProps) {
  return (
    <EmptyState
      icon={FileText}
      title={props.title || 'No reports yet'}
      description={
        props.description || 'Generate your first report to get started'
      }
      {...props}
    />
  )
}

export function NoVessels(props: PresetProps) {
  return (
    <EmptyState
      icon={Ship}
      title={props.title || 'No vessels'}
      description={
        props.description || 'Start tracking vessels to see them here'
      }
      {...props}
    />
  )
}

export function NoAreas(props: PresetProps) {
  return (
    <EmptyState
      icon={MapPin}
      title={props.title || 'No monitoring areas'}
      description={
        props.description ||
        'Create an area to start monitoring vessel activity'
      }
      {...props}
    />
  )
}

export function NoFleets(props: PresetProps) {
  return (
    <EmptyState
      icon={Users}
      title={props.title || 'No fleets'}
      description={
        props.description || 'Create a fleet to organize your vessels'
      }
      {...props}
    />
  )
}

export function NoData(props: PresetProps) {
  return (
    <EmptyState
      icon={BarChart}
      title={props.title || 'No data available'}
      description={props.description || 'Data will appear here once available'}
      {...props}
    />
  )
}

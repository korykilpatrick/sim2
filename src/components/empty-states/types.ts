import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  children?: ReactNode
  className?: string
}

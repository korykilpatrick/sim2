import { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface WizardStepProps {
  children: ReactNode
  className?: string
  isActive?: boolean
}

export function WizardStep({
  children,
  className,
  isActive = true,
}: WizardStepProps) {
  if (!isActive) return null

  return <div className={cn('w-full', className)}>{children}</div>
}

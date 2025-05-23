import { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
  actions?: ReactNode
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, actions, className }: CardHeaderProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-between pb-4 border-b border-gray-200',
        className,
      )}
    >
      <div>{children}</div>
      {actions && <div>{actions}</div>}
    </div>
  )
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={clsx('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('pt-4', className)}>{children}</div>
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={clsx(
        'pt-4 mt-4 border-t border-gray-200 flex items-center justify-end space-x-3',
        className,
      )}
    >
      {children}
    </div>
  )
}
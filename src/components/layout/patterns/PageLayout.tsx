import { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import Button from '@/components/common/Button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface PageLayoutProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  backButton?: boolean
  backTo?: string
  children: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
}

export function PageLayout({
  title,
  subtitle,
  action,
  backButton = false,
  backTo,
  children,
  className,
  headerClassName,
  contentClassName,
}: PageLayoutProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1)
    }
  }

  return (
    <div className={cn('h-full', className)}>
      <div className={cn('mb-6', headerClassName)}>
        {backButton && (
          <button
            onClick={handleBack}
            className="mb-4 flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </button>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>

          {action && (
            <Button onClick={action.onClick}>
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          )}
        </div>
      </div>

      <div className={cn('', contentClassName)}>{children}</div>
    </div>
  )
}

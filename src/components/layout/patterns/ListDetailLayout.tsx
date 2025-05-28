import { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface ListDetailLayoutProps {
  list: ReactNode
  detail: ReactNode
  emptyDetail?: ReactNode
  hasSelection?: boolean
  className?: string
  listClassName?: string
  detailClassName?: string
}

export function ListDetailLayout({
  list,
  detail,
  emptyDetail,
  hasSelection = false,
  className,
  listClassName,
  detailClassName,
}: ListDetailLayoutProps) {
  return (
    <div className={cn('flex h-full gap-6', className)}>
      <div className={cn('w-96 flex-shrink-0', listClassName)}>{list}</div>

      <div className={cn('flex-1', detailClassName)}>
        {hasSelection ? detail : emptyDetail || detail}
      </div>
    </div>
  )
}

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  stats?: ReactNode;
  filters?: ReactNode;
  content: ReactNode;
  sidebar?: ReactNode;
  className?: string;
  statsClassName?: string;
  filtersClassName?: string;
  contentClassName?: string;
  sidebarClassName?: string;
}

export function DashboardLayout({
  stats,
  filters,
  content,
  sidebar,
  className,
  statsClassName,
  filtersClassName,
  contentClassName,
  sidebarClassName,
}: DashboardLayoutProps) {
  return (
    <div className={cn('flex h-full flex-col', className)}>
      {stats && (
        <div className={cn('mb-6', statsClassName)}>
          {stats}
        </div>
      )}
      
      {filters && (
        <div className={cn('mb-6', filtersClassName)}>
          {filters}
        </div>
      )}
      
      <div className="flex flex-1 gap-6">
        <div className={cn('flex-1', contentClassName)}>
          {content}
        </div>
        
        {sidebar && (
          <div className={cn('w-80 flex-shrink-0', sidebarClassName)}>
            {sidebar}
          </div>
        )}
      </div>
    </div>
  );
}
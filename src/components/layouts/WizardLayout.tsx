import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface WizardLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function WizardLayout({
  title,
  subtitle,
  children,
  className,
  headerClassName,
  contentClassName,
}: WizardLayoutProps) {
  return (
    <div className={cn('mx-auto max-w-3xl', className)}>
      <div className={cn('mb-8 text-center', headerClassName)}>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
        )}
      </div>
      
      <div className={cn('', contentClassName)}>
        {children}
      </div>
    </div>
  );
}
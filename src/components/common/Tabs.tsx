import * as React from 'react'
import { cn } from '@/utils/cn'

export interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <div className={cn('border-b border-gray-200', className)}>
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm',
              'transition-colors duration-200',
              activeTab === tab.id
                ? 'border-[#0066FF] text-[#0066FF]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              tab.disabled && 'cursor-not-allowed opacity-50',
            )}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export interface TabPanelProps {
  isActive: boolean
  children: React.ReactNode
  className?: string
}

export const TabPanel: React.FC<TabPanelProps> = ({
  isActive,
  children,
  className,
}) => {
  if (!isActive) return null

  return <div className={cn('py-6', className)}>{children}</div>
}

export default Tabs

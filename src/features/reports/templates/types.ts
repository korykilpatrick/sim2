import type { ReactElement } from 'react'

export interface ReportMetadata {
  reportId: string
  title: string
  subtitle?: string
  generatedAt: Date
  generatedBy: string
  organization?: string
  reportType: 'compliance' | 'chronology' | 'investigation' | 'custom'
}

export interface ReportSection {
  title: string
  content: ReactElement | string
  pageBreak?: boolean
}

export interface ReportData {
  metadata: ReportMetadata
  summary?: string
  sections: ReportSection[]
  disclaimer?: string
  appendix?: ReportSection[]
}

export interface ReportTemplateProps {
  data: ReportData
  theme?: 'light' | 'dark'
  watermark?: boolean
}

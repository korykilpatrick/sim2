// Export specific modules to avoid conflicts
export * from './types'
export * from './hooks'
export * from './services'
export * from './pages'

// Export components individually to avoid naming conflicts
export {
  InvestigationRequestForm,
  ExpertConsultation,
  InvestigationStatus,
  InvestigationUpdates,
  DocumentUpload,
  InvestigationReport,
  InvestigationWizard,
} from './components'

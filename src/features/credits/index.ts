/**
 * Credits Feature Exports
 *
 * This is the main entry point for the credits feature.
 * All credit-related functionality should be imported from here.
 */

// Export unified types
export * from './types'

// Export services
export { creditService } from './services/unifiedCreditService'
export {
  useCreditStore,
  creditSelectors,
  initializeCreditSync,
} from './services/creditStore'

// Export unified hook
export { useUnifiedCredits } from './hooks/useUnifiedCredits'
export { useUnifiedCredits as useCredits } from './hooks/useUnifiedCredits' // Alias for compatibility

// Export components (except CreditTransaction type which conflicts)
export { CreditPurchaseModal } from './components'
export { default as CreditTransactionHistory } from './components/CreditTransactionHistory'
export { default as LowBalanceWarning } from './components/LowBalanceWarning'

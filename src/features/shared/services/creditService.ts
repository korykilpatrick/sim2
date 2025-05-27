/**
 * @module creditService
 * @description Re-export of the unified credit service for backwards compatibility.
 *
 * This file provides a consistent import path for code that previously used
 * the shared credit service location. All credit operations are now unified
 * in the credits feature module.
 *
 * @deprecated Import directly from '@/features/credits' for new code
 * @example
 * ```typescript
 * // Old way (still works via this re-export)
 * import { creditService } from '@/features/shared/services/creditService'
 *
 * // Preferred way for new code
 * import { creditService } from '@/features/credits'
 * ```
 */

export { creditService } from '@/features/credits'

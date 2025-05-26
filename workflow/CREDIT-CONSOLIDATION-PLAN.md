# Credit System Consolidation Plan

## Overview
The SIM codebase currently has two parallel credit system implementations that need to be consolidated into a single, unified system. This plan outlines the approach to merge them while maintaining backwards compatibility and improving overall architecture.

## Current State Analysis

### Two Implementations

1. **`/features/credits`** - UI-focused implementation
   - Used by: CreditsPage, DashboardPage
   - Field names: `current`, `expiringCredits` (array)
   - Focus: Credit management UI, purchase flow
   - Response format: Wrapped with `success`, `data`, `timestamp`

2. **`/features/shared`** - Service-focused implementation
   - Used by: All service features (vessels, areas, reports, investigations)
   - Field names: `available`, `expiring` (single object)
   - Focus: Service integrations, cost calculations, reservations
   - Response format: Direct data responses

### Key Differences

| Aspect | `/features/credits` | `/features/shared` |
|--------|--------------------|--------------------|
| Balance field | `current` | `available` |
| Expiring credits | Array of batches | Single object |
| Transaction types | purchase, usage, refund | purchase, deduction, refund, bonus |
| API wrapper | Yes | No |
| Reservation flow | No | Yes |
| UI components | Yes | No |

## Consolidation Strategy

### Target Architecture

We will consolidate on the `/features/shared` implementation as the foundation because:
1. It's more comprehensive (includes reservations, more transaction types)
2. It's already used by most features
3. It has better separation of concerns
4. It supports more complex credit workflows

### Migration Plan

#### Phase 1: Create Unified Types (Day 1 Morning)

1. **Create `/features/credits/types/unified.ts`**
   ```typescript
   // Unified types that support both use cases
   export interface CreditBalance {
     available: number;  // Primary field
     current?: number;   // Deprecated alias for backwards compatibility
     lifetime: number;
     expiringCredits: Array<{
       amount: number;
       expiresAt: string;
     }>;
     // Computed property for single expiring credit (backwards compat)
     expiring?: {
       amount: number;
       date: string;
     };
   }
   ```

2. **Extend transaction types to include all variants**
   ```typescript
   export type TransactionType = 
     | 'purchase' 
     | 'deduction'  // Primary
     | 'usage'      // Deprecated alias
     | 'refund' 
     | 'bonus';
   ```

#### Phase 2: Create Adapter Layer (Day 1 Afternoon)

1. **Create `/features/credits/services/creditAdapter.ts`**
   - Transforms between old and new formats
   - Handles field mapping (`current` ↔ `available`)
   - Manages response wrapper format differences

2. **Update `/features/credits/services/creditService.ts`**
   - Import shared credit service
   - Use adapter for backwards compatibility
   - Deprecate direct API calls

#### Phase 3: Update Components (Day 2 Morning)

1. **Update UI components to use new field names**
   - CreditsPage: Change `current` to `available`
   - Transaction components: Handle new transaction types
   - Keep backwards compatibility via adapter

2. **Move UI components to shared location**
   - `/features/credits/components` → `/features/shared/components/credits`
   - Update imports in pages

#### Phase 4: Consolidate Hooks (Day 2 Afternoon)

1. **Merge `useCredits` functionality into shared hooks**
   - Add UI-specific features to shared hooks
   - Maintain same API surface
   - Use adapter for response transformation

2. **Create unified mock handlers**
   - Single source of mock credit data
   - Support both response formats via flag
   - Gradually migrate tests to new format

#### Phase 5: Update Tests (Day 2 Evening)

1. **Update test expectations**
   - Use new field names in assertions
   - Update mock data structures
   - Ensure backwards compatibility tests pass

2. **Add integration tests**
   - Test that both old and new APIs work
   - Verify adapter transformations
   - Check that all features still function

## Implementation Details

### Backwards Compatibility

1. **Field Aliases**
   - `current` maps to `available`
   - `expiringCredits` computed from array
   - `usage` maps to `deduction`

2. **Response Wrappers**
   - Adapter adds/removes wrapper as needed
   - Maintains timestamp for audit trail

3. **Import Paths**
   - Keep old imports working via re-exports
   - Show deprecation warnings in development

### Migration Timeline

- **Day 1**: Types and adapter (no breaking changes)
- **Day 2**: Components and hooks (with backwards compat)
- **Week 2**: Remove deprecated code (after verification)

### Rollback Strategy

Each phase can be rolled back independently:
1. Git tags at each phase completion
2. Feature flags for gradual rollout
3. Parallel running of both systems if needed

## Success Metrics

1. **No Breaking Changes**: All existing features continue working
2. **Test Coverage**: Maintain or improve current 80.86%
3. **Performance**: No degradation in API response times
4. **Code Reduction**: ~30% less code after removing duplication

## Risks and Mitigations

### Risk 1: Breaking Production Features
- **Mitigation**: Comprehensive backwards compatibility layer
- **Mitigation**: Extensive integration testing
- **Mitigation**: Gradual rollout with feature flags

### Risk 2: Test Failures
- **Mitigation**: Update tests incrementally
- **Mitigation**: Run both old and new tests during transition

### Risk 3: API Contract Mismatch
- **Mitigation**: Adapter handles all transformations
- **Mitigation**: Runtime validation for both formats

## Next Steps

1. Review this plan with team
2. Create feature branch `feature/credit-consolidation`
3. Begin Phase 1 implementation
4. Daily progress updates in CHANGES.md
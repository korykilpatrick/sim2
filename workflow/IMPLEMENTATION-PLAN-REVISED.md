# SIM Implementation Plan - Revised & Clarified
*Updated: January 26, 2025*

## Current Status
- **Test Coverage**: 79.14% (277/350 tests passing)
- **Blocker**: 73 integration tests failing due to missing UI component features
- **TypeScript**: 0 errors ✅
- **ESLint**: 0 errors, 134 warnings

## Immediate Priority: Fix Integration Tests (Week 1)

### Why This Matters
- We have tests written (TDD ✅) but components don't match test expectations
- Fixing these will push us well above 80% coverage
- These are core features users need (credit display, purchase, tracking)

### 1. Fix Credit System UI Components (Days 1-2)
**Goal**: Make all credit integration tests pass

#### CreditsPage Component
- [ ] Change to named export (not default)
- [ ] Add data-testid="credit-balance"
- [ ] Display current, lifetime, and expiring credits
- [ ] Add loading states with data-testid="loading-spinner"
- [ ] Add error handling with user-friendly messages
- [ ] Handle WebSocket credit updates via ws:credit-update events
- [ ] Show "Please log in" when unauthenticated

#### Credit Purchase Flow
- [ ] Add package selection with data-testid="package-{amount}"
- [ ] Add purchase confirmation UI
- [ ] Display transaction history with proper test IDs
- [ ] Show loading skeletons during data fetch

#### Low Balance Warnings
- [ ] Implement LowBalanceWarning component
- [ ] Show warning when credits < 100
- [ ] Show critical warning when credits < 20

**Success Metric**: 20+ credit integration tests passing

### 2. Fix Vessel Tracking UI Components (Days 3-4)
**Goal**: Make vessel tracking integration tests pass

#### VesselTrackingPage Component
- [ ] Add proper test IDs for tracking cards
- [ ] Implement vessel search with debouncing
- [ ] Add loading and error states
- [ ] Handle credit deduction UI feedback
- [ ] Show tracking cost estimates

#### Tracking Wizard Components
- [ ] Ensure all wizard steps have correct test IDs
- [ ] Add form validation
- [ ] Show cost summary before confirmation
- [ ] Handle errors gracefully

**Success Metric**: 15+ vessel tracking tests passing

### 3. Fix Area Monitoring UI Components (Days 5-6)
**Goal**: Make area monitoring integration tests pass

#### AreaMonitoringPage Component
- [ ] Add test IDs for area cards
- [ ] Implement area creation flow
- [ ] Add real-time vessel count updates
- [ ] Show monitoring costs
- [ ] Handle WebSocket area alerts

#### Area Configuration
- [ ] Add monitoring criteria selection
- [ ] Show cost estimates
- [ ] Validate area boundaries
- [ ] Handle save/update operations

**Success Metric**: 15+ area monitoring tests passing

### 4. Fix Report Generation UI (Day 7)
**Goal**: Make report integration tests pass

#### Report Components
- [ ] Add report type selection
- [ ] Show generation progress
- [ ] Handle download functionality
- [ ] Display report history
- [ ] Add proper error handling

**Success Metric**: 10+ report tests passing

## Phase 2: Architecture Improvements (Week 2)

### Only After Integration Tests Pass!

#### 1. Consolidate Credit System (Days 1-2)
- [ ] Merge /features/credits and /features/shared credit implementations
- [ ] Create single source of truth for credit types
- [ ] Update all imports to use consolidated system
- [ ] Ensure backwards compatibility

#### 2. Fix WebSocket Issues (Days 3-4)
- [ ] Fix room rejoin race condition
- [ ] Add proper authentication queuing
- [ ] Implement connection state machine
- [ ] Add reconnection backoff strategy

#### 3. Reduce Technical Debt (Days 5-7)
- [ ] Reduce ESLint warnings by 50% (134 → 67)
- [ ] Replace console.log with proper logging
- [ ] Fix circular dependencies
- [ ] Add missing JSDoc comments

## Phase 3: New Features (Week 3+)

### Prerequisites
- All integration tests passing (350/350)
- Credit system consolidated
- WebSocket issues resolved
- Technical debt reduced

Then and only then:
- Repository pattern implementation
- Advanced state management
- Performance optimizations
- New feature development

## Success Metrics

### Week 1 Complete When:
- [ ] Test coverage > 85% (all integration tests passing)
- [ ] All UI components match test expectations
- [ ] No blocking bugs in core flows

### Week 2 Complete When:
- [ ] Single credit system implementation
- [ ] WebSocket connection stable
- [ ] ESLint warnings < 70
- [ ] Clean architecture documented

### Week 3+ Ready When:
- [ ] 100% of existing tests passing
- [ ] Codebase ready for new features
- [ ] Team confident in foundation

## Next Immediate Action

Start with `CreditsPage` component:
1. Run `npm test tests/integration/credits/credit-balance.test.tsx`
2. Fix one failing test at a time
3. Commit after each test passes
4. Move to next test

This approach ensures we build on our TDD foundation and deliver working features quickly.
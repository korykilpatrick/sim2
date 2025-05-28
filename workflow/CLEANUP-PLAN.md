# SIM Codebase Cleanup Plan - Restoring World-Class Quality

## Executive Summary

The SIM codebase has degraded from its intended world-class standards to a **6.8/10** quality score. This happened despite having a comprehensive workflow process documented in `/workflow/PROMPT.md`. The root cause: **the process was abandoned in favor of rapid feature delivery**.

This plan provides a methodical approach to:

1. Fix critical security vulnerabilities and architectural flaws
2. Restore the codebase to world-class standards
3. Implement safeguards to prevent future degradation
4. Maintain development velocity while improving quality

## Why The Process Wasn't Followed

### Root Causes Identified

1. **Process Overhead Perception**

   - 8-pass analysis seemed excessive for "simple" features
   - Developers skipped steps to "save time"
   - Technical debt accumulated silently

2. **Lack of Automated Enforcement**

   - Process relies on manual discipline
   - No automated checks for architectural patterns
   - No alerts when quality metrics degrade

3. **Feature Pressure**

   - Rush to implement vessel tracking features
   - "We'll fix it later" mentality
   - Later never came

4. **Missing Feedback Loops**
   - No visibility into quality degradation
   - No regular codebase analysis
   - Drift went unnoticed until too late

## Phase 1: Critical Security Fixes (Week 1)

### 1.1 Security Vulnerabilities (IMMEDIATE)

**Goal**: Remove all critical security flaws that would fail any security audit.

#### Tasks (Priority Order):

1. **Remove Hardcoded Secrets** (Day 1)

   ```typescript
   // Current CRITICAL vulnerability
   const JWT_SECRET = 'mock-jwt-secret' // In production code!

   // Fix: Use environment variables
   const JWT_SECRET =
     process.env.JWT_SECRET || throwError('JWT_SECRET required')
   ```

2. **Implement Password Hashing** (Day 1)

   ```typescript
   // Current: Plain text passwords
   {
     password: 'password123'
   }

   // Fix: Use bcrypt
   import bcrypt from 'bcrypt'
   const hashedPassword = await bcrypt.hash(password, 10)
   ```

3. **Move JWTs to httpOnly Cookies** (Day 2)

   ```typescript
   // Current: localStorage (XSS vulnerable)
   localStorage.setItem('token', jwt)

   // Fix: httpOnly cookies
   res.cookie('token', jwt, {
     httpOnly: true,
     secure: true,
     sameSite: 'strict',
   })
   ```

4. **Add Security Headers** (Day 2)

   - Content Security Policy
   - X-Frame-Options
   - X-Content-Type-Options
   - Strict-Transport-Security

5. **Implement CSRF Protection** (Day 3)
   - Add CSRF tokens to all state-changing requests
   - Validate on server side

**Success Criteria**: Pass OWASP security checklist

### 1.2 Type Safety Restoration (Days 4-5)

**Goal**: Achieve zero `any` types in production code.

#### Tasks:

1. **Create Type Migration Script**

   ```bash
   # Find all 'any' usage
   grep -r "any" src/ --include="*.ts" --include="*.tsx" | grep -v test
   ```

2. **Replace with Proper Types**

   - `any` → specific interfaces
   - `Record<string, any>` → typed objects
   - Function → specific signatures

3. **Add Discriminated Unions**
   ```typescript
   // Example for reports
   type Report =
     | { type: 'compliance'; complianceData: ComplianceData }
     | { type: 'chronology'; chronologyData: ChronologyData }
   ```

**Success Criteria**: Zero `any` in production code

## Phase 2: Architecture Cleanup (Week 2)

### 2.1 Directory Structure Consolidation

**Goal**: One location for each concern, no duplicate directories.

#### Tasks:

1. **Merge Layout Directories** (Day 1)

   ```bash
   # Current mess
   src/components/layout/   # AppLayout, Header, Sidebar
   src/components/layouts/  # DashboardLayout, PageLayout

   # Fix: Single layouts directory
   src/components/layouts/
     ├── AppLayout.tsx
     ├── DashboardLayout.tsx
     ├── PageLayout.tsx
     ├── components/
     │   ├── Header.tsx
     │   └── Sidebar.tsx
   ```

2. **Complete Feature Modules** (Days 2-3)

   - Add missing components to `/features/products/`
   - Implement `/features/compliance/` fully
   - Complete `/features/notifications/`

3. **Consolidate WebSocket Services** (Day 4)
   - Choose enhanced version
   - Delete duplicate
   - Update all imports

### 2.2 State Management Unification

**Goal**: Single source of truth for all state.

#### Tasks:

1. **Credit Balance Single Source** (Day 5)

   ```typescript
   // Single store
   interface CreditStore {
     balance: number
     updateBalance: (amount: number) => void
     // React Query handles server sync
   }
   ```

2. **Document State Flow** (Day 5)
   - Create state architecture diagram
   - Define clear update paths
   - Prevent race conditions

**Success Criteria**: No duplicate state, clear data flow

## Phase 3: Testing Excellence (Week 3)

### 3.1 Fix Failing Tests

**Goal**: 100% of existing tests passing.

#### Tasks:

1. **Fix 82 Failing Tests** (Days 1-2)

   - Update assertions to match implementation
   - Fix component prop mismatches
   - Resolve import errors

2. **Add Missing Test Types** (Days 3-4)
   - E2E test suite with Playwright
   - Visual regression with Percy
   - Performance benchmarks
   - Accessibility tests with axe

### 3.2 Implement Test Quality Gates

**Goal**: Prevent quality regression through automated testing.

#### Create Test Requirements:

```javascript
// .github/workflows/quality-gates.yml
- name: Check Test Coverage
  run: |
    coverage=$(npm run test:coverage -- --json)
    if [ $coverage -lt 80 ]; then
      echo "Coverage below 80%"
      exit 1
    fi

- name: Check Type Coverage
  run: |
    npx type-coverage --atleast 95
```

**Success Criteria**: All tests green, 85%+ coverage

## Phase 4: Performance & Production (Week 4)

### 4.1 Performance Optimization

**Goal**: Meet performance targets.

#### Tasks:

1. **Add Performance Monitoring** (Day 1)

   ```typescript
   // Web Vitals tracking
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

   function sendToAnalytics(metric) {
     // Send to monitoring service
   }

   getCLS(sendToAnalytics)
   getFID(sendToAnalytics)
   // etc...
   ```

2. **Implement Code Splitting** (Day 2)

   - Route-based splitting
   - Component lazy loading
   - Dynamic imports for heavy libraries

3. **Add Virtualization** (Day 3)
   - Virtual scrolling for large lists
   - Intersection Observer for images

### 4.2 Production Essentials

**Goal**: Production-ready monitoring and debugging.

#### Tasks:

1. **Restore Console Logging** (Day 4)

   ```typescript
   // Current: console stripped in production!
   drop_console: true // REMOVE THIS

   // Add proper production logging
   if (process.env.NODE_ENV === 'production') {
     logger.setLevel('error')
   }
   ```

2. **Add Observability** (Day 5)
   - Sentry for error tracking
   - DataDog for APM
   - LogRocket for session replay

**Success Criteria**: Full production observability

## Phase 5: Developer Experience (Week 5)

### 5.1 Reduce Complexity

**Goal**: Simplify development without sacrificing quality.

#### Tasks:

1. **Reduce Path Aliases** (Day 1)

   ```typescript
   // Current: 14 aliases (too many!)
   // Keep only:
   '@features'
   '@components'
   '@hooks'
   '@utils'
   '@types'
   ```

2. **Add Storybook** (Days 2-3)
   - Component playground
   - Visual documentation
   - Interaction testing

### 5.2 Improve Documentation

**Goal**: Self-documenting codebase.

#### Tasks:

1. **Component Documentation** (Day 4)

   - Props documentation
   - Usage examples
   - Visual examples in Storybook

2. **Architecture Decision Records** (Day 5)
   - Document key decisions
   - Explain trade-offs
   - Provide context

**Success Criteria**: New developer productive in 1 day

## Phase 6: Quality Safeguards (Week 6)

### 6.1 Automated Quality Metrics

**Goal**: Continuous visibility into code quality.

#### Implement Quality Dashboard:

```typescript
// quality-metrics.ts
export async function calculateQualityScore() {
  const metrics = {
    testCoverage: await getTestCoverage(),
    typeCoverage: await getTypeCoverage(),
    eslintScore: await getEslintScore(),
    bundleSize: await getBundleSize(),
    performanceScore: await getPerformanceScore(),
    securityScore: await getSecurityScore(),
  }

  return calculateWeightedScore(metrics)
}
```

### 6.2 Enforce Process Through Automation

**Goal**: Make the right thing the easy thing.

#### Tasks:

1. **Pre-commit Hooks Enhancement** (Day 1)

   ```bash
   # .husky/pre-commit
   npm run quality:check
   npm run architecture:validate
   npm run test:changed
   ```

2. **Architecture Validation** (Day 2)

   ```typescript
   // architecture-validator.ts
   export function validateArchitecture() {
     checkNoDuplicateImplementations()
     checkProperLayering()
     checkNoCircularDependencies()
     checkConsistentPatterns()
   }
   ```

3. **Automated Codebase Analysis** (Day 3)
   - Run 8-pass analysis weekly
   - Generate quality reports
   - Alert on degradation

### 6.3 Cultural Changes

**Goal**: Make quality everyone's responsibility.

#### Implement:

1. **Quality Reviews** (Ongoing)

   - Weekly codebase quality review
   - Celebrate quality improvements
   - Address degradation immediately

2. **Simplified Process Checklist** (Day 4)

   ```markdown
   ## Feature Checklist

   - [ ] Tests written first
   - [ ] Zero TypeScript errors
   - [ ] Zero ESLint errors
   - [ ] Follows existing patterns
   - [ ] Documentation updated
   - [ ] Performance impact assessed
   - [ ] Security impact assessed
   ```

3. **Quality Metrics in PR Template** (Day 5)
   - Auto-generate quality report
   - Block merge if quality degrades
   - Require justification for exceptions

## Implementation Strategy

### Week-by-Week Focus

1. **Week 1**: Security & Critical Fixes (Stop the bleeding)
2. **Week 2**: Architecture Cleanup (Fix the foundation)
3. **Week 3**: Testing Excellence (Ensure reliability)
4. **Week 4**: Performance & Production (User experience)
5. **Week 5**: Developer Experience (Team productivity)
6. **Week 6**: Quality Safeguards (Prevent regression)

### Success Metrics

#### Immediate (Week 1)

- [x] Zero security vulnerabilities (COMPLETED - Phase 1.1)
- [x] Zero TypeScript errors (COMPLETED - Phase 1.2)
- [x] Zero ESLint errors (COMPLETED)

#### Short-term (Week 4)

- [ ] All tests passing
- [ ] 85%+ test coverage
- [ ] Sub-3s load time
- [ ] Single source of truth for all state

#### Long-term (Week 6)

- [ ] Quality score ≥ 9/10
- [ ] New features don't degrade quality
- [ ] Team follows process naturally
- [ ] Automated quality enforcement

## Preventing Future Degradation

### 1. Make Quality Visible

- Dashboard showing real-time quality metrics
- Weekly quality reports
- Celebrate improvements

### 2. Automate Everything

- Quality checks in CI/CD
- Architecture validation
- Performance budgets
- Security scanning

### 3. Simplify the Process

- One-page checklist instead of 400-line process
- Automated where possible
- Clear value proposition

### 4. Regular Reality Checks

- Weekly codebase analysis
- Monthly architecture review
- Quarterly process refinement

## The Hard Truth

The current codebase is what happens when process is abandoned for speed. The irony: **rushing created more work than following the process would have**.

This cleanup will take 6 weeks. Following the process would have added maybe 2 weeks to development. The math is clear.

## Next Steps

1. **Today**: Start Phase 1.1 (Security fixes)
2. **This Week**: Complete all critical security issues
3. **Week 2**: Begin architecture cleanup
4. **Ongoing**: Implement safeguards as we go

Remember: **We have ZERO users**. There's no excuse for anything less than excellence.

---

_"The best time to plant a tree was 20 years ago. The second best time is now."_

Let's plant a world-class codebase.

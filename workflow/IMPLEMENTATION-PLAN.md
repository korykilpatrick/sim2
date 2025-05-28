# SIM Implementation Plan - TDD Frontend Completion

_Last Updated: May 28, 2025_

## Overview

This plan outlines the path to complete a fully implemented frontend for the SIM PRD using Test-Driven Development (TDD). The goal is to build a tech-debt-free implementation that can later be enhanced with performance features and connected to a real backend.

## Guiding Principles

1. **TDD First**: Write failing tests before implementing any feature
2. **Zero Tech Debt**: Fix issues immediately, never compromise quality
3. **PRD Alignment**: Every feature must match PRD specifications exactly
4. **No Backwards Compatibility**: We have zero users - always choose the ideal solution
5. **Mock Everything**: Build against comprehensive mock data until real backend available

## Phase 0: Critical Architecture Fixes (IMMEDIATE - 2 Days)

_Added based on Codebase Quality Assessment findings_

### 0.1 State Management Consolidation (Day 1) ✅ COMPLETED

**Goal**: Fix credit balance triple-state issue

#### Tasks:

1. [x] Complete migration from authStore.credits to creditStore
   - [x] Remove credits field from User type
   - [x] Update all components using authStore.user.credits
   - [x] Write tests for credit state synchronization
2. [x] Initialize WebSocket credit sync in App.tsx
   - [x] Call initializeCreditSync() on app startup (already in place)
   - [x] Test WebSocket credit updates
3. [x] Document state management architecture
   - [x] Single source of truth: creditStore
   - [x] React Query for server cache only
   - [x] Clear update paths

**Completed on 2025-05-28**: All credit state management consolidated to creditStore

### 0.2 Security & Architecture Quick Fixes (Day 2)

**Goal**: Address security concerns and clean architecture

#### Tasks:

1. [ ] Security hardening
   - [ ] Remove JWT_SECRET from .env (use env-specific secrets)
   - [ ] Move user session data from localStorage to memory/httpOnly cookies
   - [ ] Enable CSRF protection for auth endpoints
2. [ ] Architecture cleanup
   - [ ] Remove empty directories (assets/fonts, icons, images)
   - [ ] Remove empty mocks directory
   - [ ] Consolidate page organization (choose one pattern)
3. [ ] Production readiness
   - [ ] Remove drop_console from vite.config.ts
   - [ ] Add basic error boundary setup
   - [ ] Add TODO for future monitoring setup

## Phase 1: Core Monitoring Services (Week 1-2)

### 1.1 Vessel Tracking Service (VTS) Implementation

**Goal**: Complete individual vessel monitoring with all criteria

#### Tasks:

1. [x] Write tests for tracking criteria types (AIS, dark events, spoofing, etc.)
2. [x] Implement tracking criteria data models
3. [x] Build criteria selection UI components with tests
   - [x] Enhanced CriteriaSelector with category grouping
   - [x] Created CriteriaCheckbox component
   - [x] Created CriteriaCategoryGroup component
   - [x] Full test coverage (52 new tests)
4. [x] Create duration-based pricing calculator with tests
   - [x] Duration discounts (7-365+ days)
   - [x] Bulk vessel discounts (5-50+ vessels)
   - [x] Package tier discounts (Bronze/Silver/Gold/Platinum)
   - [x] 100% test coverage with TDD approach
5. [x] Implement bulk purchase options
   - [x] BulkPurchaseOptions component with preset vessel counts
   - [x] BulkPurchaseModal with full purchase workflow
   - [x] Custom vessel count input with validation
   - [x] Real-time pricing updates with all discounts
   - [x] 27 tests passing (100% coverage)
6. [ ] Build tracking configuration wizard
   - [ ] Step 1: Vessel selection with search
   - [ ] Step 2: Criteria selection with descriptions
   - [ ] Step 3: Duration configuration with pricing
   - [ ] Step 4: Review and confirmation
   - [ ] Integration with creditStore for payment
7. [ ] Add real-time status updates via WebSocket
   - [ ] Vessel position updates
   - [ ] Alert notifications
   - [ ] Tracking status changes

#### Success Criteria:

- Can create vessel tracking with multiple criteria
- Pricing updates based on duration and criteria
- Bulk discounts applied correctly
- All criteria types from PRD supported
- Real-time updates working

### 1.2 Alert System Infrastructure

**Goal**: Unified alert system for all monitoring services

#### Tasks:

1. [ ] Write tests for alert data models
2. [ ] Implement alert store with Zustand
3. [ ] Create alert delivery via WebSocket
4. [ ] Build alert UI components (badges, lists, details)
5. [ ] Implement alert filtering and search
6. [ ] Add alert acknowledgment flow
7. [ ] Create alert history tracking

#### Success Criteria:

- Alerts delivered in real-time
- Alert history persisted
- Filtering by type, severity, service
- Clear visual indicators for new alerts

## Phase 2: Area & Fleet Services (Week 2-3)

### 2.1 Area Monitoring Service (AMS)

**Goal**: Complete area monitoring with geofencing

#### Tasks:

1. [ ] Write tests for geofencing calculations
2. [ ] Implement coordinate-based area definitions
3. [ ] Build area drawing UI (polygon/circle)
4. [ ] Create area size pricing calculator
5. [ ] Implement monitoring criteria for areas
6. [ ] Add vessel entry/exit detection logic
7. [ ] Build area risk assessment calculator

#### Success Criteria:

- Can define custom areas on map
- Pricing based on area size and criteria
- Real-time vessel tracking within areas
- Risk scores calculated and displayed

### 2.2 Fleet Tracking Service (FTS)

**Goal**: Centralized fleet monitoring dashboard

#### Tasks:

1. [ ] Write tests for fleet tracking logic
2. [ ] Implement fleet-wide criteria application
3. [ ] Build fleet dashboard with vessel grid
4. [ ] Create fleet health/risk indicators
5. [ ] Add fleet alert aggregation
6. [ ] Implement contract-based pricing
7. [ ] Build fleet reporting features

#### Success Criteria:

- Single dashboard for entire fleet
- Criteria applied across all vessels
- Aggregated alerts and statistics
- Contract pricing with minimum vessels

## Phase 3: Reporting Services (Week 3-4)

### 3.1 Vessel Compliance Report

**Goal**: Automated compliance assessment generation

#### Tasks:

1. [ ] Write tests for compliance criteria
2. [ ] Implement sanctions screening logic
3. [ ] Build regulatory compliance checks
4. [ ] Create risk scoring algorithm
5. [ ] Design report PDF template
6. [ ] Implement report generation service
7. [ ] Add report caching and history

#### Success Criteria:

- All compliance criteria from PRD checked
- Risk scores calculated accurately
- Professional PDF output
- Reports generated on-demand

### 3.2 Vessel Chronology Report

**Goal**: Historical timeline report generation

#### Tasks:

1. [ ] Write tests for event timeline logic
2. [ ] Implement event aggregation by date
3. [ ] Build custom date range selector
4. [ ] Create timeline visualization component
5. [ ] Design chronology PDF template
6. [ ] Add event detail expansion
7. [ ] Implement report depth tiers

#### Success Criteria:

- Complete vessel history displayed
- Custom date ranges supported
- All event types from PRD included
- Clear timeline visualization

## Phase 4: Advanced Services (Week 4-5)

### 4.1 Maritime Investigations Service (MIS)

**Goal**: Complete RFI submission and tracking

#### Tasks:

1. [ ] Write tests for RFI workflow
2. [ ] Implement RFI form with validation
3. [ ] Build investigation scope selector
4. [ ] Create expert consultation scheduler
5. [ ] Add investigation status tracking
6. [ ] Implement document management
7. [ ] Build investigation updates feed

#### Success Criteria:

- Complete RFI submission flow
- Clear investigation status updates
- Document upload and management
- Expert consultation integration

### 4.2 Service Pricing & Packages

**Goal**: Implement all pricing models from PRD

#### Tasks:

1. [ ] Write tests for pricing calculations
2. [ ] Implement tiered pricing (Platinum, Gold, Silver, Bronze)
3. [ ] Build package selection UI
4. [ ] Create discount calculators
5. [ ] Add subscription management
6. [ ] Implement usage tracking
7. [ ] Build pricing comparison tools

#### Success Criteria:

- All pricing models from PRD implemented
- Bulk discounts calculated correctly
- Package benefits clearly displayed
- Usage tracked for billing

## Phase 5: Data Visualization & UX Polish (Week 5-6)

### 5.1 Maps & Visualization

**Goal**: Interactive maps and data visualizations

#### Tasks:

1. [ ] Integrate mapping library (Mapbox/Leaflet)
2. [ ] Build vessel position display
3. [ ] Implement area drawing tools
4. [ ] Create vessel route visualization
5. [ ] Add heatmaps for risk areas
6. [ ] Build interactive event markers
7. [ ] Implement map-based filtering

### 5.2 Enhanced User Experience

**Goal**: Production-ready UX with all flows optimized

#### Tasks:

1. [ ] Add loading states for all async operations
2. [ ] Implement optimistic updates
3. [ ] Build comprehensive empty states
4. [ ] Add guided tours for complex features
5. [ ] Create contextual help system
6. [ ] Implement keyboard shortcuts
7. [ ] Add accessibility features (ARIA labels, keyboard nav)

## Phase 6: Performance & Production Readiness (Week 6+)

### 6.1 Performance Optimization

**Goal**: Sub-second response times, smooth interactions

#### Tasks:

1. [ ] Add React.memo to expensive components
2. [ ] Implement virtual scrolling for large lists
3. [ ] Add service workers for offline support
4. [ ] Optimize bundle sizes
5. [ ] Profile and optimize render performance
6. [ ] Add image optimization
7. [ ] Implement proper memoization strategies

### 6.2 Production Essentials

**Goal**: Full production readiness with monitoring

#### Tasks:

1. [ ] Integrate error tracking (Sentry)
2. [ ] Add performance monitoring (Web Vitals)
3. [ ] Implement user analytics (privacy-respecting)
4. [ ] Add basic internationalization structure
5. [ ] Create feature flags system
6. [ ] Build admin dashboard
7. [ ] Implement A/B testing framework

## Testing Strategy

### Test Coverage Goals

- **Unit Tests**: 90% coverage for all business logic
- **Integration Tests**: All user flows covered
- **E2E Tests**: Critical paths automated
- **Visual Regression**: UI consistency validated

### TDD Process for Each Feature

1. Write failing E2E test for user flow
2. Write failing integration tests for feature
3. Write failing unit tests for logic
4. Implement minimal code to pass tests
5. Refactor for quality
6. Update documentation

## Migration Strategy

### Backend Integration Preparation

1. All API calls through centralized client
2. Mock data matches expected backend format
3. Feature flags for gradual rollout
4. Comprehensive error handling
5. Retry logic with exponential backoff
6. Request/response logging

### Zero-Downtime Migration

1. Dual-mode operation (mock + real)
2. Feature-by-feature migration
3. Automated regression testing
4. Rollback capabilities
5. Performance comparison metrics

## Success Metrics

### Code Quality

- [ ] 85%+ test coverage (current: ~80%)
- [ ] 0 ESLint errors/warnings
- [ ] 0 TypeScript errors
- [ ] All features match PRD exactly
- [ ] No `any` types in production code

### Performance

- [ ] < 3s initial load time
- [ ] < 100ms interaction response
- [ ] 90+ Lighthouse score
- [ ] < 500KB initial bundle

### Business Readiness

- [ ] All PRD features implemented
- [ ] All user flows tested
- [ ] Mock data comprehensive
- [ ] Documentation complete
- [ ] Zero known bugs

## Next Steps

1. **Immediate**: Complete Phase 0 critical fixes (2 days)
2. **This Week**: Complete vessel tracking wizard (Phase 1.1)
3. **Week 2**: Complete alert system and start area monitoring
4. **Week 3**: Complete fleet services and start reporting
5. **Week 4**: Complete reporting and start investigations
6. **Week 5**: Complete advanced services and start visualization
7. **Week 6+**: Performance optimization and production readiness

## Notes

- Each task should take 2-4 hours with TDD
- Always verify against PRD requirements
- Update this plan after each session
- Maintain zero tech debt throughout
- Ask for real backend API specs when available
- Run visual tests with Puppeteer after any UI changes
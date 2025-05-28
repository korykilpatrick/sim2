# SIM Project Task Board

_Auto-generated from TASK-MANIFEST.json_
_Last Updated: 2025-05-28_

## 🚨 Critical Tasks (Priority 90+)

### Security (Phase 0.2)

- [ ] **[phase0-security-1]** Remove JWT_SECRET from .env (Priority: 95)
- [ ] **[phase0-security-2]** Move user session from localStorage to secure storage (Priority: 90)

## 🔥 High Priority Tasks (Priority 70-89)

### Security & Production (Phase 0.2)

- [ ] **[phase0-security-3]** Enable CSRF protection for auth endpoints (Priority: 85)
- [ ] **[phase0-prod-2]** Add error boundary setup (Priority: 75)
- [ ] **[phase0-prod-1]** Remove drop_console from vite.config (Priority: 70)

### Core Features (Phase 1.1)

- [ ] **[phase1-vessel-1]** Build tracking configuration wizard (Priority: 80)
- [ ] **[phase1-vessel-2]** Add real-time vessel status updates (Priority: 75) ⛔ BLOCKED

### Alert System (Phase 1.2)

- [ ] **[phase1-alert-1]** Create alert data models and tests (Priority: 85)
- [ ] **[phase1-alert-2]** Implement alert store with Zustand (Priority: 80) ⛔ BLOCKED
- [ ] **[phase1-alert-3]** Build alert UI components (Priority: 75) ⛔ BLOCKED

### Pricing (Phase 4.2)

- [ ] **[phase4-pricing-1]** Implement tiered pricing system (Priority: 70)

## 📋 Medium Priority Tasks (Priority 50-69)

### Cleanup (Phase 0.2)

- [ ] **[phase0-cleanup-2]** Consolidate page organization pattern (Priority: 65)
- [ ] **[phase0-cleanup-1]** Remove empty directories (Priority: 60)

### Area Monitoring (Phase 2.1)

- [ ] **[phase2-area-1]** Implement geofencing calculations (Priority: 70) ⛔ BLOCKED
- [ ] **[phase2-area-2]** Build area drawing UI (Priority: 65) ⛔ BLOCKED

### Fleet Services (Phase 2.2)

- [ ] **[phase2-fleet-1]** Create fleet tracking dashboard (Priority: 65) ⛔ BLOCKED

### Reporting (Phase 3)

- [ ] **[phase3-compliance-1]** Implement compliance checking logic (Priority: 60) ⛔ BLOCKED
- [ ] **[phase3-compliance-2]** Design compliance report PDF template (Priority: 55) ⛔ BLOCKED
- [ ] **[phase3-chronology-1]** Build timeline visualization component (Priority: 55) ⛔ BLOCKED

### Maps (Phase 5.1)

- [ ] **[phase5-map-1]** Integrate mapping library (Priority: 60)

### UX (Phase 5.2)

- [ ] **[phase5-ux-1]** Add comprehensive loading states (Priority: 50) ⛔ BLOCKED

### Investigations (Phase 4.1)

- [ ] **[phase4-investigation-1]** Create RFI submission form (Priority: 50) ⛔ BLOCKED

## 🔧 Low Priority Tasks (Priority <50)

### Production (Phase 6.2)

- [ ] **[phase6-prod-1]** Integrate error tracking (Priority: 45) ⛔ BLOCKED

### Performance (Phase 6.1)

- [ ] **[phase6-perf-1]** Add React.memo optimization (Priority: 40) ⛔ BLOCKED

## 📊 Task Statistics

- **Total Tasks**: 24
- **Ready to Start**: 11
- **Blocked**: 13
- **In Progress**: 0
- **Completed**: 0

## 🚧 Blocking Dependencies

### phase1-vessel-1 blocks:

- phase1-vessel-2
- phase3-compliance-1
- phase3-chronology-1
- phase4-investigation-1

### phase1-alert-1 blocks:

- phase1-alert-2

### phase1-alert-2 blocks:

- phase1-alert-3
- phase2-area-1

### phase5-map-1 blocks:

- phase2-area-2

### Multiple dependencies block:

- phase5-ux-1 (needs phase1-vessel-1, phase2-area-1)
- phase6-prod-1 (needs phase5-ux-1)
- phase6-perf-1 (needs phase5-ux-1)

## 🎯 Next Actions

1. **Security First**: Complete all Phase 0.2 security tasks
2. **Core Features**: Build vessel tracking wizard to unblock many tasks
3. **Alert System**: Implement alert infrastructure
4. **Pricing**: Add tiered pricing system
5. **Maps**: Integrate mapping library to enable area features

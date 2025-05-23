# Context Guide for Claude Code - SIM Frontend

This document helps you determine which documentation to load based on your current task. Always start here to optimize context window usage.

## 🚀 Quick Start
1. Find your task type below
2. Load ONLY the listed documents in order
3. Reference PRD sections only if building that specific feature
4. Use "Reference Only" docs by looking up specific sections, not loading entirely

## 📋 Task Routing

### 🏁 Initial Project Setup
**Load these documents:**
1. FRONTEND-ARCHITECTURE.md
2. FOLDER-STRUCTURE.md
3. MOCK-API-SPEC.md
**PRD Sections:** Introduction, What is SIM (overview only)

### 🎨 Building New UI Components
**Load these documents:**
1. DESIGN-SYSTEM.md
2. COMPONENT-PATTERNS.md
3. NAMING-CONVENTIONS.md
4. FOLDER-STRUCTURE.md (components section only)
**PRD Sections:** None unless component-specific

### 📊 Data Tables & Lists (Vessels, Reports, Alerts)
**Load these documents:**
1. COMPONENT-PATTERNS.md (table patterns)
2. DATA-FLOW.md
3. INTERACTION-PATTERNS.md
4. MOCK-API-SPEC.md (relevant endpoints)
**PRD Sections:** Specific product criteria being displayed

### 💳 Payment & Credits System
**Load these documents:**
1. STATE-PATTERNS.md
2. DATA-FLOW.md
3. INTERACTION-PATTERNS.md (success/error states)
4. REFERENCE-FLOW.md (if exists)
**PRD Sections:** Sales & Monetization Model, Credits-Based System, Checkout-Based System

### 🚨 Alert & Notification Features
**Load these documents:**
1. COMPONENT-PATTERNS.md (alert components)
2. DATA-FLOW.md (real-time updates section)
3. ANIMATION-GUIDE.md
4. API-SCENARIOS.md (notification scenarios)
**PRD Sections:** Delivery Channels, Monitoring Criteria

### 🗺️ Maps & Geospatial Features (AOI, Fleet Tracking)
**Load these documents:**
1. COMPONENT-PATTERNS.md (map components)
2. RESPONSIVE-STRATEGY.md
3. DATA-FIXTURES.md (geospatial data)
4. INTERACTION-PATTERNS.md (map interactions)
**PRD Sections:** Area Monitoring Service, Fleet Tracking Service

### 📝 Forms (Tracking Config, Report Orders, RFIs)
**Load these documents:**
1. COMPONENT-PATTERNS.md (form patterns)
2. STATE-PATTERNS.md (form state section)
3. INTERACTION-PATTERNS.md (validation, errors)
4. NAMING-CONVENTIONS.md
**PRD Sections:** Relevant product configuration options

### 🎯 Product Pages (VTS, AMS, FTS, Reports)
**Load these documents:**
1. COMPONENT-PATTERNS.md
2. RESPONSIVE-STRATEGY.md
3. DESIGN-SYSTEM.md
4. DATA-FLOW.md
**PRD Sections:** Specific product offering section

### 📈 Dashboard & Analytics Views
**Load these documents:**
1. COMPONENT-PATTERNS.md (dashboard layouts)
2. DATA-FLOW.md
3. RESPONSIVE-STRATEGY.md
4. ANIMATION-GUIDE.md (data transitions)
**PRD Sections:** Features and Benefits of relevant product

### 🔐 Authentication & User Account
**Load these documents:**
1. STATE-PATTERNS.md (auth state)
2. DATA-FLOW.md (auth flow)
3. INTERACTION-PATTERNS.md
4. COMPONENT-PATTERNS.md (auth forms)
**PRD Sections:** Target Audience section

### 🔍 Search & Filtering
**Load these documents:**
1. COMPONENT-PATTERNS.md (search/filter UI)
2. STATE-PATTERNS.md (filter state)
3. INTERACTION-PATTERNS.md (instant search)
4. API-SCENARIOS.md (search scenarios)
**PRD Sections:** None

### 📄 Report Generation & Viewing
**Load these documents:**
1. COMPONENT-PATTERNS.md (report layouts)
2. DATA-FLOW.md
3. INTERACTION-PATTERNS.md (loading states)
4. MOCK-API-SPEC.md (report endpoints)
**PRD Sections:** Specific report type (Compliance, Chronology, etc.)

### 🛠️ Mock Backend Work
**Load these documents:**
1. MOCK-API-SPEC.md
2. DATA-FIXTURES.md
3. API-SCENARIOS.md
**PRD Sections:** All product offerings for data structure

### 🐛 Error Handling & Edge Cases
**Load these documents:**
1. INTERACTION-PATTERNS.md
2. API-SCENARIOS.md (error scenarios)
3. COMPONENT-PATTERNS.md (error components)
**PRD Sections:** None

### ♿ Accessibility Implementation
**Load these documents:**
1. COMPONENT-PATTERNS.md (a11y section)
2. INTERACTION-PATTERNS.md (keyboard nav)
3. DESIGN-SYSTEM.md (color contrast)
**PRD Sections:** None

## 📊 Context Window Optimization Rules

### Loading Priority
1. **Task-specific docs first** - Load primary documents for your task
2. **Reference sparingly** - Look up specific sections rather than loading entire docs
3. **PRD on demand** - Only load PRD sections when implementing that exact feature
4. **Incremental loading** - Start minimal, add docs only when stuck

### Document Relationships

**🔴 PRIMARY** (Usually need full document):
- COMPONENT-PATTERNS.md - Most tasks need this
- DATA-FLOW.md - For any state/data work
- MOCK-API-SPEC.md - For backend integration

**🟡 SECONDARY** (Load specific sections):
- DESIGN-SYSTEM.md - Reference tokens/variables
- STATE-PATTERNS.md - Reference specific patterns
- FOLDER-STRUCTURE.md - Reference for file placement

**🟢 REFERENCE** (Look up only when needed):
- REFERENCE-FLOW.md - Check implementation examples
- NAMING-CONVENTIONS.md - Quick lookups
- prd.md - Specific feature requirements

### Anti-Patterns
❌ Never load all documentation at once
❌ Don't load the full PRD unless building from scratch
❌ Avoid loading similar documents (e.g., all UI-related docs)
❌ Don't keep documents loaded between different task types

## 🎯 Task Switching Protocol

When switching between tasks:
1. Clear previous context
2. Return to this guide
3. Load new task-specific documents
4. Maintain only shared dependencies if applicable

## 💡 Quick Reference

**Building something new?**
→ Start with COMPONENT-PATTERNS.md

**Connecting to backend?**
→ Start with MOCK-API-SPEC.md

**Managing state?**
→ Start with DATA-FLOW.md

**Styling/theming?**
→ Start with DESIGN-SYSTEM.md

**Lost or confused?**
→ Check FRONTEND-ARCHITECTURE.md

---

Remember: Efficient context usage = better code generation. When in doubt, load less and reference more.
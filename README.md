# SIM - SynMax Intelligence Marketplace

## 🚨 CRITICAL: Test-First Development

**Current Status**: 0% test coverage across 357 files - THIS MUST BE ADDRESSED FIRST

This project follows strict test-first development practices:
- **80% minimum test coverage** required for all code
- **TDD (Test-Driven Development)** for all new features
- **No commits without passing tests**

## Quick Start

```bash
# Install dependencies
npm install

# Run tests (ALWAYS run first!)
npm test

# Check coverage (must be 80%+)
npm run test:coverage

# Start development (only after tests pass)
npm run dev
```

## Development Workflow

1. **Write Test First** - Create failing test for new functionality
2. **Implement Code** - Write minimal code to pass test
3. **Refactor** - Improve while keeping tests green
4. **Verify Coverage** - Ensure 80%+ coverage maintained

## Why Test-First?

In the era of AI-assisted development:
- Tests validate AI-generated code meets requirements
- Tests serve as living documentation
- Tests enable confident refactoring
- Tests prevent regressions in production

## Documentation

- [Testing Standards](/docs/standards/TESTING-STANDARDS.md) - Comprehensive testing guide
- [Implementation Plan](/workflow/IMPLEMENTATION-PLAN.md) - Test-first roadmap
- [Architecture](/docs/architecture/FRONTEND-ARCHITECTURE.md) - System design

## Tech Stack

- React 18 + TypeScript + Vite
- Vitest for testing
- Tailwind CSS
- Zustand + React Query
- Express mock backend

See [CLAUDE.md](CLAUDE.md) for detailed development instructions.

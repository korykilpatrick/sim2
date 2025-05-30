# Claude Code Instructions for SIM Project

## 📖 START HERE: Read the Development Workflow

**CRITICAL**: Before making ANY changes, read:

1. `/workflow/PROMPT.md` - The complete development workflow
2. `/workflow/PROCESS-PHILOSOPHY.md` - WHY we follow this process
3. `/workflow/IMPLEMENTATION-PLAN.md` - Current priorities

The workflow ensures we maintain world-class code quality. Follow it EXACTLY.

## CRITICAL: Test-First Development

This project follows test-first development practices. **No code should be committed without tests.**

- Current coverage: 79.14% (next goal: 85%+ by fixing UI tests)
- All new features must be developed using TDD
- Tests serve as documentation and validation for AI-generated code

## Visual Testing with Puppeteer

**CRITICAL**: Any UI changes MUST be visually verified using Puppeteer before marking complete.

### When to Use Visual Testing

- After implementing ANY UI component
- After changing styles or layouts
- After modifying user interactions
- When fixing visual bugs
- Before committing frontend changes

### Visual Testing Commands

# Basic visual check

"Use Puppeteer to navigate to http://localhost:5173[route] and take a screenshot. Check for any console errors or visual issues."

# Component-specific testing

"Use Puppeteer to test the [component name]:

1. Navigate to [route]
2. Take a screenshot of the initial state
3. Interact with [specific elements]
4. Verify the expected behavior
5. Check console for errors
6. Take a final screenshot"

## Project Commands

### Testing (RUN FIRST - ALWAYS!)

- **`npm test`** - Run tests with Vitest (MUST PASS before any commit)
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage (must be 80%+)

### Development

- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start only the client (Vite)
- `npm run dev:server` - Start only the mock API server

### Quality Checks (Run AFTER tests pass!)

- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

### Build

- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

The project follows the architecture defined in `docs/architecture/FRONTEND-ARCHITECTURE.md` with:

- React 18 + TypeScript
- Vite for bundling
- Tailwind CSS for styling
- Zustand for state management
- React Query for server state
- Express mock API server
- Vitest for testing

## Important Notes

- **TEST FIRST**: Always run `npm test` before ANY commit - 80% coverage required
- **TDD MANDATORY**: Write failing tests before implementing features
- **NO EXCEPTIONS**: Code without tests will be rejected
- **NO BACKWARDS COMPATIBILITY**: We have zero users - always choose the ideal solution
- **PRE-COMMIT HOOKS**: All commits are automatically checked for ESLint, Prettier, and TypeScript errors
- **COMMIT STANDARDS**: All commits must follow Conventional Commits format (see `/docs/standards/COMMIT-STANDARDS.md`)
- After tests pass, run `npm run lint` and `npm run typecheck`
- The mock API server runs on port 3001
- The client dev server runs on port 5173 with proxy to API
- Path aliases are configured (@components, @features, etc.)
- Strict TypeScript mode is enabled
- See `/docs/standards/TESTING-STANDARDS.md` for comprehensive testing guide
- See `/docs/standards/PRE-COMMIT-HOOKS.md` for pre-commit hook details

## Development Workflow Summary

1. **Check Current State**: Read implementation plan, ensure next task makes sense
2. **Write Test First**: Create failing test for new functionality
3. **Implement Code**: Write minimal code to pass the test
4. **Exhaustive Analysis**: Use "infinite compute" to verify quality
5. **Update Documentation**: Keep plan and docs in sync with reality

**👉 Full workflow with ALL steps in `/workflow/PROMPT.md`**

## Data Architecture Guidelines

- **NEVER duplicate data definitions** - Always use a single source of truth
- Product data is centralized in `/src/constants/products.ts`
- All product-related components must import from the centralized source
- See `/docs/standards/DATA-ARCHITECTURE.md` for detailed patterns
- When adding new data types, follow the same centralized pattern
- **All data models must have corresponding tests**

# Claude Code Instructions for SIM Project

## CRITICAL: Test-First Development
This project follows test-first development practices. **No code should be committed without tests.**
- Current coverage: 0% (CRITICAL - must reach 80%+)
- All new features must be developed using TDD
- Tests serve as documentation and validation for AI-generated code

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
- After tests pass, run `npm run lint` and `npm run typecheck`
- The mock API server runs on port 3001
- The client dev server runs on port 5173 with proxy to API
- Path aliases are configured (@components, @features, etc.)
- Strict TypeScript mode is enabled
- See `/docs/standards/TESTING-STANDARDS.md` for comprehensive testing guide

## Development Workflow
1. **Write Test First**: Create failing test for new functionality
2. **Implement Code**: Write minimal code to pass the test
3. **Refactor**: Improve code while keeping tests green
4. **Run Full Suite**: `npm test` before committing
5. **Check Coverage**: Ensure 80%+ coverage maintained

## Data Architecture Guidelines
- **NEVER duplicate data definitions** - Always use a single source of truth
- Product data is centralized in `/src/constants/products.ts`
- All product-related components must import from the centralized source
- See `/docs/standards/DATA-ARCHITECTURE.md` for detailed patterns
- When adding new data types, follow the same centralized pattern
- **All data models must have corresponding tests**
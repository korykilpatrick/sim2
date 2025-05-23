# Claude Code Instructions for SIM Project

## Project Commands

### Development
- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start only the client (Vite)
- `npm run dev:server` - Start only the mock API server

### Quality Checks (Run these before committing!)
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

### Testing
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

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
- Always run `npm run lint` and `npm run typecheck` before committing changes
- The mock API server runs on port 3001
- The client dev server runs on port 5173 with proxy to API
- Path aliases are configured (@components, @features, etc.)
- Strict TypeScript mode is enabled
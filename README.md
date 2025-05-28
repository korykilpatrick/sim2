# SIM - SynMax Intelligence Marketplace

A modern web application for maritime intelligence services, providing vessel tracking, area monitoring, fleet management, and compliance reporting.

## Quick Start

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start development servers (frontend + API)
npm run dev
```

The application runs on:

- Frontend: http://localhost:5173
- Mock API: http://localhost:3001

**Demo credentials**: `demo@synmax.com` / `demo123`

## Project Philosophy

This codebase follows strict engineering principles:

1. **Test-First Development** - All features must have tests before implementation
2. **Type Safety** - Full TypeScript with strict mode enabled
3. **Code Quality** - Automated linting, formatting, and pre-commit hooks
4. **No Legacy Burden** - Zero users means we always choose the ideal solution

## Tech Stack

**Frontend**

- React 18 with TypeScript
- Vite for fast builds
- Tailwind CSS for styling
- Zustand + React Query for state management

**Backend**

- Express.js mock API
- Socket.io for real-time features
- JWT authentication

**Testing & Quality**

- Vitest for unit/integration tests
- ESLint + Prettier for code standards
- Husky for pre-commit hooks

## Key Commands

```bash
npm run dev          # Start development servers
npm test             # Run tests
npm run lint         # Check code quality
npm run typecheck    # Verify TypeScript types
npm run build        # Production build
```

## Documentation

- [Architecture Overview](docs/architecture/FRONTEND-ARCHITECTURE.md)
- [Development Workflow](workflow/PROMPT.md)
- [Testing Standards](docs/standards/TESTING-STANDARDS.md)
- [API Documentation](docs/api/MOCK-API-SPEC.md)

## Features

✅ **Authentication** - JWT-based with secure sessions  
✅ **Vessel Tracking** - Track individual vessels with 11 monitoring criteria  
✅ **Area Monitoring** - Monitor maritime regions with geofencing  
✅ **Fleet Management** - Organize and track vessel groups  
✅ **Compliance Reports** - Generate regulatory reports  
✅ **Credits System** - Usage-based billing with multiple tiers

## Contributing

1. Read [CLAUDE.md](CLAUDE.md) for AI-assisted development guidelines
2. Follow the [development workflow](workflow/PROMPT.md)
3. Ensure all tests pass before committing
4. Use conventional commits format

## License

Proprietary - SynMax Inc.

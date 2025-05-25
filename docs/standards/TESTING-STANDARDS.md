# Testing Standards for SIM Project

## Overview
This document defines the testing standards and practices for the SIM project. With AI-assisted development becoming prevalent, comprehensive testing is critical for maintaining code quality and enabling confident iterations.

## Why Test-First Development

### The AI Development Paradigm Shift
- **Validation**: Tests validate that AI-generated code meets specifications
- **Documentation**: Tests serve as executable documentation of expected behavior
- **Confidence**: Comprehensive tests enable fearless refactoring and improvements
- **Quality Gates**: Tests prevent regressions and maintain code quality

### Current State
- **0% test coverage** across 357 files
- **Critical risk** for production deployment
- **Blocker** for safe AI-assisted development

## Testing Requirements

### Coverage Goals
- **Minimum**: 80% overall coverage (enforced by CI/CD)
- **Critical Paths**: 100% coverage for:
  - Authentication flows
  - Credit system operations
  - Payment processing
  - Data mutations
  - WebSocket connections

### Test Types Required

#### 1. Unit Tests
- All utility functions
- Business logic services
- Custom hooks
- State management (Zustand stores)
- API client methods

#### 2. Integration Tests
- API endpoint interactions
- Authentication flows
- Credit deduction workflows
- WebSocket event handling
- Multi-component interactions

#### 3. Component Tests
- All UI components with logic
- Form validations
- Conditional rendering
- Event handlers
- Loading/error states

#### 4. E2E Tests (Future)
- Critical user journeys
- Purchase flows
- Report generation
- Real-time updates

## Testing Stack

### Core Libraries
```json
{
  "jest": "^29.0.0",
  "testing-library/react": "^14.0.0",
  "testing-library/jest-dom": "^6.0.0",
  "testing-library/user-event": "^14.0.0",
  "msw": "^2.0.0",
  "react-test-renderer": "^18.0.0"
}
```

### Configuration
- **Test Runner**: Jest with jsdom environment
- **Coverage Reporter**: lcov for CI integration
- **Mock Service**: MSW for API mocking
- **Assertion Library**: Jest + Testing Library matchers

## Test File Organization

### Naming Convention
```
ComponentName.tsx       → ComponentName.test.tsx
useHookName.ts         → useHookName.test.ts
serviceName.ts         → serviceName.test.ts
```

### Directory Structure
```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts
└── __tests__/
    └── integration/
        └── auth-flow.test.tsx
```

## Writing Tests

### Test Structure
```typescript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Common setup
  });

  describe('when condition', () => {
    it('should expected behavior', () => {
      // Arrange
      const props = { /* ... */ };
      
      // Act
      render(<Component {...props} />);
      
      // Assert
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });
});
```

### Best Practices
1. **Descriptive Names**: Test names should read like specifications
2. **Single Assertion**: Each test should verify one behavior
3. **No Implementation Details**: Test behavior, not implementation
4. **Realistic Data**: Use fixtures that mirror production data
5. **Accessibility**: Use accessible queries (getByRole, getByLabelText)

### Testing Patterns

#### Component Testing
```typescript
// Good: Tests behavior
it('should deduct credits when tracking is started', async () => {
  render(<VesselTracking />);
  
  await userEvent.click(screen.getByRole('button', { name: /start tracking/i }));
  
  expect(screen.getByText(/credits deducted/i)).toBeInTheDocument();
});

// Bad: Tests implementation
it('should call setCredits with new value', () => {
  // Don't test implementation details
});
```

#### Hook Testing
```typescript
it('should update auth state on login', async () => {
  const { result } = renderHook(() => useAuth());
  
  await act(async () => {
    await result.current.login({ email: 'test@example.com', password: 'password' });
  });
  
  expect(result.current.isAuthenticated).toBe(true);
  expect(result.current.user).toEqual(expect.objectContaining({
    email: 'test@example.com'
  }));
});
```

#### API Testing with MSW
```typescript
beforeEach(() => {
  server.use(
    rest.get('/api/vessels/search', (req, res, ctx) => {
      return res(ctx.json({ vessels: mockVessels }));
    })
  );
});

it('should display search results', async () => {
  render(<VesselSearch />);
  
  await userEvent.type(screen.getByRole('searchbox'), 'Queen Mary');
  await userEvent.click(screen.getByRole('button', { name: /search/i }));
  
  await waitFor(() => {
    expect(screen.getByText('Queen Mary 2')).toBeInTheDocument();
  });
});
```

## TDD Workflow

### The Red-Green-Refactor Cycle
1. **Red**: Write a failing test for new functionality
2. **Green**: Write minimal code to pass the test
3. **Refactor**: Improve code while tests stay green

### Example TDD Flow
```typescript
// 1. Red - Write failing test
it('should calculate tracking cost based on duration', () => {
  expect(calculateTrackingCost(7)).toBe(70); // 7 days * 10 credits
});

// 2. Green - Minimal implementation
function calculateTrackingCost(days: number): number {
  return days * 10;
}

// 3. Refactor - Improve with constants
const CREDITS_PER_DAY = 10;
function calculateTrackingCost(days: number): number {
  return days * CREDITS_PER_DAY;
}
```

## CI/CD Integration

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test -- --bail --findRelatedTests"
    }
  }
}
```

### GitHub Actions
```yaml
- name: Run tests
  run: npm test -- --coverage --ci

- name: Check coverage threshold
  run: |
    if [ $(jq '.total.lines.pct' coverage/coverage-summary.json) -lt 80 ]; then
      echo "Coverage below 80%"
      exit 1
    fi
```

## Using AI for Test Generation

### Effective Prompts
```
"Generate comprehensive tests for the VesselTracking component including:
- Happy path user flows
- Error states
- Loading states
- Edge cases
- Accessibility tests"
```

### Review Checklist for AI-Generated Tests
- [ ] Tests are meaningful, not just for coverage
- [ ] Test descriptions are clear and specific
- [ ] No implementation details are tested
- [ ] Mock data is realistic
- [ ] Tests follow project patterns

## Maintenance

### When to Update Tests
- **Always**: When changing component behavior
- **Always**: When fixing bugs (add regression test)
- **Never**: For refactoring (tests should still pass)

### Test Performance
- Keep unit tests under 5ms each
- Integration tests under 100ms each
- Total test suite under 60 seconds
- Use `test.skip` for slow tests during development

## Reporting

### Coverage Reports
- Generated in `/coverage` directory
- View HTML report: `open coverage/lcov-report/index.html`
- CI posts coverage comments on PRs

### Test Results
- Console output shows pass/fail
- Failed tests block commits and PRs
- Flaky tests must be fixed immediately

## Conclusion

Test-first development is not optional for modern AI-assisted development. Tests provide the safety net that enables rapid iteration and confident deployment. Every line of code should be backed by tests that verify its behavior.

Remember: **If it's not tested, it's broken.**
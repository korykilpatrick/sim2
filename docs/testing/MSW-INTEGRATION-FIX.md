# MSW Integration Test Fix Pattern

## Problem
Integration tests were failing because MSW (Mock Service Worker) wasn't intercepting API requests properly. Tests would hang in loading states or fail with unhandled request errors.

## Root Causes
1. **Absolute URLs in tests**: Some tests were using absolute URLs like `http://localhost:3001/api/...` which MSW couldn't intercept
2. **API client configuration**: The axios client needed proper configuration for the test environment
3. **Handler URL patterns**: MSW handlers needed exact URL pattern matches

## Solution

### 1. Configure API Client for Tests
Create a test-specific API client configuration:

```typescript
// tests/utils/test-api-client.ts
import { apiClient } from '@/api/client'

export function configureApiClientForTests() {
  // Ensure requests use relative URLs
  apiClient.defaults.baseURL = '/api/v1'
  
  // Clear any interceptors that might interfere
  apiClient.interceptors.request.handlers = []
  
  // Add logging for debugging
  apiClient.interceptors.request.use(
    (config) => {
      console.log('Test API request:', config.method?.toUpperCase(), config.url)
      return config
    }
  )
}
```

### 2. Update Test Setup
Add the configuration to your test setup file:

```typescript
// tests/setup.ts
import { configureApiClientForTests } from './utils/test-api-client'

beforeAll(() => {
  // Configure API client first
  configureApiClientForTests()
  
  // Then start MSW server
  server.listen({ onUnhandledRequest: 'error' })
  
  // Add debugging (remove in production)
  server.events.on('request:start', ({ request }) => {
    console.log('MSW intercepted:', request.method, request.url)
  })
})
```

### 3. Fix Test Assertions
Update test assertions to match actual component output:

```typescript
// Instead of looking for just the number
expect(screen.getByText('1,000')).toBeInTheDocument()

// Use data-testid and check full content
const balanceElement = screen.getByTestId('credit-balance')
expect(balanceElement).toHaveTextContent('1,000 Credits')
```

### 4. Use Relative URLs in Tests
When making direct API calls in tests, use relative URLs:

```typescript
// ❌ Bad - MSW can't intercept
const response = await fetch('http://localhost:3001/api/credits/deduct', {...})

// ✅ Good - MSW will intercept
const response = await fetch('/api/v1/credits/deduct', {...})
```

### 5. Match Handler Patterns Exactly
Ensure MSW handlers match the exact URL pattern:

```typescript
// Handler definition
http.get('/api/v1/credits/balance', () => {
  return HttpResponse.json({ success: true, data: mockData })
})

// Override for error tests
server.use(
  http.get('/api/v1/credits/balance', () => {
    return HttpResponse.json({ error: 'Server error' }, { status: 500 })
  })
)
```

## Debugging Tips

1. **Enable MSW logging** to see which requests are being intercepted
2. **Check the browser/test console** for unhandled request warnings
3. **Verify API client base URL** matches handler patterns
4. **Use exact URL patterns** in handlers (avoid wildcards initially)

## Common Issues

### Tests hang in loading state
- Component is making API call but MSW isn't intercepting
- Check URL patterns match exactly
- Verify API client configuration

### "Unhandled request" errors
- MSW can't find a matching handler
- Check the logged URL in the error message
- Update handler pattern to match

### Component not updating after API calls
- Component may need explicit refetch trigger
- Use `rerender` or trigger refetch in the component
- Check if component subscribes to data updates correctly

## Next Steps
Apply this pattern to fix other failing integration tests:
- Vessel tracking tests
- Area monitoring tests  
- Report generation tests
- Fleet management tests
# JSDoc Standards

## Overview

This document defines JSDoc documentation standards for the SIM project. These standards ensure consistent, useful documentation that enhances TypeScript's static typing while providing valuable context for developers.

## When to Use JSDoc

### Required Documentation

1. **All exported functions and methods**
   - Public API surface
   - Utility functions
   - Hook functions
   - Event handlers with complex logic

2. **React components**
   - Component purpose and usage
   - Props documentation (when not self-evident)
   - Usage examples for complex components

3. **Complex types and interfaces**
   - Business logic types
   - API response/request types
   - Configuration objects

4. **Classes and constructors**
   - Class purpose
   - Constructor parameters
   - Public methods

5. **Constants with business logic**
   - Configuration constants
   - Magic numbers/strings
   - Regex patterns

### Optional Documentation

- Private functions (only if logic is complex)
- Simple getter/setter methods
- Self-documenting code with clear naming
- Type aliases that are self-explanatory

## JSDoc Format Standards

### Basic Function Documentation

```typescript
/**
 * Calculates the total price including tax and discounts.
 * 
 * @param basePrice - The original price before modifications
 * @param taxRate - Tax rate as a decimal (e.g., 0.08 for 8%)
 * @param discountPercent - Optional discount as a percentage
 * @returns The final price after tax and discount
 * 
 * @example
 * calculateTotal(100, 0.08, 10) // Returns 97.2
 */
export function calculateTotal(
  basePrice: number,
  taxRate: number,
  discountPercent?: number
): number {
  // Implementation
}
```

### React Component Documentation

```typescript
/**
 * Displays a user profile card with avatar and basic information.
 * 
 * @component
 * @example
 * <UserProfile
 *   user={currentUser}
 *   onEdit={handleEdit}
 *   compact
 * />
 */
export function UserProfile({ user, onEdit, compact = false }: UserProfileProps) {
  // Component implementation
}

/**
 * Props for the UserProfile component.
 */
interface UserProfileProps {
  /** User data to display */
  user: User;
  /** Callback fired when edit button is clicked */
  onEdit?: (userId: string) => void;
  /** Whether to show a compact version */
  compact?: boolean;
}
```

### Custom Hooks Documentation

```typescript
/**
 * Manages WebSocket connection state and reconnection logic.
 * 
 * @param url - WebSocket server URL
 * @param options - Connection options
 * @returns Connection state and control methods
 * 
 * @example
 * const { isConnected, send, disconnect } = useWebSocket('ws://localhost:3001', {
 *   reconnectAttempts: 3,
 *   reconnectDelay: 1000
 * });
 */
export function useWebSocket(
  url: string,
  options?: WebSocketOptions
): WebSocketReturn {
  // Hook implementation
}
```

### Type/Interface Documentation

```typescript
/**
 * Configuration for API request retry behavior.
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Delay between retries in milliseconds */
  retryDelay: number;
  /** Whether to use exponential backoff */
  exponentialBackoff?: boolean;
  /** HTTP status codes that should trigger a retry */
  retryableStatuses?: number[];
}
```

### Enum Documentation

```typescript
/**
 * Represents the various states of a data sync operation.
 */
export enum SyncStatus {
  /** No sync in progress */
  Idle = 'IDLE',
  /** Currently syncing data */
  Syncing = 'SYNCING',
  /** Sync completed successfully */
  Success = 'SUCCESS',
  /** Sync failed with errors */
  Failed = 'FAILED'
}
```

## TypeScript Integration

### Leveraging TypeScript Types

- Don't duplicate type information in JSDoc
- Use `@param` names and descriptions only
- Let TypeScript handle type definitions

```typescript
// ❌ Bad - Duplicates TypeScript types
/**
 * @param {string} name - User's name
 * @param {number} age - User's age
 * @returns {boolean}
 */
function validateUser(name: string, age: number): boolean

// ✅ Good - Leverages TypeScript
/**
 * Validates user data meets requirements.
 * 
 * @param name - User's full name
 * @param age - User's age in years
 * @returns True if valid, false otherwise
 */
function validateUser(name: string, age: number): boolean
```

### Generic Type Documentation

```typescript
/**
 * Creates a paginated response wrapper for any data type.
 * 
 * @template T - The type of items in the data array
 * @param data - Array of items to paginate
 * @param page - Current page number (1-indexed)
 * @param pageSize - Number of items per page
 * @returns Paginated response object
 */
export function paginate<T>(
  data: T[],
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  // Implementation
}
```

## Common Patterns

### Async Functions

```typescript
/**
 * Fetches user data from the API with caching.
 * 
 * @param userId - Unique user identifier
 * @throws {ApiError} When the API request fails
 * @throws {NotFoundError} When user doesn't exist
 */
export async function fetchUser(userId: string): Promise<User> {
  // Implementation
}
```

### Event Handlers

```typescript
/**
 * Handles form submission with validation and error handling.
 * Prevents default form submission and shows loading state.
 * 
 * @param event - Form submission event
 */
const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  // Implementation
};
```

### Utility Functions

```typescript
/**
 * Safely parses JSON with fallback value.
 * 
 * @param json - JSON string to parse
 * @param fallback - Value to return if parsing fails
 * @returns Parsed object or fallback value
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  // Implementation
}
```

### Higher-Order Functions

```typescript
/**
 * Creates a debounced version of the provided function.
 * 
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 * 
 * @example
 * const debouncedSearch = debounce(searchUsers, 300);
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  // Implementation
}
```

## Special Tags Reference

### Commonly Used Tags

- `@deprecated` - Mark obsolete code
- `@since` - Version when feature was added
- `@todo` - Implementation notes
- `@throws` - Possible exceptions
- `@see` - Related functions or docs
- `@example` - Usage examples
- `@internal` - Internal implementation detail

### Examples

```typescript
/**
 * @deprecated Use `fetchUserById` instead. Will be removed in v2.0.
 * @see fetchUserById
 */
export function getUser(id: string): User

/**
 * Validates email format.
 * 
 * @since 1.2.0
 * @todo Add support for international domains
 */
export function validateEmail(email: string): boolean

/**
 * @internal
 * Low-level WebSocket frame parser. Not for public use.
 */
function parseWebSocketFrame(buffer: ArrayBuffer): Frame
```

## Best Practices

### Do's

1. **Focus on the "why" not the "what"**
   ```typescript
   // ❌ Bad - States the obvious
   /** Increments the counter by 1 */
   
   // ✅ Good - Explains purpose
   /** Tracks user interactions for analytics */
   ```

2. **Include examples for complex functions**
3. **Document edge cases and assumptions**
4. **Keep descriptions concise but complete**
5. **Use proper grammar and punctuation**

### Don'ts

1. **Don't repeat TypeScript types in JSDoc**
2. **Don't document obvious getters/setters**
3. **Don't use JSDoc for inline implementation comments**
4. **Don't write novels - be concise**
5. **Don't document private implementation details in public APIs**

## IDE Integration

Configure your IDE to:
- Show JSDoc on hover
- Include JSDoc in autocomplete
- Warn on missing documentation
- Format JSDoc comments

### VS Code Settings

```json
{
  "typescript.suggest.completeJSDocs": true,
  "javascript.suggest.completeJSDocs": true
}
```

## Validation

Run documentation linting as part of the build process:

```bash
npm run lint
```

ESLint rules will enforce:
- Required JSDoc for exports
- Proper JSDoc format
- No unused @param tags
- Matching parameter names
# Naming Conventions Guide

## Overview
This document establishes naming conventions for all aspects of the codebase to ensure consistency, readability, and maintainability. Following these conventions helps developers quickly understand code structure and purpose.

## File Naming

### Component Files
```
✅ Correct:
- VesselCard.tsx         // React component
- VesselCard.test.tsx    // Component test
- VesselCard.stories.tsx // Storybook story
- useVesselData.ts       // Custom hook
- vesselUtils.ts         // Utility functions

❌ Incorrect:
- vessel-card.tsx        // Don't use kebab-case
- vesselcard.tsx         // Must use PascalCase
- Vessel_Card.tsx        // Don't use underscores
```

### Directory Structure
```
features/
├── vessels/                    // Feature directories: lowercase
│   ├── components/            // Subdirectories: lowercase
│   │   ├── VesselCard.tsx    // Components: PascalCase
│   │   └── VesselFilters.tsx
│   ├── hooks/                 // Hooks directory
│   │   └── useVessels.ts     // Hook files: camelCase with 'use' prefix
│   ├── pages/                 // Pages directory
│   │   └── VesselList.tsx    // Page components: PascalCase
│   └── types.ts              // Type definitions: lowercase
```

### Non-Component Files
```
✅ Correct:
- constants.ts          // Constants file
- helpers.ts           // Helper functions
- formatters.ts        // Formatting utilities
- validators.ts        // Validation functions
- api.ts              // API utilities
- types.ts            // Type definitions
- index.ts            // Index files always lowercase

❌ Incorrect:
- Constants.ts         // Don't use PascalCase
- CONSTANTS.ts        // Don't use SCREAMING_SNAKE_CASE
- format-helpers.ts   // Don't use kebab-case
```

## Component Naming

### React Components
```typescript
// ✅ Correct: PascalCase for components
export const VesselTrackingCard: React.FC = () => { };
export const ComplianceReportModal: React.FC = () => { };
export const NavigationHeader: React.FC = () => { };

// ❌ Incorrect
export const vessel_tracking_card: React.FC = () => { };  // snake_case
export const vesseltrackingcard: React.FC = () => { };    // no separation
export const vesselTrackingCard: React.FC = () => { };    // starts with lowercase
```

### Component Props Interfaces
```typescript
// ✅ Correct: ComponentNameProps pattern
interface VesselCardProps {
  vessel: Vessel;
  onSelect?: (id: string) => void;
  isLoading?: boolean;
}

interface ComplianceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
}

// ❌ Incorrect
interface VesselCardProperties { }     // Use 'Props' not 'Properties'
interface IVesselCardProps { }         // Don't use 'I' prefix
interface VesselCardPropsInterface { } // Don't add 'Interface' suffix
```

### Event Handler Props
```typescript
// ✅ Correct: on[Event] pattern
interface ButtonProps {
  onClick?: () => void;
  onHover?: () => void;
  onFocus?: () => void;
  onSubmit?: (data: FormData) => void;
  onValueChange?: (value: string) => void;
}

// ❌ Incorrect
interface ButtonProps {
  click?: () => void;         // Missing 'on' prefix
  handleClick?: () => void;   // Don't use 'handle' in props
  clickHandler?: () => void;  // Don't use 'Handler' suffix
}
```

### Component Event Handlers
```typescript
// ✅ Correct: handle[Event] pattern inside components
const VesselCard: React.FC = () => {
  const handleClick = () => { };
  const handleSubmit = (e: FormEvent) => { };
  const handleVesselSelect = (id: string) => { };
  
  return <button onClick={handleClick}>Click</button>;
};

// ❌ Incorrect
const VesselCard: React.FC = () => {
  const onClick = () => { };        // Use 'handle' prefix
  const click = () => { };          // Too generic
  const doClick = () => { };        // Don't use 'do' prefix
  const clickHandler = () => { };   // Redundant 'Handler'
};
```

## Hook Naming

### Custom Hooks
```typescript
// ✅ Correct: use[Feature] pattern
export const useVessels = () => { };
export const useAuth = () => { };
export const useLocalStorage = <T>(key: string) => { };
export const useDebounce = (value: string, delay: number) => { };
export const useVesselTracking = (vesselId: string) => { };

// ❌ Incorrect
export const vesselsHook = () => { };         // Must start with 'use'
export const getVessels = () => { };          // This is not a hook pattern
export const UseVessels = () => { };          // Don't use PascalCase
export const use_vessels = () => { };         // Don't use snake_case
```

### Hook Return Values
```typescript
// ✅ Correct: Descriptive return value names
export const useVessels = () => {
  return {
    vessels,
    isLoading,
    error,
    refetch,
    hasMore
  };
};

export const useToggle = (initial = false) => {
  return [isOn, toggle, setIsOn] as const;
};

// ❌ Incorrect: Ambiguous names
export const useVessels = () => {
  return {
    data,      // Too generic
    loading,   // Should be isLoading
    err,       // Don't abbreviate
    fetch      // Should be refetch
  };
};
```

## Function Naming

### Utility Functions
```typescript
// ✅ Correct: Verb + Noun pattern
export const formatDate = (date: Date): string => { };
export const calculateRiskScore = (vessel: Vessel): number => { };
export const validateEmail = (email: string): boolean => { };
export const parseVesselData = (raw: any): Vessel => { };
export const generateReportId = (): string => { };

// ❌ Incorrect
export const dateFormat = () => { };          // Verb should come first
export const riskScoreCalc = () => { };       // Don't abbreviate
export const EmailValidator = () => { };      // Don't use PascalCase
export const vessel_parser = () => { };       // Don't use snake_case
```

### Predicate Functions
```typescript
// ✅ Correct: is/has/can prefix for booleans
export const isValidEmail = (email: string): boolean => { };
export const hasExpired = (date: Date): boolean => { };
export const canEditVessel = (user: User, vessel: Vessel): boolean => { };
export const isLoadingComplete = (status: Status): boolean => { };
export const hasPermission = (user: User, action: string): boolean => { };

// ❌ Incorrect
export const validEmail = () => { };          // Add 'is' prefix
export const expired = () => { };             // Add 'has' prefix
export const checkValid = () => { };          // Use 'is' instead of 'check'
export const validateEmail = () => { };       // This implies action, not check
```

### Async Functions
```typescript
// ✅ Correct: Clear async indication
export const fetchVessels = async (): Promise<Vessel[]> => { };
export const loadUserData = async (id: string): Promise<User> => { };
export const saveReport = async (report: Report): Promise<void> => { };
export const deleteTracking = async (id: string): Promise<boolean> => { };

// ❌ Incorrect
export const getVessels = () => { };          // Not clear it's async
export const vessels = async () => { };       // Not a verb
export const asyncGetVessels = async () => { }; // Don't prefix with 'async'
```

## Variable Naming

### Boolean Variables
```typescript
// ✅ Correct: is/has/should prefix
const isLoading = true;
const hasError = false;
const shouldRefetch = true;
const canEdit = user.role === 'admin';
const isVesselActive = vessel.status === 'active';

// ❌ Incorrect
const loading = true;         // Add 'is' prefix
const error = false;         // This looks like error object
const refetch = true;        // This looks like a function
const active = true;         // Too ambiguous
```

### Arrays and Collections
```typescript
// ✅ Correct: Plural nouns
const vessels: Vessel[] = [];
const userIds: string[] = [];
const selectedItems: Item[] = [];
const trackingCriteria: Criterion[] = [];

// ❌ Incorrect
const vesselList: Vessel[] = [];      // 'List' is redundant
const vesselArray: Vessel[] = [];     // 'Array' is redundant
const vessel: Vessel[] = [];          // Should be plural
const data: Vessel[] = [];            // Too generic
```

### Constants
```typescript
// ✅ Correct: SCREAMING_SNAKE_CASE for true constants
export const API_BASE_URL = 'https://api.synmax.com';
export const MAX_RETRY_COUNT = 3;
export const DEFAULT_PAGE_SIZE = 20;

// Configuration objects: Use PascalCase
export const VesselConfig = {
  maxSpeed: 35,
  minDraft: 0,
  maxDraft: 25
} as const;

// Enums: Use PascalCase
export enum VesselStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Detained = 'DETAINED'
}

// ❌ Incorrect
export const apiBaseUrl = '';         // Use SCREAMING_SNAKE_CASE
export const API_BASE_URL = '';       // Don't change value
export const VESSEL_CONFIG = {};      // Objects use PascalCase
```

## Type and Interface Naming

### Type Definitions
```typescript
// ✅ Correct: PascalCase, descriptive names
type VesselId = string;
type Coordinates = { lat: number; lng: number };
type RiskLevel = 'low' | 'medium' | 'high';
type ApiResponse<T> = {
  data: T;
  error?: string;
};

// ❌ Incorrect
type vesselId = string;              // Use PascalCase
type TVesselId = string;             // Don't use 'T' prefix
type IVesselId = string;             // Don't use 'I' prefix
type VesselIdType = string;          // Don't add 'Type' suffix
```

### Interface Naming
```typescript
// ✅ Correct: PascalCase, noun-based
interface Vessel {
  id: string;
  name: string;
}

interface ApiError {
  code: string;
  message: string;
}

interface TrackingOptions {
  duration: number;
  criteria: string[];
}

// ❌ Incorrect
interface IVessel { }                // Don't use 'I' prefix
interface VesselInterface { }        // Don't add 'Interface' suffix
interface vessel { }                 // Use PascalCase
interface VesselData { }            // 'Data' is often redundant
```

### Generic Type Parameters
```typescript
// ✅ Correct: Descriptive single letters or short names
function map<T, R>(items: T[], fn: (item: T) => R): R[] { }
function fetchData<TData, TError = Error>(): Promise<TData> { }
type Container<TChild> = {
  children: TChild[];
};

// When single letters are ambiguous, use descriptive names
type ApiResponse<TData, TError = ApiError> = {
  data?: TData;
  error?: TError;
};

// ❌ Incorrect
function map<Type1, Type2>() { }     // Too verbose
function fetch<D, E>() { }           // Too abbreviated
function process<foo, bar>() { }     // Not descriptive
```

## CSS and Styling

### CSS Classes (Tailwind + Custom)
```typescript
// ✅ Correct: kebab-case for custom classes
<div className="vessel-card">
  <div className="vessel-card-header">
    <h3 className="vessel-card-title">Title</h3>
  </div>
</div>

// BEM-style for complex components
<div className="modal">
  <div className="modal__header">
    <button className="modal__close-btn modal__close-btn--large" />
  </div>
</div>

// ❌ Incorrect
<div className="vesselCard">         // Don't use camelCase
<div className="vessel_card">        // Don't use snake_case
<div className="VesselCard">         // Don't use PascalCase
```

### Styled Components / CSS-in-JS
```typescript
// ✅ Correct: PascalCase for styled components
const StyledButton = styled.button``;
const VesselCardWrapper = styled.div``;
const HeaderContainer = styled.header``;

// ❌ Incorrect
const styledButton = styled.button``;      // Use PascalCase
const styled_button = styled.button``;     // Don't use snake_case
const ButtonStyled = styled.button``;      // Prefix with 'Styled'
```

## API and Backend

### API Endpoints
```
✅ Correct: kebab-case, plural resources
GET    /api/v1/vessels
GET    /api/v1/vessels/:id
POST   /api/v1/vessels/:id/tracking-requests
GET    /api/v1/compliance-reports
DELETE /api/v1/user-preferences/:id

❌ Incorrect
GET /api/v1/Vessels              // Don't use PascalCase
GET /api/v1/vessel               // Use plural
GET /api/v1/vessels_list         // Don't use snake_case
GET /api/v1/getVessels          // Don't use verbs in REST
```

### Query Parameters
```
✅ Correct: camelCase for query params
/api/v1/vessels?pageSize=20&sortBy=name&filterBy=active
/api/v1/reports?startDate=2025-01-01&endDate=2025-12-31
/api/v1/vessels?includeDetails=true&maxResults=100

❌ Incorrect
?page_size=20          // Don't use snake_case
?PageSize=20          // Don't use PascalCase
?page-size=20         // Don't use kebab-case
```

## Testing

### Test File Naming
```typescript
// ✅ Correct test descriptions
describe('VesselCard', () => {
  it('should render vessel name', () => { });
  it('should handle click events', () => { });
  it('should display loading state when isLoading is true', () => { });
});

describe('formatDate', () => {
  it('should format date in ISO format', () => { });
  it('should return null for invalid dates', () => { });
});

// ❌ Incorrect
describe('vessel card', () => { });           // Match component name
it('test click', () => { });                 // Be descriptive
it('works', () => { });                      // Too vague
```

### Test Variable Naming
```typescript
// ✅ Correct: Descriptive test data
const mockVessel: Vessel = { };
const expectedResult = 'formatted-date';
const invalidInput = null;
const stubbedResponse = { data: [] };

// ❌ Incorrect
const v = { };                               // Too abbreviated
const data = { };                           // Too generic
const test = { };                           // Meaningless
const x = { };                              // Single letters
```

## Common Patterns

### Action Types (Redux/Zustand)
```typescript
// ✅ Correct: CONSTANT_CASE with namespace
const FETCH_VESSELS_REQUEST = 'vessels/FETCH_REQUEST';
const FETCH_VESSELS_SUCCESS = 'vessels/FETCH_SUCCESS';
const FETCH_VESSELS_FAILURE = 'vessels/FETCH_FAILURE';

// ❌ Incorrect
const fetchVesselsRequest = '';              // Use CONSTANT_CASE
const FETCHVESSELSREQUEST = '';             // Add underscores
const GET_VESSELS = '';                     // Be consistent with naming
```

### Environment Variables
```bash
# ✅ Correct: SCREAMING_SNAKE_CASE with prefix
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=SynMax Intelligence
VITE_ENABLE_ANALYTICS=true
NODE_ENV=development

# ❌ Incorrect
vite_api_url=                               # Use SCREAMING_SNAKE_CASE
ApiUrl=                                     # Use SCREAMING_SNAKE_CASE
API_URL=                                    # Missing VITE_ prefix
```

## Abbreviations and Acronyms

### Common Abbreviations
```typescript
// ✅ Acceptable abbreviations
const id = 'vessel-123';                    // Identifier
const url = 'https://api.synmax.com';      // URL
const api = new ApiClient();                // API
const dto = transformToDto(data);           // DTO
const db = new Database();                  // Database
const ctx = useContext(AppContext);         // Context
const ref = useRef<HTMLDivElement>(null);   // Reference
const nav = useNavigate();                  // Navigate
const img = '/assets/vessel.jpg';           // Image
const btn = <Button />;                     // Button (in JSX)

// ❌ Avoid these abbreviations
const desc = '';                            // Use 'description'
const val = '';                             // Use 'value'
const num = 0;                              // Use 'number' or specific name
const obj = {};                             // Use specific name
const arr = [];                             // Use specific plural
const e = (event) => {};                    // Use 'event' (except in handlers)
const err = new Error();                    // Use 'error'
const msg = '';                             // Use 'message'
```

### Acronyms in Names
```typescript
// ✅ Correct: Treat acronyms as words
const apiUrl = '';
const userId = '';
const htmlContent = '';
const xmlParser = new XmlParser();
const jsonData = {};
const httpClient = new HttpClient();

interface ApiResponse { }
class HtmlParser { }
type JsonValue = any;

// ❌ Incorrect
const APIUrl = '';                          // Don't use all caps
const userID = '';                          // Keep consistent casing
const HTMLContent = '';                     // Treat as one word
interface APIResponse { }                   // Use ApiResponse
```

## Project-Specific Conventions

### Domain-Specific Terms
```typescript
// Maritime domain terms - maintain consistency
const vessel: Vessel = {};                  // Not 'ship' or 'boat'
const imo: string = '';                     // Not 'imoNumber'
const mmsi: string = '';                    // Not 'mmsiNumber'
const portCall: PortCall = {};             // Not 'portVisit'
const darkEvent: DarkEvent = {};           // Not 'aisOff'
const stsTransfer: StsTransfer = {};        // Not 'shipToShip'

// Business terms
const credits: number = 0;                  // Not 'points' or 'tokens'
const subscription: Subscription = {};      // Not 'plan' or 'membership'
const compliance: ComplianceData = {};      // Not 'regulatory'
```

## Best Practices

1. **Be Consistent** - Same concept = same name throughout
2. **Be Descriptive** - Names should explain purpose
3. **Avoid Ambiguity** - Clear is better than clever
4. **Consider Context** - Names should make sense where used
5. **Follow Platform Conventions** - React patterns for React code
6. **Use Team Conventions** - When in doubt, follow existing patterns
7. **Refactor When Needed** - Update names when purpose changes
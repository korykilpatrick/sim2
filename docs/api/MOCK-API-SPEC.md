# Mock API Specification

## Overview
This document defines the structure and conventions for the Express mock API server. The server provides realistic API responses using hardcoded data files, enabling frontend development without backend dependencies.

## Server Configuration

### Basic Setup
```typescript
// server/src/index.ts
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});
```

## API Conventions

### URL Structure
```
/api/{version}/{resource}/{id?}/{action?}

Examples:
/api/v1/vessels
/api/v1/vessels/123
/api/v1/vessels/123/tracking
/api/v1/auth/login
/api/v1/reports/generate
```

### HTTP Methods
- **GET** - Retrieve resources
- **POST** - Create new resources
- **PUT** - Update entire resources
- **PATCH** - Partial updates
- **DELETE** - Remove resources

### Standard Headers
```typescript
// Request headers
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {token}',
  'X-Request-ID': 'uuid-v4'
}

// Response headers
{
  'Content-Type': 'application/json',
  'X-Request-ID': 'uuid-v4',
  'X-Response-Time': '123ms',
  'X-RateLimit-Limit': '100',
  'X-RateLimit-Remaining': '99',
  'X-RateLimit-Reset': '1640995200'
}
```

## Response Formats

### Success Response
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: string;
}

// Example implementation
export const successResponse = <T>(data: T, meta?: any): SuccessResponse<T> => ({
  success: true,
  data,
  meta,
  timestamp: new Date().toISOString()
});
```

### Error Response
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
  };
  timestamp: string;
}

// Error codes
export const ErrorCodes = {
  // Client errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};
```

### Pagination
```typescript
interface PaginatedResponse<T> extends SuccessResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  links?: {
    first: string;
    last: string;
    next?: string;
    prev?: string;
  };
}

// Pagination helper
export const paginate = <T>(
  data: T[],
  page: number = 1,
  limit: number = 20
): PaginatedResponse<T> => {
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = data.slice(start, end);
  const totalPages = Math.ceil(data.length / limit);
  
  return {
    success: true,
    data: paginatedData,
    meta: {
      page,
      limit,
      total: data.length,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    timestamp: new Date().toISOString()
  };
};
```

## Endpoint Specifications

### Authentication Endpoints

```typescript
// POST /api/v1/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// POST /api/v1/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// POST /api/v1/auth/logout
// No request body, uses token from header
```

### Resource Endpoints

```typescript
// GET /api/v1/vessels
interface VesselListParams {
  page?: number;
  limit?: number;
  search?: string;
  flag?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  sortBy?: 'name' | 'imo' | 'lastUpdate' | 'riskScore';
  sortOrder?: 'asc' | 'desc';
}

// GET /api/v1/vessels/:id
interface VesselDetailResponse {
  id: string;
  imo: string;
  name: string;
  flag: string;
  type: string;
  status: 'active' | 'inactive' | 'detained';
  lastPosition: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  riskAssessment: {
    score: number;
    level: 'low' | 'medium' | 'high';
    factors: Array<{
      type: string;
      severity: string;
      description: string;
    }>;
  };
}

// POST /api/v1/vessels/:id/tracking
interface CreateTrackingRequest {
  duration: number; // days
  criteria: string[];
  notifications: {
    email: boolean;
    sms: boolean;
    webhook?: string;
  };
}
```

## Query Parameters

### Filtering
```typescript
// Standard filter format
// GET /api/v1/resources?filter[field]=value

// Example: Filter vessels by multiple criteria
// GET /api/v1/vessels?filter[flag]=US&filter[riskLevel]=high

export const parseFilters = (query: any): Record<string, any> => {
  const filters: Record<string, any> = {};
  
  Object.keys(query).forEach(key => {
    const match = key.match(/filter\[(\w+)\]/);
    if (match) {
      filters[match[1]] = query[key];
    }
  });
  
  return filters;
};
```

### Sorting
```typescript
// Sort format: sort=field:order
// GET /api/v1/vessels?sort=name:asc
// Multiple sorts: sort=name:asc,riskScore:desc

export const parseSorting = (sortParam?: string): Array<[string, 'asc' | 'desc']> => {
  if (!sortParam) return [];
  
  return sortParam.split(',').map(sort => {
    const [field, order = 'asc'] = sort.split(':');
    return [field, order as 'asc' | 'desc'];
  });
};
```

### Field Selection
```typescript
// Sparse fieldsets
// GET /api/v1/vessels?fields=id,name,imo,flag

export const parseFields = (fieldsParam?: string): string[] => {
  return fieldsParam ? fieldsParam.split(',') : [];
};
```

## Middleware

### Authentication Middleware
```typescript
// middleware/auth.ts
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json(
      errorResponse('UNAUTHORIZED', 'Access token required')
    );
  }
  
  // Mock token validation
  if (token === 'invalid_token') {
    return res.status(401).json(
      errorResponse('UNAUTHORIZED', 'Invalid token')
    );
  }
  
  // Add user to request
  req.user = {
    id: '123',
    email: 'user@example.com',
    role: 'user'
  };
  
  next();
};
```

### Request Validation
```typescript
// middleware/validate.ts
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array()
      },
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};
```

### Rate Limiting
```typescript
// middleware/rateLimiter.ts
const requestCounts = new Map<string, number[]>();

export const rateLimiter = (
  windowMs: number = 60000, // 1 minute
  max: number = 100
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get or create request timestamps
    const timestamps = requestCounts.get(key) || [];
    const recentRequests = timestamps.filter(t => t > windowStart);
    
    if (recentRequests.length >= max) {
      return res.status(429).json(
        errorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests')
      );
    }
    
    recentRequests.push(now);
    requestCounts.set(key, recentRequests);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max.toString());
    res.setHeader('X-RateLimit-Remaining', (max - recentRequests.length).toString());
    res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
    
    next();
  };
};
```

## Mock Delays

### Realistic Response Times
```typescript
// utils/delay.ts
export const mockDelay = async (min: number = 100, max: number = 500) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Usage in routes
router.get('/vessels', async (req, res) => {
  await mockDelay(200, 600); // Simulate network latency
  
  const vessels = getVessels();
  res.json(successResponse(vessels));
});
```

## Route Implementation Example

```typescript
// routes/vessels.ts
import { Router } from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { getVessels, getVesselById, createTracking } from '../controllers/vessels';

const router = Router();

// List vessels
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, ...filters } = req.query;
    const result = await getVessels({
      page: Number(page),
      limit: Number(limit),
      filters
    });
    res.json(result);
  } catch (error) {
    res.status(500).json(errorResponse('INTERNAL_ERROR', error.message));
  }
});

// Get vessel details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const vessel = await getVesselById(req.params.id);
    if (!vessel) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Vessel not found')
      );
    }
    res.json(successResponse(vessel));
  } catch (error) {
    res.status(500).json(errorResponse('INTERNAL_ERROR', error.message));
  }
});

// Create tracking
router.post(
  '/:id/tracking',
  authenticateToken,
  [
    body('duration').isInt({ min: 1, max: 365 }),
    body('criteria').isArray().notEmpty(),
    body('notifications.email').isBoolean()
  ],
  validate,
  async (req, res) => {
    try {
      const tracking = await createTracking(req.params.id, req.body);
      res.status(201).json(successResponse(tracking));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', error.message));
    }
  }
);

export default router;
```

## WebSocket Support

```typescript
// WebSocket for real-time updates
import { Server } from 'socket.io';

export const setupWebSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true
    }
  });
  
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join vessel tracking room
    socket.on('track-vessel', (vesselId: string) => {
      socket.join(`vessel-${vesselId}`);
      
      // Send initial position
      socket.emit('vessel-update', {
        vesselId,
        position: generateMockPosition(),
        timestamp: new Date().toISOString()
      });
    });
    
    // Leave tracking
    socket.on('untrack-vessel', (vesselId: string) => {
      socket.leave(`vessel-${vesselId}`);
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  
  // Simulate position updates
  setInterval(() => {
    io.sockets.adapter.rooms.forEach((_, room) => {
      if (room.startsWith('vessel-')) {
        const vesselId = room.replace('vessel-', '');
        io.to(room).emit('vessel-update', {
          vesselId,
          position: generateMockPosition(),
          timestamp: new Date().toISOString()
        });
      }
    });
  }, 30000); // Every 30 seconds
};
```

## Testing the Mock API

```typescript
// Example requests for testing

// 1. Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

// 2. Get vessels with pagination
curl http://localhost:3001/api/v1/vessels?page=1&limit=10 \
  -H "Authorization: Bearer mock_token"

// 3. Filter vessels
curl http://localhost:3001/api/v1/vessels?filter[flag]=US&filter[riskLevel]=high \
  -H "Authorization: Bearer mock_token"

// 4. Create tracking
curl -X POST http://localhost:3001/api/v1/vessels/123/tracking \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock_token" \
  -d '{"duration":30,"criteria":["AIS","DARK","STS"],"notifications":{"email":true}}'
```
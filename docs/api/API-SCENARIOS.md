# API Scenarios Guide

## Overview
This document defines different API response scenarios including success states, error conditions, edge cases, and loading behaviors. These scenarios ensure the frontend can handle all possible API states gracefully.

## Success Scenarios

### Standard Success Response
```typescript
// Route: GET /api/v1/vessels/:id
export const vesselDetailSuccess = (req: Request, res: Response) => {
  const vessel = dataStore.find('vessels', v => v.id === req.params.id);
  
  if (vessel) {
    res.json({
      success: true,
      data: vessel,
      timestamp: new Date().toISOString()
    });
  }
};
```

### Empty Success Response
```typescript
// Route: GET /api/v1/vessels (with filters that match no results)
export const emptyListSuccess = (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [],
    meta: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    },
    timestamp: new Date().toISOString()
  });
};
```

### Partial Success Response
```typescript
// Route: POST /api/v1/vessels/bulk-tracking
export const partialSuccess = (req: Request, res: Response) => {
  const { vesselIds } = req.body;
  const results = vesselIds.map(id => {
    const vessel = dataStore.find('vessels', v => v.id === id);
    
    if (!vessel) {
      return {
        vesselId: id,
        success: false,
        error: 'Vessel not found'
      };
    }
    
    // Simulate some failures
    if (Math.random() > 0.8) {
      return {
        vesselId: id,
        success: false,
        error: 'Insufficient credits'
      };
    }
    
    return {
      vesselId: id,
      success: true,
      trackingId: `trk_${Date.now()}_${id}`
    };
  });
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  res.status(207).json({ // 207 Multi-Status
    success: true,
    data: {
      results,
      summary: {
        total: vesselIds.length,
        successful,
        failed
      }
    },
    timestamp: new Date().toISOString()
  });
};
```

## Error Scenarios

### Client Error Scenarios

```typescript
// 400 Bad Request - Validation Error
export const validationError = (req: Request, res: Response) => {
  res.status(400).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: [
        {
          field: 'duration',
          message: 'Duration must be between 1 and 365 days',
          value: req.body.duration
        },
        {
          field: 'criteria',
          message: 'At least one tracking criterion must be selected',
          value: req.body.criteria
        }
      ]
    },
    timestamp: new Date().toISOString()
  });
};

// 401 Unauthorized - Invalid Token
export const unauthorizedError = (req: Request, res: Response) => {
  res.status(401).json({
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired authentication token'
    },
    timestamp: new Date().toISOString()
  });
};

// 403 Forbidden - Insufficient Permissions
export const forbiddenError = (req: Request, res: Response) => {
  res.status(403).json({
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'You do not have permission to access this resource',
      details: {
        resource: 'compliance_reports',
        requiredRole: 'premium',
        userRole: 'basic'
      }
    },
    timestamp: new Date().toISOString()
  });
};

// 404 Not Found
export const notFoundError = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Vessel with ID ${req.params.id} not found`
    },
    timestamp: new Date().toISOString()
  });
};

// 409 Conflict - Duplicate Resource
export const conflictError = (req: Request, res: Response) => {
  res.status(409).json({
    success: false,
    error: {
      code: 'CONFLICT',
      message: 'A tracking for this vessel already exists',
      details: {
        existingTrackingId: 'trk_existing_123',
        vesselId: req.body.vesselId
      }
    },
    timestamp: new Date().toISOString()
  });
};

// 429 Too Many Requests
export const rateLimitError = (req: Request, res: Response) => {
  res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      details: {
        limit: 100,
        window: '1 hour',
        retryAfter: 3600
      }
    },
    timestamp: new Date().toISOString()
  });
};
```

### Server Error Scenarios

```typescript
// 500 Internal Server Error
export const internalServerError = (req: Request, res: Response) => {
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
      requestId: req.headers['x-request-id'] || 'unknown'
    },
    timestamp: new Date().toISOString()
  });
};

// 502 Bad Gateway - External Service Error
export const badGatewayError = (req: Request, res: Response) => {
  res.status(502).json({
    success: false,
    error: {
      code: 'BAD_GATEWAY',
      message: 'Unable to connect to satellite data provider',
      details: {
        service: 'satellite_imagery',
        retryable: true
      }
    },
    timestamp: new Date().toISOString()
  });
};

// 503 Service Unavailable
export const serviceUnavailable = (req: Request, res: Response) => {
  res.status(503).json({
    success: false,
    error: {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Service temporarily unavailable for maintenance',
      details: {
        maintenanceWindow: {
          start: '2025-05-22T22:00:00Z',
          end: '2025-05-23T02:00:00Z'
        }
      }
    },
    timestamp: new Date().toISOString()
  });
};
```

## Loading & Timeout Scenarios

### Slow Response Simulation
```typescript
// Simulate slow network conditions
export const slowResponse = async (req: Request, res: Response) => {
  // Simulate variable network latency
  const delay = Math.random() * 3000 + 2000; // 2-5 seconds
  
  await new Promise(resolve => setTimeout(resolve, delay));
  
  const vessels = dataStore.paginate('vessels', 1, 20);
  res.json({
    success: true,
    data: vessels.data,
    meta: {
      responseTime: `${delay}ms`,
      ...vessels
    },
    timestamp: new Date().toISOString()
  });
};

// Timeout simulation
export const timeoutResponse = async (req: Request, res: Response) => {
  // Don't respond at all - let client timeout
  // This helps test client-side timeout handling
};
```

### Progressive Data Loading
```typescript
// Route: GET /api/v1/vessels/:id/track (Server-Sent Events)
export const streamVesselTrack = (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  const vesselId = req.params.id;
  let eventCount = 0;
  
  // Send initial position
  res.write(`data: ${JSON.stringify({
    event: 'position',
    data: {
      lat: 1.2897,
      lng: 103.8501,
      timestamp: new Date().toISOString()
    }
  })}\n\n`);
  
  // Send positions every 5 seconds
  const interval = setInterval(() => {
    eventCount++;
    
    if (eventCount > 10) {
      res.write('event: complete\ndata: {"message": "Track complete"}\n\n');
      clearInterval(interval);
      res.end();
      return;
    }
    
    res.write(`data: ${JSON.stringify({
      event: 'position',
      data: generateNewPosition()
    })}\n\n`);
  }, 5000);
  
  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
};
```

## Edge Cases

### Pagination Edge Cases
```typescript
// Beyond last page
export const beyondLastPage = (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  
  res.json({
    success: true,
    data: [],
    meta: {
      page: page, // Return requested page even if beyond range
      limit: limit,
      total: 50,
      totalPages: 3,
      hasNext: false,
      hasPrev: true
    },
    message: 'Page number exceeds total pages',
    timestamp: new Date().toISOString()
  });
};

// Invalid pagination parameters
export const invalidPagination = (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string);
  const limit = parseInt(req.query.limit as string);
  
  if (isNaN(page) || page < 1) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_PARAMETER',
        message: 'Page must be a positive integer',
        field: 'page',
        value: req.query.page
      }
    });
  }
  
  if (isNaN(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_PARAMETER',
        message: 'Limit must be between 1 and 100',
        field: 'limit',
        value: req.query.limit
      }
    });
  }
};
```

### Data Inconsistencies
```typescript
// Partial data / Missing fields
export const partialData = (req: Request, res: Response) => {
  const vessel = {
    id: req.params.id,
    imo: '9234567',
    name: 'PACIFIC VOYAGER',
    // Missing some expected fields
    flag: null,
    lastPosition: null,
    riskAssessment: {
      score: null,
      level: 'unknown',
      lastUpdated: null,
      message: 'Risk assessment temporarily unavailable'
    }
  };
  
  res.json({
    success: true,
    data: vessel,
    warnings: [
      'Some vessel data is temporarily unavailable',
      'Position data is being updated'
    ],
    timestamp: new Date().toISOString()
  });
};

// Stale data warning
export const staleData = (req: Request, res: Response) => {
  const vessel = dataStore.find('vessels', v => v.id === req.params.id);
  const lastUpdate = new Date(vessel.lastPosition.timestamp);
  const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
  
  res.json({
    success: true,
    data: vessel,
    warnings: hoursSinceUpdate > 24 ? [
      `Position data is ${Math.round(hoursSinceUpdate)} hours old`
    ] : [],
    meta: {
      dataFreshness: {
        lastUpdate: lastUpdate.toISOString(),
        isStale: hoursSinceUpdate > 24,
        hoursSinceUpdate: Math.round(hoursSinceUpdate)
      }
    },
    timestamp: new Date().toISOString()
  });
};
```

## Business Logic Scenarios

### Credit System
```typescript
// Insufficient credits
export const insufficientCredits = (req: Request, res: Response) => {
  const user = req.user;
  const requiredCredits = 100;
  const availableCredits = 45;
  
  res.status(402).json({ // 402 Payment Required
    success: false,
    error: {
      code: 'INSUFFICIENT_CREDITS',
      message: 'Not enough credits to perform this action',
      details: {
        required: requiredCredits,
        available: availableCredits,
        shortfall: requiredCredits - availableCredits,
        actions: [
          {
            type: 'purchase',
            label: 'Purchase Credits',
            url: '/credits/purchase'
          },
          {
            type: 'upgrade',
            label: 'Upgrade Plan',
            url: '/subscription/upgrade'
          }
        ]
      }
    },
    timestamp: new Date().toISOString()
  });
};

// Credit deduction
export const creditDeduction = (req: Request, res: Response) => {
  const creditCost = 50;
  const previousBalance = 1000;
  const newBalance = previousBalance - creditCost;
  
  res.json({
    success: true,
    data: {
      trackingId: 'trk_new_123',
      vessel: req.body.vessel
    },
    meta: {
      credits: {
        cost: creditCost,
        previousBalance,
        newBalance,
        transaction: {
          id: 'txn_123',
          type: 'debit',
          amount: creditCost,
          description: 'Vessel tracking - 30 days',
          timestamp: new Date().toISOString()
        }
      }
    },
    timestamp: new Date().toISOString()
  });
};
```

### Subscription Limits
```typescript
// Feature not available in plan
export const featureNotAvailable = (req: Request, res: Response) => {
  res.status(403).json({
    success: false,
    error: {
      code: 'FEATURE_NOT_AVAILABLE',
      message: 'This feature is not available in your current plan',
      details: {
        feature: 'advanced_risk_assessment',
        currentPlan: 'basic',
        requiredPlans: ['professional', 'enterprise'],
        upgradeUrl: '/subscription/compare'
      }
    },
    timestamp: new Date().toISOString()
  });
};

// Usage limit exceeded
export const usageLimitExceeded = (req: Request, res: Response) => {
  res.status(429).json({
    success: false,
    error: {
      code: 'USAGE_LIMIT_EXCEEDED',
      message: 'Monthly API call limit exceeded',
      details: {
        limit: 10000,
        used: 10000,
        resetDate: '2025-06-01T00:00:00Z',
        upgradeOptions: [
          {
            plan: 'professional',
            limit: 50000,
            price: '$299/month'
          },
          {
            plan: 'enterprise',
            limit: 'unlimited',
            price: 'Contact sales'
          }
        ]
      }
    },
    timestamp: new Date().toISOString()
  });
};
```

## Testing Scenarios

### Chaos Engineering
```typescript
// Random failures for testing resilience
export const chaosMode = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers['x-chaos-mode'] === 'true') {
    const scenarios = [
      () => res.status(500).json({ error: 'Random server error' }),
      () => res.status(503).json({ error: 'Service unavailable' }),
      () => setTimeout(() => next(), 5000), // Slow response
      () => res.connection.destroy(), // Connection drop
      () => next() // Success
    ];
    
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    return randomScenario();
  }
  
  next();
};
```

### Debug Mode
```typescript
// Extra debug information in responses
export const debugMode = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers['x-debug-mode'] === 'true') {
    const originalJson = res.json.bind(res);
    
    res.json = function(data: any) {
      const debugData = {
        ...data,
        _debug: {
          request: {
            method: req.method,
            path: req.path,
            query: req.query,
            body: req.body,
            headers: req.headers
          },
          response: {
            statusCode: res.statusCode,
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - req.startTime
          },
          server: {
            environment: process.env.NODE_ENV,
            version: process.env.API_VERSION
          }
        }
      };
      
      return originalJson(debugData);
    };
  }
  
  next();
};
```

## WebSocket Scenarios

### Connection Scenarios
```typescript
// WebSocket connection handling
export const websocketScenarios = (io: Server) => {
  io.on('connection', (socket) => {
    // Successful connection
    socket.emit('connected', {
      socketId: socket.id,
      serverTime: new Date().toISOString()
    });
    
    // Authentication required
    socket.on('authenticate', (token) => {
      if (!token || token === 'invalid') {
        socket.emit('error', {
          code: 'AUTH_REQUIRED',
          message: 'Valid authentication token required'
        });
        socket.disconnect();
        return;
      }
      
      socket.emit('authenticated', { userId: 'user_123' });
    });
    
    // Simulate connection issues
    if (Math.random() > 0.9) {
      setTimeout(() => {
        socket.emit('error', {
          code: 'CONNECTION_LOST',
          message: 'Connection interrupted',
          reconnect: true
        });
        socket.disconnect();
      }, 30000);
    }
  });
};
```

## Response Headers

### Security Headers
```typescript
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
};
```

### CORS Scenarios
```typescript
// Different CORS configurations
export const corsScenarios = {
  // Open CORS for development
  development: {
    origin: true,
    credentials: true
  },
  
  // Restricted CORS for production
  production: {
    origin: ['https://app.synmax.com', 'https://synmax.com'],
    credentials: true,
    optionsSuccessStatus: 200
  },
  
  // CORS error simulation
  error: (req: Request, res: Response) => {
    res.status(403).json({
      error: 'CORS policy violation',
      message: 'Origin not allowed',
      origin: req.headers.origin
    });
  }
};
```

## Best Practices

### Scenario Implementation
1. Always include timestamps
2. Use consistent error codes
3. Provide actionable error messages
4. Include request IDs for debugging
5. Simulate realistic delays

### Testing Coverage
1. Test all HTTP status codes
2. Include edge cases
3. Test timeout scenarios
4. Verify error recovery
5. Test concurrent requests

### Documentation
1. Document all error codes
2. Provide example responses
3. List all possible scenarios
4. Include recovery strategies
5. Note rate limits and quotas
# Data Fixtures Guide

## Overview
This document defines how to organize and structure mock data for the Express backend. The fixture system provides realistic, consistent data that mirrors production scenarios while remaining easy to modify and extend.

## Directory Structure

```
server/src/data/
├── fixtures/               # Static mock data
│   ├── users.json         # User accounts
│   ├── vessels.json       # Vessel database
│   ├── ports.json         # Port information
│   ├── tracking.json      # Active trackings
│   ├── reports.json       # Generated reports
│   └── compliance.json    # Compliance data
│
├── generators/            # Dynamic data generators
│   ├── userGenerator.ts
│   ├── vesselGenerator.ts
│   ├── positionGenerator.ts
│   └── eventGenerator.ts
│
├── seeds/                 # Database seeders
│   ├── index.ts
│   └── relationships.ts
│
└── index.ts              # Main data access layer
```

## Fixture File Formats

### Users Fixture
```json
// fixtures/users.json
{
  "users": [
    {
      "id": "usr_001",
      "email": "admin@synmax.com",
      "password": "$2b$10$XQq2o2l6XPH6Ei4TKSvxNO", // bcrypt hash of "password123"
      "name": "Admin User",
      "role": "admin",
      "company": "SynMax Intelligence",
      "department": "Operations",
      "phone": "+1-555-0100",
      "avatar": "/avatars/admin.jpg",
      "preferences": {
        "theme": "light",
        "notifications": {
          "email": true,
          "sms": false,
          "push": true
        },
        "defaultView": "dashboard"
      },
      "subscription": {
        "plan": "enterprise",
        "credits": 10000,
        "creditsUsed": 2456,
        "renewalDate": "2025-12-31"
      },
      "createdAt": "2024-01-15T08:00:00Z",
      "lastLogin": "2025-05-20T14:30:00Z",
      "isActive": true
    },
    {
      "id": "usr_002",
      "email": "trader@maritime.com",
      "password": "$2b$10$XQq2o2l6XPH6Ei4TKSvxNO",
      "name": "John Trader",
      "role": "user",
      "company": "Maritime Trading Co",
      "department": "Commodities",
      "subscription": {
        "plan": "professional",
        "credits": 5000,
        "creditsUsed": 1234
      }
    }
  ]
}
```

### Vessels Fixture
```json
// fixtures/vessels.json
{
  "vessels": [
    {
      "id": "vsl_001",
      "imo": "9234567",
      "mmsi": "235678901",
      "name": "PACIFIC VOYAGER",
      "callSign": "VQBC5",
      "flag": "SG",
      "flagName": "Singapore",
      "type": "Bulk Carrier",
      "subType": "General Cargo",
      "built": 2015,
      "deadweight": 82000,
      "grossTonnage": 44000,
      "length": 229,
      "beam": 32.3,
      "draft": 14.5,
      "owner": {
        "name": "Pacific Shipping Ltd",
        "country": "SG",
        "sanctioned": false
      },
      "operator": {
        "name": "Global Marine Operations",
        "country": "GR"
      },
      "insurer": {
        "name": "Lloyd's of London",
        "policyNumber": "MAR-2024-98765"
      },
      "lastPosition": {
        "lat": 1.2897,
        "lng": 103.8501,
        "timestamp": "2025-05-22T10:30:00Z",
        "speed": 12.5,
        "course": 045,
        "heading": 047,
        "navStatus": "Under way using engine",
        "source": "AIS"
      },
      "currentVoyage": {
        "origin": "Singapore",
        "destination": "Rotterdam",
        "eta": "2025-06-15T14:00:00Z",
        "cargo": "Iron Ore",
        "cargoWeight": 75000
      },
      "riskAssessment": {
        "score": 25,
        "level": "low",
        "lastUpdated": "2025-05-22T00:00:00Z",
        "factors": [
          {
            "type": "flag_state",
            "score": 5,
            "description": "Low-risk flag state"
          },
          {
            "type": "age",
            "score": 10,
            "description": "Vessel age within acceptable range"
          },
          {
            "type": "inspection",
            "score": 10,
            "description": "Recent PSC inspection passed"
          }
        ]
      },
      "inspections": [
        {
          "date": "2025-03-15",
          "port": "Singapore",
          "type": "PSC",
          "result": "No deficiencies",
          "inspector": "MPA Singapore"
        }
      ],
      "events": [
        {
          "id": "evt_001",
          "type": "port_call",
          "timestamp": "2025-05-20T06:00:00Z",
          "location": "Singapore",
          "details": {
            "port": "SGSIN",
            "terminal": "Jurong Port",
            "berth": "J14"
          }
        }
      ],
      "images": [
        {
          "url": "/vessels/vsl_001_main.jpg",
          "type": "main",
          "source": "MarineTraffic",
          "capturedAt": "2025-04-10T12:00:00Z"
        }
      ]
    }
  ]
}
```

### Tracking Fixture
```json
// fixtures/tracking.json
{
  "trackings": [
    {
      "id": "trk_001",
      "userId": "usr_002",
      "vesselId": "vsl_001",
      "vesselName": "PACIFIC VOYAGER",
      "vesselImo": "9234567",
      "status": "active",
      "startDate": "2025-05-01T00:00:00Z",
      "endDate": "2025-05-31T23:59:59Z",
      "duration": 30,
      "criteria": [
        {
          "type": "AIS_REPORTING",
          "enabled": true,
          "interval": 6,
          "description": "AIS position updates every 6 hours"
        },
        {
          "type": "DARK_EVENT",
          "enabled": true,
          "threshold": 12,
          "description": "Alert when AIS signal lost for >12 hours"
        },
        {
          "type": "PORT_CALL",
          "enabled": true,
          "ports": ["SGSIN", "NLRTM", "USNYC"],
          "description": "Alert on arrival/departure from specified ports"
        }
      ],
      "notifications": {
        "email": true,
        "sms": false,
        "webhook": null,
        "recipients": ["trader@maritime.com"]
      },
      "alerts": [
        {
          "id": "alt_001",
          "timestamp": "2025-05-20T06:00:00Z",
          "type": "PORT_CALL",
          "severity": "info",
          "title": "Vessel arrived at Singapore",
          "description": "PACIFIC VOYAGER arrived at Singapore (SGSIN)",
          "acknowledged": true,
          "acknowledgedAt": "2025-05-20T08:15:00Z"
        }
      ],
      "usage": {
        "creditsCharged": 50,
        "alertsSent": 5,
        "lastAlertAt": "2025-05-20T06:00:00Z"
      }
    }
  ]
}
```

### Reports Fixture
```json
// fixtures/reports.json
{
  "reports": [
    {
      "id": "rpt_001",
      "userId": "usr_002",
      "type": "compliance",
      "subType": "sanctions_screening",
      "status": "completed",
      "vesselId": "vsl_001",
      "vesselName": "PACIFIC VOYAGER",
      "requestedAt": "2025-05-21T10:00:00Z",
      "completedAt": "2025-05-21T10:02:00Z",
      "expiresAt": "2025-06-21T10:02:00Z",
      "creditsCost": 100,
      "summary": {
        "riskLevel": "low",
        "sanctionsHits": 0,
        "flagChanges": 0,
        "ownershipChanges": 0,
        "complianceScore": 95
      },
      "sections": [
        {
          "title": "Sanctions Screening",
          "status": "clear",
          "details": "No matches found against OFAC, EU, UN sanctions lists"
        },
        {
          "title": "Ownership Structure",
          "status": "verified",
          "details": "Beneficial ownership traced to Pacific Shipping Ltd (Singapore)"
        }
      ],
      "downloadUrl": "/api/v1/reports/rpt_001/download",
      "format": "pdf",
      "fileSize": 245600
    }
  ]
}
```

## Data Generators

### Position Generator
```typescript
// generators/positionGenerator.ts
interface Position {
  lat: number;
  lng: number;
  timestamp: string;
  speed: number;
  course: number;
  heading: number;
}

export class PositionGenerator {
  private lastPosition: Position;
  
  constructor(initialPosition: Position) {
    this.lastPosition = initialPosition;
  }
  
  generateNext(intervalMinutes: number = 30): Position {
    // Calculate distance traveled
    const speedKnots = this.lastPosition.speed;
    const distanceNm = (speedKnots * intervalMinutes) / 60;
    
    // Convert to degrees (rough approximation)
    const latChange = (distanceNm / 60) * Math.cos(this.lastPosition.course * Math.PI / 180);
    const lngChange = (distanceNm / 60) * Math.sin(this.lastPosition.course * Math.PI / 180);
    
    // Add some randomness
    const speedVariation = (Math.random() - 0.5) * 2; // +/- 1 knot
    const courseVariation = (Math.random() - 0.5) * 10; // +/- 5 degrees
    
    const newPosition: Position = {
      lat: this.lastPosition.lat + latChange + (Math.random() - 0.5) * 0.01,
      lng: this.lastPosition.lng + lngChange + (Math.random() - 0.5) * 0.01,
      timestamp: new Date(Date.now() + intervalMinutes * 60000).toISOString(),
      speed: Math.max(0, this.lastPosition.speed + speedVariation),
      course: (this.lastPosition.course + courseVariation + 360) % 360,
      heading: (this.lastPosition.course + courseVariation + (Math.random() - 0.5) * 5 + 360) % 360
    };
    
    this.lastPosition = newPosition;
    return newPosition;
  }
  
  generateTrack(hours: number, intervalMinutes: number = 30): Position[] {
    const positions: Position[] = [];
    const iterations = (hours * 60) / intervalMinutes;
    
    for (let i = 0; i < iterations; i++) {
      positions.push(this.generateNext(intervalMinutes));
    }
    
    return positions;
  }
}
```

### Event Generator
```typescript
// generators/eventGenerator.ts
type EventType = 'PORT_CALL' | 'DARK_EVENT' | 'STS_TRANSFER' | 'SPEED_CHANGE' | 'COURSE_CHANGE';

interface VesselEvent {
  id: string;
  vesselId: string;
  type: EventType;
  timestamp: string;
  location?: { lat: number; lng: number };
  details: Record<string, any>;
  severity: 'info' | 'warning' | 'critical';
}

export class EventGenerator {
  private eventCounter = 0;
  
  generatePortCall(vesselId: string, port: any): VesselEvent {
    return {
      id: `evt_${++this.eventCounter}`,
      vesselId,
      type: 'PORT_CALL',
      timestamp: new Date().toISOString(),
      location: { lat: port.lat, lng: port.lng },
      details: {
        port: port.code,
        portName: port.name,
        action: Math.random() > 0.5 ? 'arrival' : 'departure'
      },
      severity: 'info'
    };
  }
  
  generateDarkEvent(vesselId: string, duration: number): VesselEvent {
    return {
      id: `evt_${++this.eventCounter}`,
      vesselId,
      type: 'DARK_EVENT',
      timestamp: new Date().toISOString(),
      details: {
        duration,
        lastKnownPosition: this.generateRandomPosition(),
        reason: this.selectRandom([
          'AIS switched off',
          'Technical malfunction',
          'Poor satellite coverage',
          'Unknown'
        ])
      },
      severity: duration > 24 ? 'critical' : 'warning'
    };
  }
  
  generateStsTransfer(vesselId: string, otherVesselId: string): VesselEvent {
    return {
      id: `evt_${++this.eventCounter}`,
      vesselId,
      type: 'STS_TRANSFER',
      timestamp: new Date().toISOString(),
      location: this.generateRandomPosition(),
      details: {
        otherVesselId,
        duration: Math.floor(Math.random() * 8 + 2), // 2-10 hours
        cargo: this.selectRandom(['Crude Oil', 'Refined Products', 'LNG', 'Unknown'])
      },
      severity: 'warning'
    };
  }
  
  private generateRandomPosition() {
    return {
      lat: Math.random() * 180 - 90,
      lng: Math.random() * 360 - 180
    };
  }
  
  private selectRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}
```

## Data Access Layer

### Main Data Module
```typescript
// data/index.ts
import * as fs from 'fs';
import * as path from 'path';

class DataStore {
  private cache: Map<string, any> = new Map();
  private dataPath = path.join(__dirname, 'fixtures');
  
  constructor() {
    this.loadFixtures();
  }
  
  private loadFixtures() {
    const files = fs.readdirSync(this.dataPath);
    
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const name = file.replace('.json', '');
        const data = JSON.parse(
          fs.readFileSync(path.join(this.dataPath, file), 'utf-8')
        );
        this.cache.set(name, data);
      }
    });
  }
  
  get<T>(collection: string): T | undefined {
    return this.cache.get(collection);
  }
  
  find<T>(collection: string, predicate: (item: T) => boolean): T | undefined {
    const data = this.get<{ [key: string]: T[] }>(collection);
    if (!data) return undefined;
    
    const items = Object.values(data).flat() as T[];
    return items.find(predicate);
  }
  
  filter<T>(collection: string, predicate: (item: T) => boolean): T[] {
    const data = this.get<{ [key: string]: T[] }>(collection);
    if (!data) return [];
    
    const items = Object.values(data).flat() as T[];
    return items.filter(predicate);
  }
  
  paginate<T>(
    collection: string,
    page: number = 1,
    limit: number = 20,
    filters?: Record<string, any>
  ): { data: T[]; total: number; page: number; totalPages: number } {
    let items = this.filter<T>(collection, () => true);
    
    // Apply filters
    if (filters) {
      items = items.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          return (item as any)[key] === value;
        });
      });
    }
    
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = items.slice(start, start + limit);
    
    return { data, total, page, totalPages };
  }
  
  // Simulate database operations
  async create<T>(collection: string, item: T): Promise<T> {
    // In real implementation, this would persist to database
    const data = this.get<{ [key: string]: T[] }>(collection) || {};
    const key = Object.keys(data)[0] || collection;
    
    if (!data[key]) data[key] = [];
    data[key].push(item);
    
    this.cache.set(collection, data);
    return item;
  }
  
  async update<T>(
    collection: string,
    id: string,
    updates: Partial<T>
  ): Promise<T | null> {
    const item = this.find<T & { id: string }>(collection, item => item.id === id);
    if (!item) return null;
    
    Object.assign(item, updates);
    return item as T;
  }
  
  async delete(collection: string, id: string): Promise<boolean> {
    const data = this.get<{ [key: string]: any[] }>(collection);
    if (!data) return false;
    
    const key = Object.keys(data)[0];
    const index = data[key].findIndex(item => item.id === id);
    
    if (index !== -1) {
      data[key].splice(index, 1);
      return true;
    }
    
    return false;
  }
}

export const dataStore = new DataStore();
```

### Relationship Management
```typescript
// data/relationships.ts
export class RelationshipManager {
  static async getVesselWithDetails(vesselId: string) {
    const vessel = dataStore.find('vessels', v => v.id === vesselId);
    if (!vessel) return null;
    
    // Load related data
    const trackings = dataStore.filter('trackings', t => t.vesselId === vesselId);
    const events = dataStore.filter('events', e => e.vesselId === vesselId);
    const reports = dataStore.filter('reports', r => r.vesselId === vesselId);
    
    return {
      ...vessel,
      activeTrackings: trackings.filter(t => t.status === 'active'),
      recentEvents: events.slice(-10),
      availableReports: reports
    };
  }
  
  static async getUserWithSubscription(userId: string) {
    const user = dataStore.find('users', u => u.id === userId);
    if (!user) return null;
    
    const trackings = dataStore.filter('trackings', t => t.userId === userId);
    const reports = dataStore.filter('reports', r => r.userId === userId);
    
    return {
      ...user,
      activeTrackings: trackings.filter(t => t.status === 'active').length,
      reportsGenerated: reports.length,
      creditsRemaining: user.subscription.credits - user.subscription.creditsUsed
    };
  }
}
```

## Seeding Data

### Seed Script
```typescript
// seeds/index.ts
import { faker } from '@faker-js/faker';
import { VesselGenerator } from '../generators/vesselGenerator';

export async function seedDatabase() {
  console.log('🌱 Seeding database...');
  
  // Generate additional vessels
  const vesselGen = new VesselGenerator();
  const vessels = Array.from({ length: 100 }, () => vesselGen.generate());
  
  // Generate users
  const users = Array.from({ length: 20 }, () => ({
    id: `usr_${faker.string.uuid()}`,
    email: faker.internet.email(),
    name: faker.person.fullName(),
    company: faker.company.name(),
    role: faker.helpers.arrayElement(['user', 'admin', 'viewer']),
    subscription: {
      plan: faker.helpers.arrayElement(['free', 'basic', 'professional', 'enterprise']),
      credits: faker.number.int({ min: 0, max: 10000 }),
      creditsUsed: faker.number.int({ min: 0, max: 5000 })
    }
  }));
  
  // Create relationships
  const trackings = [];
  for (let i = 0; i < 50; i++) {
    const user = faker.helpers.arrayElement(users);
    const vessel = faker.helpers.arrayElement(vessels);
    
    trackings.push({
      id: `trk_${faker.string.uuid()}`,
      userId: user.id,
      vesselId: vessel.id,
      vesselName: vessel.name,
      vesselImo: vessel.imo,
      status: faker.helpers.arrayElement(['active', 'expired', 'cancelled']),
      startDate: faker.date.recent({ days: 30 }),
      duration: faker.helpers.arrayElement([7, 14, 30, 60, 90])
    });
  }
  
  console.log('✅ Seeding complete');
  console.log(`   - ${vessels.length} vessels`);
  console.log(`   - ${users.length} users`);
  console.log(`   - ${trackings.length} trackings`);
}

// Run seeder if called directly
if (require.main === module) {
  seedDatabase().catch(console.error);
}
```

## Mock Data Patterns

### Realistic Data Constraints
```typescript
// Ensure data consistency
export const dataConstraints = {
  vessel: {
    imo: /^\d{7}$/,
    mmsi: /^\d{9}$/,
    name: { minLength: 3, maxLength: 50 },
    flag: /^[A-Z]{2}$/,
    built: { min: 1970, max: new Date().getFullYear() }
  },
  
  position: {
    lat: { min: -90, max: 90 },
    lng: { min: -180, max: 180 },
    speed: { min: 0, max: 35 }, // knots
    course: { min: 0, max: 359 },
    heading: { min: 0, max: 359 }
  },
  
  tracking: {
    duration: { min: 1, max: 365 }, // days
    criteria: ['AIS_REPORTING', 'DARK_EVENT', 'PORT_CALL', 'STS_TRANSFER']
  }
};
```

### Time-Based Data
```typescript
// Generate time-series data
export function generateTimeSeriesData(
  startDate: Date,
  endDate: Date,
  interval: number, // minutes
  generator: () => any
): any[] {
  const data = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    data.push({
      timestamp: current.toISOString(),
      ...generator()
    });
    current.setMinutes(current.getMinutes() + interval);
  }
  
  return data;
}
```

## Best Practices

### Data Organization
1. Use consistent ID formats (prefix_uuid)
2. Include timestamps on all records
3. Use ISO 8601 for all dates
4. Maintain referential integrity
5. Include realistic variations

### Performance
1. Lazy load large datasets
2. Implement pagination
3. Cache frequently accessed data
4. Use indexes for lookups
5. Limit response sizes

### Realism
1. Use real-world constraints
2. Include edge cases
3. Add data anomalies
4. Vary response times
5. Include partial data scenarios
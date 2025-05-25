export const mockUsers = [
  {
    id: '1',
    email: 'demo@synmax.com',
    password: 'demo123', // In real app, this would be hashed
    name: 'Demo User',
    company: 'SynMax Demo',
    role: 'user' as const,
    credits: 1000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const mockVessels = [
  {
    id: 'v1',
    imo: '9181786',
    mmsi: '311021300',
    name: 'OCEAN TRADER',
    flag: 'Panama',
    type: 'Cargo',
    status: 'active' as const,
    lastPosition: {
      lat: 1.2655,
      lng: 103.8201,
      timestamp: new Date().toISOString(),
      speed: 12.5,
      course: 245,
    },
    riskLevel: 'low' as const,
    owner: 'Pacific Shipping Co',
    destination: 'Singapore',
    eta: new Date(Date.now() + 86400000).toISOString(),
    draught: 12.5,
    length: 289,
    width: 45,
  },
  {
    id: 'v2',
    imo: '9434140',
    mmsi: '477995600',
    name: 'BALTIC EXPLORER',
    flag: 'Hong Kong',
    type: 'Tanker',
    status: 'active' as const,
    lastPosition: {
      lat: 22.3193,
      lng: 114.1694,
      timestamp: new Date().toISOString(),
      speed: 0,
      course: 0,
    },
    riskLevel: 'medium' as const,
    owner: 'Baltic Tankers Ltd',
    destination: 'Hong Kong',
    eta: new Date().toISOString(),
    draught: 14.2,
    length: 332,
    width: 58,
  },
  {
    id: 'v3',
    imo: '9587135',
    mmsi: '636092837',
    name: 'SHADOW RUNNER',
    flag: 'Liberia',
    type: 'Cargo',
    status: 'dark' as const,
    lastPosition: {
      lat: 25.7617,
      lng: -80.1918,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      speed: 15.2,
      course: 180,
    },
    riskLevel: 'high' as const,
    owner: 'Unknown',
    destination: 'Unknown',
    draught: 11.0,
    length: 225,
    width: 32,
  },
]

export const mockTrackingCriteria = [
  {
    id: 'ais_reporting',
    type: 'ais_reporting' as const,
    name: 'AIS Reporting',
    description: 'Updated location information on 3-6-12-24hr intervals',
    enabled: true,
  },
  {
    id: 'dark_event',
    type: 'dark_event' as const,
    name: 'Dark Event Detection',
    description: 'Detection of AIS signal loss (start and end of dark period)',
    enabled: true,
  },
  {
    id: 'spoofing',
    type: 'spoofing' as const,
    name: 'Spoofing Detection',
    description: 'Identify vessels falsifying locations or GPS manipulation',
    enabled: true,
  },
  {
    id: 'sts_event',
    type: 'sts_event' as const,
    name: 'STS Event',
    description: 'Monitor mid-sea cargo exchanges (ship-to-ship transfers)',
    enabled: true,
  },
  {
    id: 'port_call',
    type: 'port_call' as const,
    name: 'Port of Call',
    description: 'Detect vessels arriving or departing from key ports',
    enabled: true,
  },
  {
    id: 'distress',
    type: 'distress' as const,
    name: 'Vessel in Distress',
    description: 'Alert when vessel broadcasts distress signal',
    enabled: true,
  },
  {
    id: 'ownership_change',
    type: 'ownership_change' as const,
    name: 'Ownership Change',
    description: 'Notify when vessel ownership is transferred',
    enabled: true,
  },
  {
    id: 'flag_change',
    type: 'flag_change' as const,
    name: 'Flag/MMSI Change',
    description: 'Identify sudden flag or MMSI changes',
    enabled: true,
  },
  {
    id: 'geofence',
    type: 'geofence' as const,
    name: 'Geofencing Alerts',
    description: 'User-defined area of interest alerts',
    enabled: true,
  },
  {
    id: 'risk_change',
    type: 'risk_change' as const,
    name: 'Risk Assessment Change',
    description: 'Changes to automated risk assessment',
    enabled: true,
  },
  {
    id: 'high_risk_area',
    type: 'high_risk_area' as const,
    name: 'High Risk Area',
    description: 'Vessel enters designated high-risk zones',
    enabled: true,
  },
]

export const mockCreditPackages = [
  {
    id: 'pkg1',
    name: 'Starter Pack',
    credits: 100,
    price: 99,
    savings: 0,
  },
  {
    id: 'pkg2',
    name: 'Professional',
    credits: 500,
    price: 449,
    savings: 10,
  },
  {
    id: 'pkg3',
    name: 'Business',
    credits: 1000,
    price: 849,
    savings: 15,
  },
  {
    id: 'pkg4',
    name: 'Enterprise',
    credits: 5000,
    price: 3999,
    savings: 20,
  },
]

export const mockFleets = [
  {
    id: 'fleet1',
    name: 'Pacific Trading Fleet',
    description: 'Main cargo vessels operating in Pacific routes',
    type: 'cargo',
    vesselCount: 2,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fleet2',
    name: 'High Risk Monitoring',
    description: 'Vessels flagged for compliance monitoring',
    type: 'monitoring',
    vesselCount: 1,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fleet3',
    name: 'Tanker Operations',
    description: 'Oil and chemical tankers',
    type: 'tanker',
    vesselCount: 1,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const mockFleetVessels = [
  {
    fleetId: 'fleet1',
    vesselImo: '9181786', // OCEAN TRADER
    addedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    addedBy: 'demo@synmax.com',
  },
  {
    fleetId: 'fleet1',
    vesselImo: '9587135', // SHADOW RUNNER
    addedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    addedBy: 'demo@synmax.com',
  },
  {
    fleetId: 'fleet2',
    vesselImo: '9587135', // SHADOW RUNNER (also in high risk monitoring)
    addedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    addedBy: 'demo@synmax.com',
  },
  {
    fleetId: 'fleet3',
    vesselImo: '9434140', // BALTIC EXPLORER
    addedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    addedBy: 'demo@synmax.com',
  },
]

// Combined export for routes that expect mockData object
export const mockData = {
  users: mockUsers,
  vessels: mockVessels,
  trackingCriteria: mockTrackingCriteria,
  creditPackages: mockCreditPackages,
  fleets: mockFleets,
  fleetVessels: mockFleetVessels,
}

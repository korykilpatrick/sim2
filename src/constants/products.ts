import { Product } from '@/types/product';

export const PRODUCTS: Record<string, Product> = {
  'vessel-tracking': {
    id: 'vessel-tracking',
    name: 'Vessel Tracking Service',
    shortName: 'VTS',
    category: 'tracking',
    pricing: {
      monthly: null,
      annual: null,
      enterprise: 'Per-vessel, duration, and criteria-based pricing. Bulk discounts and tiered packages (Platinum, Gold, Silver, Bronze) available.',
    },
    descriptions: {
      brief: 'Flexible, customized vessel tracking solution by IMO number.',
      standard: 'Track vessels based on criteria like AIS reporting, dark events, spoofing, STS events, port calls, distress signals, ownership/flag changes, AOI/geofencing, and risk alerts.',
      detailed: "Leveraging Theia's existing capabilities, SIM's Vessel Tracking Service (VTS) offers a flexible, customized solution to monitor vessels by IMO number. Users can track based on various criteria, with alerts delivered to their SIMw account and email. This service ensures reliable tracking even amid flag or MMSI changes, providing precise and adaptable monitoring tailored to specific needs.",
      features: [
        'AIS reporting (3-6-12-24hr intervals)',
        'Dark Event detection (AIS signal loss)',
        'Spoofing/GPS Manipulation identification',
        'STS event monitoring',
        'Port of Call (PoC) detection',
        'Vessel in Distress alerts',
        'Ownership Change tracking',
        'Flag / MMSI Change identification',
        'User-defined Vessel AOI/Geofencing alerts',
        'Risk Assessment Change alerts',
        'High Risk Area alerts',
      ],
    },
    images: {
      thumbnail: '/images/products/sim-vts-thumb.png',
      hero: '/images/products/sim-vts-hero.png',
    },
    specifications: {
      TrackingBasis: 'IMO number',
      AlertDelivery: 'SIMw account, Email',
      UIType: 'No GUI',
    },
    requirements: [
      'User account on SynMax Intelligence Marketplace (SIM)',
      'Vessel IMO number(s) for tracking',
      'Defined tracking criteria and duration',
    ],
    path: '/products/sim/vessel-tracking',
  },
  'area-monitoring': {
    id: 'area-monitoring',
    name: 'Area Monitoring Service',
    shortName: 'AMS',
    category: 'monitoring',
    pricing: {
      monthly: null,
      annual: null,
      enterprise: 'Tiered pricing based on AOI size, update frequency, criteria count, and duration. Bulk discounts and subscription packages (Platinum, Gold, Silver, Bronze) available.',
    },
    descriptions: {
      brief: 'Flexible, customizable ocean area monitoring solution with real-time alerts.',
      standard: 'Monitor custom Areas of Interest (AOI) with alerts for vessel entry/exit, AIS reporting, dark ship events, spoofing, STS transfers, port activity, distress signals, ownership/registration changes, risk updates, and area risk assessment.',
      detailed: "The Area Monitoring Service (AMS) provides a flexible, customizable solution to track specific ocean regions (AOIs) with real-time alerts. Tailored for maritime security, regulatory enforcement, risk assessment, and commercial intelligence, users define AOIs and receive notifications for key maritime events. Alerts are delivered to the user's SIM account and email, with a basic GUI for visual representation of the AOI, AIS data, and alerts.",
      features: [
        'Vessel Entry & Exit alerts for AOI',
        'AIS Reporting (3, 6, 12, or 24-hour intervals)',
        'Dark Ship Event detection',
        'Spoofing & GPS Manipulation identification',
        'STS (Ship-to-Ship) Transfer monitoring',
        'Port of Call (PoC) Activity detection',
        'Vessel in Distress alerts within AOI',
        'Ownership & Registration Change identification',
        'Risk Assessment Update alerts',
        'Area risk assessment (environmental factors, dark vessels, weather)',
      ],
    },
    images: {
      thumbnail: '/images/products/sim-ams-thumb.png',
      hero: '/images/products/sim-ams-hero.png',
    },
    specifications: {
      UIType: 'Basic GUI for AOI visualization',
      AlertDelivery: 'SIM account, Email',
    },
    requirements: [
      'User account on SynMax Intelligence Marketplace (SIM)',
      'Defined Area of Interest (AOI)',
      'Selected monitoring criteria and update frequency',
    ],
    path: '/products/sim/area-monitoring',
  },
  'fleet-tracking': {
    id: 'fleet-tracking',
    name: 'Fleet Tracking Service',
    shortName: 'FTS',
    category: 'tracking',
    pricing: {
      monthly: null,
      annual: null,
      enterprise: 'Per-vessel pricing based on fleet size (min 10 vessels), criteria, and duration (min 12-month contract). Bulk discounts and tiered packages available.',
    },
    descriptions: {
      brief: 'Customized fleet monitoring solution with a centralized dashboard and tailored alerts.',
      standard: 'Monitor entire fleets with criteria like AIS reporting, dark ship events, spoofing, STS events, port calls, distress signals, ownership/registration changes, vessel-specific geofencing, and risk assessment changes.',
      detailed: "The Fleet Tracking Service (FTS) offers a customized solution for fleet operators to monitor multiple vessels (minimum 10) via a centralized dashboard/GUI. It provides tailored alerts and real-time insights across the entire fleet, ensuring efficient management and comprehensive visibility. Designed for large commercial clients like P&I clubs, FTS automates fleet oversight and risk detection, requiring a minimum 12-month contract.",
      features: [
        'AIS Reporting for all fleet vessels (3, 6, 12, or 24-hour intervals)',
        'Dark Ship Event detection for fleet vessels',
        'Spoofing Event detection',
        'STS (Ship-to-Ship) Event monitoring',
        'Port of Call (PoC) tracking for all vessels',
        'Vessel in Distress alerts within the fleet',
        'Ownership & Registration Change monitoring',
        'Customized Geofencing Alerts per vessel',
        'Risk Assessment Change alerts for fleet vessels',
      ],
    },
    images: {
      thumbnail: '/images/products/sim-fts-thumb.png',
      hero: '/images/products/sim-fts-hero.png',
    },
    specifications: {
      UIType: 'Centralized dashboard / GUI',
      MinimumFleetSize: '10 vessels',
      MinimumContract: '12 months',
      AlertDelivery: 'SIM account, Email',
    },
    requirements: [
      'User account on SynMax Intelligence Marketplace (SIM)',
      'List of vessels in the fleet (min 10)',
      '12-month minimum contract commitment',
    ],
    path: '/products/sim/fleet-tracking',
  },
  'vessel-compliance-report': {
    id: 'vessel-compliance-report',
    name: 'Vessel Compliance Report',
    shortName: 'VCR',
    category: 'reporting',
    pricing: {
      monthly: null,
      annual: null,
      enterprise: 'Available via individual purchase, monthly/annual subscription plans, and fleet discounts.',
    },
    descriptions: {
      brief: "On-demand assessment of a vessel's compliance status.",
      standard: 'Detailed report covering sanctions screening (OFAC, EU, UN), regulatory compliance (IMO, SOLAS, MARPOL), AIS integrity, ownership/control, operational history, PSC inspections, and a quantified risk score.',
      detailed: "Vessel Compliance Reports (VCR) from SIM offer a detailed, on-demand assessment of a vessel's compliance status, ensuring regulatory adherence and risk mitigation. Ideal for insurers, financial institutions, legal firms, and compliance teams, these reports provide instant access to critical insights without lengthy sales cycles. Reports are instantly available on the SIM platform upon purchase.",
      features: [
        'Sanctions Screening (OFAC, EU, UN, etc.)',
        'Regulatory Compliance (IMO, SOLAS, MARPOL)',
        'AIS Integrity & Spoofing Detection',
        'Ownership & Beneficial Control identification',
        'Operational History analysis (dark voyages, STS)',
        'Port State Control (PSC) Inspection review',
        'Quantified Risk Assessment Score',
      ],
    },
    images: {
      thumbnail: '/images/products/sim-vcr-thumb.png',
      hero: '/images/products/sim-vcr-hero.png',
    },
    specifications: {
      Delivery: 'Instant download via SIM platform',
      Format: 'Report',
    },
    requirements: [
      'User account on SynMax Intelligence Marketplace (SIM)',
      'Vessel identifier (e.g., IMO number)',
    ],
    path: '/products/sim/vessel-compliance-report',
  },
  'vessel-chronology-report': {
    id: 'vessel-chronology-report',
    name: 'Vessel Chronology Report',
    shortName: 'VChR',
    category: 'reporting',
    pricing: {
      monthly: null,
      annual: null,
      enterprise: 'Pricing based on report depth (Basic, Standard, Premium) and selected time period. Fleet discounts available.',
    },
    descriptions: {
      brief: "Comprehensive timeline of a vessel's activities over a selected period.",
      standard: 'Customizable chronology report covering ports of call, STS transfers, bunkering, dark voyages, spoofing, risk profile changes, and ownership/registration changes within a defined timeframe.',
      detailed: "The Vessel Chronology Report (VChR) delivers a comprehensive, timestamped timeline of a vessel's activities over a user-selected period. It includes details on ports of call, STS transfers, bunkering activity, dark voyages, spoofing/GPS anomalies, risk profile changes, and ownership/registration updates. Essential for due diligence and historical analysis, reports are instantly available via SIM.",
      features: [
        'Ports of Call (PoC) log',
        'Ship-to-Ship (STS) Transfer identification',
        'Bunkering Activity tracking',
        'Dark Voyage highlighting',
        'Spoofing & GPS Anomaly detection',
        'Risk Profile Change identification',
        'Ownership & Registration Change flagging',
      ],
    },
    images: {
      thumbnail: '/images/products/sim-vchr-thumb.png',
      hero: '/images/products/sim-vchr-hero.png',
    },
    specifications: {
      Delivery: 'Instant download via SIM platform',
      Customization: 'Report depth, time period',
      Format: 'Report',
    },
    requirements: [
      'User account on SynMax Intelligence Marketplace (SIM)',
      'Vessel identifier (e.g., IMO number)',
      'Defined time period for the report',
    ],
    path: '/products/sim/vessel-chronology-report',
  },
  'maritime-investigation': {
    id: 'maritime-investigation',
    name: 'Maritime Investigations Service',
    shortName: 'MIS',
    category: 'investigation',
    pricing: {
      monthly: null,
      annual: null,
      enterprise: 'Custom pricing based on scope, complexity, timeframe, and data/imagery needs. Discounted contract pricing available.',
    },
    descriptions: {
      brief: 'Comprehensive, intelligence-driven deep-dive analysis by SynMax experts.',
      standard: 'In-depth investigations into vessel activity, maritime areas of interest (AOI), or high-risk events, utilizing satellite imagery, OSINT, SIGINT, webcams/sensors, HUMINT, and proprietary analytical tools.',
      detailed: "SynMax's Maritime Investigations Service (MIS) offers unparalleled deep-dive analysis conducted by intelligence experts. It covers vessel activity, maritime AOIs, and high-risk events, leveraging a fusion of intelligence sources (SATINT, OSINT, SIGINT, HUMINT, etc.). Investigations are custom-tailored, initiated via an RFI form on SIM, with final reports delivered securely.",
      features: [
        'Vessel Activity Analysis (historical/real-time, compliance, risk)',
        'Maritime Area of Interest (AOI) Intelligence Gathering',
        'High-Risk Event Investigation (dark voyages, STS, sanctions)',
        'Multi-Source Intelligence Fusion (SATINT, OSINT, SIGINT, HUMINT)',
        'Expert-led analysis by SynMax intelligence professionals',
        'Custom-tailored investigation scope',
        'Secure report delivery',
      ],
    },
    images: {
      thumbnail: '/images/products/sim-mis-thumb.png',
      hero: '/images/products/sim-mis-hero.png',
    },
    specifications: {
      ServiceType: 'Expert-led investigation',
      Initiation: 'Request for Intelligence (RFI) via SIM',
      Sources: 'SATINT, OSINT, SIGINT, Webcams, HUMINT, Proprietary Tools',
    },
    requirements: [
      'Request for Intelligence (RFI) submitted via SIM',
      'Consultation with SynMax intelligence team to define scope',
    ],
    path: '/products/sim/maritime-investigation',
  },
};

export const PRODUCT_LIST = Object.values(PRODUCTS);

export const getProductById = (id: string): Product | undefined => PRODUCTS[id];

export const getProductsByCategory = (category: Product['category']): Product[] =>
  PRODUCT_LIST.filter(product => product.category === category);

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return PRODUCT_LIST.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.descriptions.standard.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery)
  );
};
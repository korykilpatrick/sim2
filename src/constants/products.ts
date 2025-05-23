import { Product } from '@/types/product';

export const PRODUCTS: Record<string, Product> = {
  vts: {
    id: 'vts',
    name: 'Voice Trading System',
    shortName: 'VTS',
    category: 'trading',
    pricing: {
      monthly: 2999,
      annual: 29990,
      enterprise: 'custom',
    },
    descriptions: {
      brief: 'AI-powered voice trading platform for institutional traders',
      standard: 'Revolutionary voice-to-trade execution system that understands natural language commands. Execute complex trades hands-free with institutional-grade reliability and sub-second latency.',
      detailed: 'The Voice Trading System (VTS) represents the next evolution in trading technology. Using advanced natural language processing and speech recognition, VTS allows traders to execute complex multi-leg orders through voice commands alone. Built for institutional trading floors, it integrates seamlessly with existing OMS/EMS systems while providing hands-free operation during fast-moving markets. With support for over 40 asset classes and natural language in 12 languages, VTS reduces trade entry time by 70% while maintaining 99.99% accuracy.',
      features: [
        'Natural language trade execution',
        'Multi-asset class support (Equities, FX, Fixed Income, Derivatives)',
        'Sub-100ms voice-to-execution latency',
        'Integration with 50+ OMS/EMS platforms',
        'Real-time voice alerts and confirmations',
        'Compliance recording and audit trail',
        'Custom voice commands and macros',
        'Multi-language support (12 languages)',
      ],
    },
    images: {
      thumbnail: '/images/products/vts-thumb.jpg',
      hero: '/images/products/vts-hero.jpg',
    },
    specifications: {
      latency: '<100ms',
      accuracy: '99.99%',
      languages: 12,
      assetClasses: 40,
      uptime: '99.95%',
    },
    requirements: [
      'Minimum 10Gbps network connection',
      'Dedicated server or cloud instance',
      'Compatible OMS/EMS system',
    ],
    path: '/products/vts',
  },
  ams: {
    id: 'ams',
    name: 'Alpha Mining Suite',
    shortName: 'AMS',
    category: 'analytics',
    pricing: {
      monthly: 4999,
      annual: 49990,
      enterprise: 'custom',
    },
    descriptions: {
      brief: 'ML-driven alpha generation and signal discovery platform',
      standard: 'Discover hidden trading opportunities with our advanced machine learning platform. Alpha Mining Suite automatically identifies profitable patterns across global markets using proprietary algorithms.',
      detailed: 'Alpha Mining Suite (AMS) is a comprehensive signal generation platform that leverages cutting-edge machine learning to identify alpha opportunities across global markets. Our proprietary algorithms analyze millions of data points per second, from traditional market data to alternative datasets including satellite imagery, social sentiment, and IoT sensors. AMS doesn\'t just find signals – it validates them through rigorous backtesting, provides risk-adjusted performance metrics, and offers real-time signal strength indicators. With automated signal discovery, portfolio integration, and performance attribution, AMS is the choice of leading hedge funds and proprietary trading firms worldwide.',
      features: [
        'Automated signal discovery across 10,000+ instruments',
        'Alternative data integration (satellite, social, IoT)',
        'Real-time backtesting engine',
        'Risk-adjusted signal scoring',
        'Portfolio integration and optimization',
        'Custom factor development framework',
        'Signal decay and correlation analysis',
        'White-box ML model explanations',
      ],
    },
    images: {
      thumbnail: '/images/products/ams-thumb.jpg',
      hero: '/images/products/ams-hero.jpg',
    },
    specifications: {
      dataSources: '500+',
      instrumentsCovered: 10000,
      signalsGenerated: '1M+ daily',
      backtestingSpeed: '10 years/second',
      falsePositiveRate: '<5%',
    },
    requirements: [
      'GPU-enabled infrastructure',
      'Minimum 1TB RAM for full dataset',
      'Market data feed subscriptions',
    ],
    path: '/products/ams',
  },
  fts: {
    id: 'fts',
    name: 'Fractional Trading Service',
    shortName: 'FTS',
    category: 'trading',
    pricing: {
      monthly: 1999,
      annual: 19990,
    },
    descriptions: {
      brief: 'Enable fractional share trading across all asset classes',
      standard: 'Democratize investing with fractional trading capabilities. FTS enables your platform to offer fractional shares, bonds, and even derivatives to retail and institutional clients.',
      detailed: 'The Fractional Trading Service (FTS) breaks down barriers to investment by enabling fractional ownership across traditionally indivisible assets. Built on a sophisticated netting and aggregation engine, FTS allows brokers and wealth platforms to offer fractional shares, bonds, ETFs, and even certain derivatives to their clients. Our real-time position management system handles the complexity of fractional orders, corporate actions, and dividend distributions while maintaining perfect reconciliation. With support for over 15,000 instruments globally and seamless integration with existing systems, FTS opens new revenue streams while improving client accessibility to premium assets.',
      features: [
        'Real-time fractional order matching',
        'Automated corporate action handling',
        'Dividend and interest distribution',
        'Multi-currency support',
        'Tax lot optimization',
        'Regulatory reporting compliance',
        'White-label API and widgets',
        'Real-time P&L and position tracking',
      ],
    },
    images: {
      thumbnail: '/images/products/fts-thumb.jpg',
      hero: '/images/products/fts-hero.jpg',
    },
    specifications: {
      instrumentSupport: 15000,
      minimumFraction: 0.00001,
      settlementTime: 'T+0',
      orderTypes: 15,
      apiLatency: '<50ms',
    },
    requirements: [
      'REST API or FIX connectivity',
      'Regulatory approvals for fractional trading',
      'Client money segregation setup',
    ],
    path: '/products/fts',
  },
  reports: {
    id: 'reports',
    name: 'Regulatory Reporting Hub',
    shortName: 'RRH',
    category: 'reporting',
    pricing: {
      monthly: 3499,
      annual: 34990,
      enterprise: 'custom',
    },
    descriptions: {
      brief: 'Automated compliance reporting for global regulations',
      standard: 'Stay compliant with automated regulatory reporting across multiple jurisdictions. Our platform handles MiFID II, EMIR, Dodd-Frank, and 50+ other regulatory frameworks.',
      detailed: 'The Regulatory Reporting Hub (RRH) is your single solution for global compliance reporting. As regulations become increasingly complex and penalties more severe, RRH automates the entire reporting workflow from data collection to submission. Our platform maintains real-time updates for over 50 regulatory frameworks including MiFID II, EMIR, Dodd-Frank, MAR, and SFTR. With built-in data validation, pre-submission checks, and automatic error correction, RRH reduces reporting errors by 95% while cutting compliance costs by 60%. The platform includes audit trails, regulatory change management, and direct connectivity to all major regulatory bodies.',
      features: [
        'Support for 50+ global regulations',
        'Automated data collection and validation',
        'Real-time regulatory updates',
        'Pre-submission compliance checks',
        'Direct regulatory body connectivity',
        'Audit trail and attestation',
        'Exception management workflow',
        'Regulatory change impact analysis',
      ],
    },
    images: {
      thumbnail: '/images/products/rrh-thumb.jpg',
      hero: '/images/products/rrh-hero.jpg',
    },
    specifications: {
      regulationsSupported: 50,
      errorReduction: '95%',
      submissionSuccess: '99.8%',
      dataValidationRules: 10000,
      updateFrequency: 'Real-time',
    },
    requirements: [
      'Access to trade and position data',
      'Legal entity identifiers (LEIs)',
      'Regulatory body registration',
    ],
    path: '/products/reports',
  },
  mis: {
    id: 'mis',
    name: 'Market Infrastructure Service',
    shortName: 'MIS',
    category: 'infrastructure',
    pricing: {
      monthly: 7999,
      annual: 79990,
      enterprise: 'custom',
    },
    descriptions: {
      brief: 'Ultra-low latency market connectivity and smart order routing',
      standard: 'Connect to 200+ global markets with ultra-low latency infrastructure. Our smart order routing ensures best execution while our colocation services put you microseconds from major exchanges.',
      detailed: 'Market Infrastructure Service (MIS) provides institutional-grade market connectivity and execution infrastructure. With presence in all major financial centers and direct connections to 200+ venues globally, MIS offers the lowest latency paths to liquidity. Our smart order routing algorithms continuously optimize for best execution across lit and dark pools, while our advanced anti-gaming logic protects against predatory HFT strategies. The platform includes full tick capture, replay capabilities, and real-time TCA. Whether you need colocation services, sponsored access, or cloud-based connectivity, MIS delivers the infrastructure that powers the world\'s most sophisticated trading operations.',
      features: [
        'Direct connectivity to 200+ venues',
        'Sub-microsecond latency in colocation',
        'Smart order routing with anti-gaming',
        'Full market data capture and replay',
        'Real-time TCA and execution analytics',
        'Sponsored and naked access options',
        'Cloud and on-premise deployment',
        ' 24/7 monitoring and support',
      ],
    },
    images: {
      thumbnail: '/images/products/mis-thumb.jpg',
      hero: '/images/products/mis-hero.jpg',
    },
    specifications: {
      venues: 200,
      latency: '<1μs in colo',
      uptime: '99.999%',
      orderCapacity: '1M/second',
      datacenters: 35,
    },
    requirements: [
      'Venue membership or sponsored access',
      'Risk management systems',
      'Network capacity planning',
    ],
    path: '/products/mis',
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
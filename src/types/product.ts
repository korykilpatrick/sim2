export interface Product {
  id: string;
  name: string;
  shortName?: string;
  category: 'trading' | 'analytics' | 'reporting' | 'infrastructure';
  pricing: {
    monthly: number;
    annual: number;
    enterprise?: 'custom';
  };
  descriptions: {
    brief: string; // One-liner for lists
    standard: string; // 2-3 sentences for cards
    detailed: string; // Full description for product pages
    features?: string[]; // Bullet points for detailed views
  };
  images: {
    thumbnail?: string;
    hero?: string;
    screenshots?: string[];
  };
  specifications?: {
    [key: string]: string | number | boolean;
  };
  requirements?: string[];
  integrations?: string[];
  path: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  billingCycle: 'monthly' | 'annual';
  addedAt: Date;
}

export interface ProductFilters {
  category?: Product['category'];
  priceRange?: {
    min: number;
    max: number;
  };
  search?: string;
}
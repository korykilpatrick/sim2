export interface Product {
  id: string;
  name: string;
  shortName?: string;
  category: 'tracking' | 'monitoring' | 'reporting' | 'investigation';
  pricing: {
    monthly: number | null;
    annual: number | null;
    enterprise?: string;
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
  };
  specifications?: {
    [key: string]: string | number | boolean;
  };
  requirements?: string[];
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
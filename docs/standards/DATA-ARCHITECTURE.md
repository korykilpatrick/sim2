# Data Architecture Standards

## Overview

This document outlines the data architecture standards for the SIM project, emphasizing modularity, single source of truth, and maintainability.

## Core Principles

### 1. Single Source of Truth (SSOT)

**Never duplicate data definitions.** All data should have one authoritative source that other parts of the application reference.

```typescript
// ❌ BAD: Data duplicated across components
// HomePage.tsx
const products = [
  { id: 'vts', name: 'Voice Trading System', price: 2999 }
]

// ProductDetail.tsx
const productDetails = {
  vts: { name: 'Voice Trading System', price: 2999, description: '...' }
}

// ✅ GOOD: Centralized data source
// constants/products.ts
export const PRODUCTS: Record<string, Product> = {
  vts: { id: 'vts', name: 'Voice Trading System', ... }
}

// Components import from single source
import { PRODUCTS } from '@/constants/products'
```

### 2. Data Versioning

Support different versions of data for different contexts while maintaining a single source.

```typescript
interface Product {
  descriptions: {
    brief: string;      // One-liner for lists
    standard: string;   // 2-3 sentences for cards
    detailed: string;   // Full description for detail pages
    features?: string[]; // Bullet points
  };
}
```

### 3. Type Safety

Always define TypeScript interfaces for your data structures.

```typescript
// types/product.ts
export interface Product {
  id: string;
  name: string;
  pricing: {
    monthly: number;
    annual: number;
  };
  // ... other fields
}
```

## Implementation Patterns

### Constants Pattern

For static data that doesn't change frequently:

```typescript
// constants/products.ts
export const PRODUCTS: Record<string, Product> = {
  // Product definitions
};

// Helper functions for common queries
export const getProductById = (id: string) => PRODUCTS[id];
export const getProductsByCategory = (category: string) => 
  Object.values(PRODUCTS).filter(p => p.category === category);
```

### Service Pattern

For data fetched from APIs:

```typescript
// services/products.ts
class ProductService {
  async getProducts(): Promise<Product[]> {
    const { data } = await axios.get<ProductsResponse>('/api/products');
    return data.data;
  }
  
  async getProductById(id: string): Promise<Product> {
    const { data } = await axios.get<ProductResponse>(`/api/products/${id}`);
    return data.data;
  }
}

export const productService = new ProductService();
```

### State Management Pattern

For client-side state that needs to be shared:

```typescript
// stores/cartStore.ts
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product: Product) => {
        // Implementation
      },
      // Other methods
    }),
    { name: 'cart-storage' }
  )
);
```

## Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Constants     │────▶│    Services     │────▶│     Stores      │
│  (Static Data)  │     │   (API Layer)   │     │ (Client State)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                        │
         └───────────────────────┴────────────────────────┘
                                 │
                                 ▼
                         ┌─────────────────┐
                         │   Components    │
                         │  (Presentation) │
                         └─────────────────┘
```

## Best Practices

### 1. Data Location

- **Constants**: `/src/constants/` - Static data, enums, configuration
- **Types**: `/src/types/` - TypeScript interfaces and types
- **Services**: `/src/services/` - API communication layer
- **Stores**: `/src/stores/` - Client-side state management

### 2. Naming Conventions

- Use descriptive, plural names for collections: `PRODUCTS`, `USERS`
- Use singular names for types: `Product`, `User`
- Use camelCase for functions: `getProductById`, `searchProducts`
- Use UPPER_CASE for constants: `MAX_ITEMS`, `DEFAULT_TIMEOUT`

### 3. Data Updates

When data structure changes are needed:

1. Update the type definition first
2. Update the data source (constants/API)
3. TypeScript will highlight all places that need updates
4. Update components to use new structure

### 4. Performance Considerations

- Use React Query for server state caching
- Implement proper cache invalidation strategies
- Use Zustand's persist middleware for client state persistence
- Lazy load large data sets

## Common Pitfalls to Avoid

### 1. Inline Data Definitions

```typescript
// ❌ BAD
function ProductList() {
  const products = [
    { id: 1, name: 'Product 1' },
    { id: 2, name: 'Product 2' }
  ];
}

// ✅ GOOD
import { PRODUCTS } from '@/constants/products';

function ProductList() {
  const products = Object.values(PRODUCTS);
}
```

### 2. Prop Drilling

```typescript
// ❌ BAD: Passing product data through multiple levels
<App product={product}>
  <Layout product={product}>
    <ProductDetail product={product} />
  </Layout>
</App>

// ✅ GOOD: Use state management or context
const { product } = useProductStore();
```

### 3. Mixed Concerns

```typescript
// ❌ BAD: Business logic in components
function ProductCard({ id }) {
  const product = products.find(p => p.id === id);
  const discountedPrice = product.price * 0.9;
  const formattedPrice = `$${discountedPrice.toFixed(2)}`;
}

// ✅ GOOD: Separate concerns
// utils/pricing.ts
export const calculateDiscount = (price: number) => price * 0.9;
export const formatPrice = (price: number) => `$${price.toFixed(2)}`;

// components/ProductCard.tsx
import { calculateDiscount, formatPrice } from '@/utils/formatPrice';
```

## Migration Guide

When refactoring existing code to follow these patterns:

1. **Identify duplicated data** - Search for repeated data structures
2. **Create type definitions** - Define interfaces for all data
3. **Centralize data sources** - Move to constants/services
4. **Update imports** - Point all components to central source
5. **Add helper functions** - Create utilities for common operations
6. **Test thoroughly** - Ensure no data inconsistencies

## Examples

See the following implementations for reference:

- `/src/types/product.ts` - Product type definitions
- `/src/constants/products.ts` - Centralized product data
- `/src/services/products.ts` - Product API service
- `/src/stores/cartStore.ts` - Cart state management

By following these patterns, we ensure:
- **Consistency**: Same data structure everywhere
- **Maintainability**: Single place to update
- **Type Safety**: TypeScript catches mismatches
- **Performance**: Efficient data access and caching
- **Scalability**: Easy to extend and modify
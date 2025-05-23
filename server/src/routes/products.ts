import { Router } from 'express';
import { PRODUCT_LIST, getProductById, getProductsByCategory, searchProducts } from '../../../src/constants/products';
import { Product } from '../../../src/types/product';

const router = Router();

// Get all products
router.get('/', async (req, res) => {
  const { category, search, sort } = req.query;
  
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  let products = [...PRODUCT_LIST];
  
  // Filter by category
  if (category && typeof category === 'string') {
    products = products.filter(p => p.category === category);
  }
  
  // Search products
  if (search && typeof search === 'string') {
    products = searchProducts(search);
  }
  
  // Sort products
  if (sort === 'price-asc') {
    products.sort((a, b) => a.pricing.monthly - b.pricing.monthly);
  } else if (sort === 'price-desc') {
    products.sort((a, b) => b.pricing.monthly - a.pricing.monthly);
  } else if (sort === 'name') {
    products.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  res.json({
    success: true,
    data: products,
    metadata: {
      total: products.length,
      categories: ['trading', 'analytics', 'reporting', 'infrastructure'],
    },
    timestamp: new Date().toISOString(),
  });
});

// Get product by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 200));
  
  const product = getProductById(id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND',
      },
    });
  }
  
  res.json({
    success: true,
    data: product,
    timestamp: new Date().toISOString(),
  });
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  const { category } = req.params;
  
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 200));
  
  const validCategories = ['trading', 'analytics', 'reporting', 'infrastructure'];
  
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid category',
        code: 'INVALID_CATEGORY',
      },
    });
  }
  
  const products = getProductsByCategory(category as Product['category']);
  
  res.json({
    success: true,
    data: products,
    metadata: {
      category,
      total: products.length,
    },
    timestamp: new Date().toISOString(),
  });
});

// Get featured products (for homepage)
router.get('/featured', async (_req, res) => {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 200));
  
  // Return a curated list of featured products
  const featuredIds = ['vts', 'ams', 'mis'];
  const featured = featuredIds
    .map(id => getProductById(id))
    .filter(Boolean);
  
  res.json({
    success: true,
    data: featured,
    timestamp: new Date().toISOString(),
  });
});

// Check product availability for user
router.post('/:id/check-availability', async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;
  
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const product = getProductById(id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND',
      },
    });
  }
  
  // Mock availability check
  const isAvailable = true;
  const userHasAccess = authHeader ? Math.random() > 0.5 : false;
  
  res.json({
    success: true,
    data: {
      productId: id,
      isAvailable,
      userHasAccess,
      requiresApproval: product.pricing.enterprise === 'custom',
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
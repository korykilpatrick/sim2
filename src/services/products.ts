import axios from 'axios';
import { Product } from '@/types/product';

const API_URL = '/api/v1'; // Using Vite proxy

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  metadata?: {
    total: number;
    categories: string[];
    category?: string;
  };
  timestamp: string;
}

export interface ProductResponse {
  success: boolean;
  data: Product;
  timestamp: string;
}

export interface ProductAvailability {
  productId: string;
  isAvailable: boolean;
  userHasAccess: boolean;
  requiresApproval: boolean;
}

class ProductService {
  async getProducts(params?: {
    category?: string;
    search?: string;
    sort?: 'price-asc' | 'price-desc' | 'name';
  }): Promise<Product[]> {
    const { data } = await axios.get<ProductsResponse>(`${API_URL}/products`, {
      params,
    });
    return data.data;
  }

  async getProductById(id: string): Promise<Product> {
    const { data } = await axios.get<ProductResponse>(`${API_URL}/products/${id}`);
    return data.data;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const { data } = await axios.get<ProductsResponse>(
      `${API_URL}/products/category/${category}`
    );
    return data.data;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const { data } = await axios.get<ProductsResponse>(`${API_URL}/products/featured`);
    return data.data;
  }

  async checkProductAvailability(
    productId: string,
    token?: string
  ): Promise<ProductAvailability> {
    const { data } = await axios.post<{
      success: boolean;
      data: ProductAvailability;
    }>(
      `${API_URL}/products/${productId}/check-availability`,
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return data.data;
  }
}

export const productService = new ProductService();
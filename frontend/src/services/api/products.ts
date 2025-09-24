import { apiClient } from './client';
import type { Product, ProductCategory, PersonalColorType } from '@/types';

export interface ProductsResponse {
  success: boolean;
  data: Product[];
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export class ProductAPI {
  /**
   * Get all active products
   * @param filters - Optional filters for category and personal color
   * @returns Promise<ProductsResponse>
   */
  static async getProducts(filters?: {
    category?: ProductCategory;
    personalColor?: PersonalColorType;
  }): Promise<ProductsResponse> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.personalColor) params.append('personalColor', filters.personalColor);
    
    const queryString = params.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    
    const response = await apiClient.get<ProductsResponse>(url);
    return response.data;
  }

  /**
   * Get a single product by ID
   * @param productId - Product ID
   * @returns Promise<ProductResponse>
   */
  static async getProduct(productId: string): Promise<ProductResponse> {
    const response = await apiClient.get<ProductResponse>(`/products/${productId}`);
    return response.data;
  }

  /**
   * Get multiple products by IDs
   * @param productIds - Array of product IDs
   * @returns Promise<ProductsResponse>
   */
  static async getProductsByIds(productIds: string[]): Promise<ProductsResponse> {
    const response = await apiClient.post<ProductsResponse>('/products/batch', {
      productIds
    });
    return response.data;
  }

  /**
   * Get products by category
   * @param category - Product category
   * @returns Promise<ProductsResponse>
   */
  static async getProductsByCategory(category: ProductCategory): Promise<ProductsResponse> {
    const response = await apiClient.get<ProductsResponse>(`/products/category/${category}`);
    return response.data;
  }

  /**
   * Get products by personal color
   * @param personalColor - Personal color type
   * @returns Promise<ProductsResponse>
   */
  static async getProductsByPersonalColor(personalColor: PersonalColorType): Promise<ProductsResponse> {
    const response = await apiClient.get<ProductsResponse>(`/products/personal-color/${personalColor}`);
    return response.data;
  }

  /**
   * Get products recommended for a user's personal color analysis result
   * @param personalColorEn - Personal color result (e.g., 'spring', 'summer')
   * @returns Promise<ProductsResponse>
   */
  static async getRecommendedProducts(personalColorEn: string): Promise<ProductsResponse> {
    console.log('[ProductAPI] getRecommendedProducts called with:', personalColorEn);
    
    // Map the general personal color to specific types
    // Handle various formats: 'spring', 'Spring', 'Spring Warm', etc.
    const colorMapping: Record<string, PersonalColorType> = {
      'spring': 'spring_warm',
      'autumn': 'autumn_warm',
      'summer': 'summer_cool',
      'winter': 'winter_cool',
      'spring warm': 'spring_warm',
      'autumn warm': 'autumn_warm',
      'summer cool': 'summer_cool',
      'winter cool': 'winter_cool'
    };
    
    // Extract season from the personal color string
    const lowerColor = personalColorEn.toLowerCase();
    let personalColorType = colorMapping[lowerColor];
    
    // If not found, try to extract just the season part
    if (!personalColorType) {
      const seasonMatch = lowerColor.match(/(spring|summer|autumn|winter)/);
      if (seasonMatch) {
        personalColorType = colorMapping[seasonMatch[1]];
      }
    }
    
    console.log('[ProductAPI] Mapped to personal color type:', personalColorType);
    
    if (!personalColorType) {
      console.error('[ProductAPI] Invalid personal color:', personalColorEn);
      // Return empty result instead of throwing error
      return { success: true, data: [] };
    }
    
    return this.getProductsByPersonalColor(personalColorType);
  }
}
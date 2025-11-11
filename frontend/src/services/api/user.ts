import { apiClient } from './client';

export interface SavedItem { productId: string; savedAt: string; }
export interface ViewedItem { productId: string; viewedAt: string; }

export const UserAPI = {
  // Saved products
  getSavedProducts: async (): Promise<SavedItem[]> => {
    const res = await apiClient.get<{ success: boolean; data: SavedItem[] }>(`/users/me/saved-products`);
    return res.data.data || [];
  },
  addSavedProduct: async (productId: string, savedAt?: string): Promise<void> => {
    await apiClient.post(`/users/me/saved-products`, { productId, savedAt });
  },
  removeSavedProduct: async (productId: string): Promise<void> => {
    await apiClient.delete(`/users/me/saved-products/${productId}`);
  },
  mergeSavedProducts: async (items: SavedItem[]): Promise<void> => {
    await apiClient.post(`/users/me/saved-products/batch`, { items });
  },

  // Viewed products
  getViewedProducts: async (): Promise<ViewedItem[]> => {
    const res = await apiClient.get<{ success: boolean; data: ViewedItem[] }>(`/users/me/viewed-products`);
    return res.data.data || [];
  },
  upsertViewedProduct: async (productId: string, viewedAt?: string): Promise<void> => {
    await apiClient.post(`/users/me/viewed-products`, { productId, viewedAt });
  },
  mergeViewedProducts: async (items: ViewedItem[]): Promise<void> => {
    await apiClient.post(`/users/me/viewed-products/batch`, { items });
  }
};


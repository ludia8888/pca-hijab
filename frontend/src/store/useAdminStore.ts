import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Product, ProductFilters } from '@/types/admin';

interface AdminState {
  products: Product[];
  selectedProduct: Product | null;
  filters: ProductFilters;
  isLoading: boolean;
  error: string | null;
  uploadingImages: boolean;
  uploadProgress: number;

  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setFilters: (filters: ProductFilters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUploadingImages: (uploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  clearProductState: () => void;
}

export const useAdminStore = create<AdminState>()(
  devtools(
    persist(
      (set) => ({
        products: [],
        selectedProduct: null,
        filters: {},
        isLoading: false,
        error: null,
        uploadingImages: false,
        uploadProgress: 0,

        setProducts: (products) => set({ products }),
        setSelectedProduct: (product) => set({ selectedProduct: product }),
        setFilters: (filters) => set({ filters }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        setUploadingImages: (uploading) => set({ uploadingImages: uploading }),
        setUploadProgress: (progress) => set({ uploadProgress: progress }),

        clearProductState: () =>
          set({
            products: [],
            selectedProduct: null,
            filters: {},
            isLoading: false,
            error: null,
            uploadingImages: false,
            uploadProgress: 0
          })
      }),
      {
        name: 'pca-hijab-admin',
        partialize: (state) => ({
          filters: state.filters
        })
      }
    )
  )
);

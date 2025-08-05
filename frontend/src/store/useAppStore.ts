import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { PersonalColorResult, UserPreferences, ViewedProduct, SavedProduct } from '@/types';

export interface AppActions {
  setInstagramId: (id: string) => void;
  setUploadedImage: (preview: string, file: File) => void;
  clearUploadedImage: () => void;
  setAnalysisResult: (result: PersonalColorResult) => void;
  setUserPreferences: (preferences: UserPreferences) => void;
  initSession: () => void;
  setSessionData: (sessionId: string, instagramId: string) => void;
  resetApp: () => void;
  // Product actions
  addViewedProduct: (productId: string) => void;
  toggleSavedProduct: (productId: string) => void;
  clearViewedProducts: () => void;
  clearSavedProducts: () => void;
}

export interface AppState {
  // User data
  instagramId: string | null;
  
  // Image data
  uploadedImage: File | null;
  uploadedImagePreview: string | null;
  
  // Analysis results
  analysisResult: PersonalColorResult | null;
  
  // User preferences
  userPreferences: UserPreferences | null;
  
  // Session
  sessionId: string | null;
  
  // Product tracking
  viewedProducts: ViewedProduct[];
  savedProducts: SavedProduct[];
}

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      (set) => ({
        // User data
        instagramId: null,
        setInstagramId: (id) => set({ instagramId: id }),
        
        // Image data
        uploadedImage: null,
        uploadedImagePreview: null,
        setUploadedImage: (preview, file) => set({ 
          uploadedImagePreview: preview, 
          uploadedImage: file 
        }),
        clearUploadedImage: () => set({ 
          uploadedImage: null, 
          uploadedImagePreview: null 
        }),
        
        // Analysis results
        analysisResult: null,
        setAnalysisResult: (result) => set({ analysisResult: result }),
        
        // User preferences
        userPreferences: null,
        setUserPreferences: (preferences) => set({ userPreferences: preferences }),
        
        // Session
        sessionId: null,
        initSession: () => {
          const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          set({ sessionId });
        },
        setSessionData: (sessionId, instagramId) => {
          set({ sessionId, instagramId });
        },
        
        // Product tracking
        viewedProducts: [],
        savedProducts: [],
        
        addViewedProduct: (productId) => set((state) => {
          // Remove if already exists to avoid duplicates
          const filtered = state.viewedProducts.filter(p => p.productId !== productId);
          // Add to beginning and limit to 10 items
          const newViewed: ViewedProduct = { productId, viewedAt: new Date().toISOString() };
          return { viewedProducts: [newViewed, ...filtered].slice(0, 10) };
        }),
        
        toggleSavedProduct: (productId) => set((state) => {
          const exists = state.savedProducts.find(p => p.productId === productId);
          if (exists) {
            return { savedProducts: state.savedProducts.filter(p => p.productId !== productId) };
          } else {
            const newSaved: SavedProduct = { productId, savedAt: new Date().toISOString() };
            return { savedProducts: [newSaved, ...state.savedProducts] };
          }
        }),
        
        clearViewedProducts: () => set({ viewedProducts: [] }),
        clearSavedProducts: () => set({ savedProducts: [] }),
        
        // Reset
        resetApp: () => set({
          instagramId: null,
          uploadedImage: null,
          uploadedImagePreview: null,
          analysisResult: null,
          userPreferences: null,
          sessionId: null,
          viewedProducts: [],
          savedProducts: [],
        }),
      }),
      {
        name: 'pca-hijab-store',
        partialize: (state) => ({
          instagramId: state.instagramId,
          analysisResult: state.analysisResult,
          userPreferences: state.userPreferences,
          sessionId: state.sessionId,
          viewedProducts: state.viewedProducts,
          savedProducts: state.savedProducts,
        }),
      }
    )
  )
);
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { PersonalColorResult, UserPreferences, ViewedProduct, SavedProduct } from '@/types';
import { createInstagramSafeStorage, sessionRecoveryHelpers } from './instagramPersistence';

export interface AppActions {
  setInstagramId: (id: string) => void;
  setUploadedImage: (preview: string, file: File) => void;
  clearUploadedImage: () => void;
  setAnalysisResult: (result: PersonalColorResult) => void;
  setUserPreferences: (preferences: UserPreferences) => void;
  setRecommendationPreferences: (preferences: UserPreferences) => void; // Alias for compatibility
  initSession: () => void;
  setSessionData: (sessionId: string, instagramId?: string) => void;
  resetApp: () => void;
  reset: () => void; // Alias for resetApp
  // Product actions
  addViewedProduct: (productId: string) => void;
  toggleSavedProduct: (productId: string) => void;
  clearViewedProducts: () => void;
  clearSavedProducts: () => void;
  // UI state actions (for compatibility)
  setCurrentStep: (step: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export interface AppState {
  // User data
  instagramId: string | null;
  
  // Image data
  uploadedImage: File | null;  // Actual file for API
  uploadedFile: File | null;    // Alias for compatibility
  uploadedImagePreview: string | null;
  
  // Analysis results
  analysisResult: PersonalColorResult | null;
  
  // User preferences
  userPreferences: UserPreferences | null;
  recommendationPreferences: UserPreferences | null; // Alias for compatibility
  
  // Session
  sessionId: string | null;
  
  // Product tracking
  viewedProducts: ViewedProduct[];
  savedProducts: SavedProduct[];
  
  // UI state (for compatibility)
  currentStep: number;
  isLoading: boolean;
  error: string | null;
}

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      (set, get) => ({
        // User data
        instagramId: null,
        setInstagramId: (id) => set({ instagramId: id }),
        
        // Image data
        uploadedImage: null,
        uploadedFile: null,  // Alias for compatibility
        uploadedImagePreview: null,
        setUploadedImage: (preview, file) => set({ 
          uploadedImagePreview: preview, 
          uploadedImage: file,
          uploadedFile: file  // Maintain compatibility
        }),
        clearUploadedImage: () => set({ 
          uploadedImage: null,
          uploadedFile: null,
          uploadedImagePreview: null 
        }),
        
        // Analysis results
        analysisResult: null,
        setAnalysisResult: (result) => set({ analysisResult: result }),
        
        // User preferences
        userPreferences: null,
        recommendationPreferences: null,
        setUserPreferences: (preferences) => set({ 
          userPreferences: preferences,
          recommendationPreferences: preferences 
        }),
        setRecommendationPreferences: (preferences) => set({ 
          userPreferences: preferences,
          recommendationPreferences: preferences 
        }),
        
        // Session
        sessionId: null,
        initSession: () => {
          const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          set({ sessionId });
        },
        setSessionData: (sessionId, instagramId) => {
          set({ sessionId, instagramId });
          // Also save session for Instagram browser recovery
          if (sessionId) {
            sessionRecoveryHelpers.saveSessionEverywhere(sessionId);
          }
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
        
        // UI state (for compatibility)
        currentStep: 0,
        isLoading: false,
        error: null,
        setCurrentStep: (step) => set({ currentStep: step }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error, isLoading: false }),
        clearError: () => set({ error: null }),
        
        // Reset
        resetApp: () => set({
          instagramId: null,
          uploadedImage: null,
          uploadedFile: null,
          uploadedImagePreview: null,
          analysisResult: null,
          userPreferences: null,
          recommendationPreferences: null,
          sessionId: null,
          viewedProducts: [],
          savedProducts: [],
          currentStep: 0,
          isLoading: false,
          error: null,
        }),
        reset: () => get().resetApp(), // Alias for compatibility
      }),
      {
        name: 'pca-hijab-store',
        storage: createInstagramSafeStorage(),
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
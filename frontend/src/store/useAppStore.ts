import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { PersonalColorResult, UserPreferences } from '@/types';

interface AppState {
  // User data
  instagramId: string | null;
  setInstagramId: (id: string) => void;
  
  // Image data
  uploadedImage: File | null;
  uploadedImagePreview: string | null;
  setUploadedImage: (preview: string, file: File) => void;
  clearUploadedImage: () => void;
  
  // Analysis results
  analysisResult: PersonalColorResult | null;
  setAnalysisResult: (result: PersonalColorResult) => void;
  
  // User preferences
  userPreferences: UserPreferences | null;
  setUserPreferences: (preferences: UserPreferences) => void;
  
  // Session
  sessionId: string | null;
  initSession: () => void;
  
  // Reset
  resetApp: () => void;
}

export const useAppStore = create<AppState>()(
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
        
        // Reset
        resetApp: () => set({
          instagramId: null,
          uploadedImage: null,
          uploadedImagePreview: null,
          analysisResult: null,
          userPreferences: null,
          sessionId: null,
        }),
      }),
      {
        name: 'pca-hijab-store',
        partialize: (state) => ({
          instagramId: state.instagramId,
          analysisResult: state.analysisResult,
          userPreferences: state.userPreferences,
          sessionId: state.sessionId,
        }),
      }
    )
  )
);
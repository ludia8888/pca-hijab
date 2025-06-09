import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { PersonalColorResult, UserPreferences } from '@/types';

export interface AppActions {
  setInstagramId: (id: string) => void;
  setUploadedImage: (preview: string, file: File) => void;
  clearUploadedImage: () => void;
  setAnalysisResult: (result: PersonalColorResult) => void;
  setUserPreferences: (preferences: UserPreferences) => void;
  initSession: () => void;
  setSessionData: (sessionId: string, instagramId: string) => void;
  resetApp: () => void;
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
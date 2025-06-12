import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { PersonalColorResult, UserPreferences } from '@/types';

interface AppState {
  // User session
  sessionId: string | null;
  instagramId: string | null;
  
  // Analysis data
  uploadedImage: string | null; // Preview URL for display
  uploadedFile: File | null; // Actual file for API
  analysisResult: PersonalColorResult | null;
  
  // Recommendation data
  recommendationPreferences: UserPreferences | null;
  
  // UI state
  currentStep: number;
  isLoading: boolean;
  error: string | null;
}

interface AppActions {
  setSessionData: (sessionId: string, instagramId: string) => void;
  setUploadedImage: (imageUrl: string, file: File) => void;
  setAnalysisResult: (result: PersonalColorResult) => void;
  setRecommendationPreferences: (preferences: UserPreferences) => void;
  setUserPreferences: (preferences: UserPreferences) => void; // Alias for setRecommendationPreferences
  setCurrentStep: (step: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  clearError: () => void;
}

const initialState: AppState = {
  sessionId: null,
  instagramId: null,
  uploadedImage: null,
  uploadedFile: null,
  analysisResult: null,
  recommendationPreferences: null,
  currentStep: 0,
  isLoading: false,
  error: null,
};

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setSessionData: (sessionId, instagramId) =>
          set((state) => ({
            ...state,
            sessionId,
            instagramId,
          })),

        setUploadedImage: (imageUrl, file) =>
          set((state) => ({
            ...state,
            uploadedImage: imageUrl,
            uploadedFile: file,
          })),

        setAnalysisResult: (result) =>
          set((state) => ({
            ...state,
            analysisResult: result,
          })),

        setRecommendationPreferences: (preferences) =>
          set((state) => ({
            ...state,
            recommendationPreferences: preferences,
          })),

        setUserPreferences: (preferences) =>
          set((state) => ({
            ...state,
            recommendationPreferences: preferences,
          })),

        setCurrentStep: (step) =>
          set((state) => ({
            ...state,
            currentStep: step,
          })),

        setLoading: (loading) =>
          set((state) => ({
            ...state,
            isLoading: loading,
          })),

        setError: (error) =>
          set((state) => ({
            ...state,
            error,
            isLoading: false,
          })),

        clearError: () =>
          set((state) => ({
            ...state,
            error: null,
          })),

        reset: () => set(initialState),
      }),
      {
        name: 'pca-hijab-store',
        partialize: (state) => ({
          sessionId: state.sessionId,
          instagramId: state.instagramId,
          uploadedImage: state.uploadedImage,
          analysisResult: state.analysisResult,
          recommendationPreferences: state.recommendationPreferences,
        }),
      },
    ),
  ),
);
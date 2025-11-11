import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthAPI } from '@/services/api/auth';
import { secureError } from '@/utils/secureLogging';

type ApiErrorResponse = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
};

const resolveErrorMessage = (
  error: unknown,
  fallbackMessage: string,
  overrides: Record<number, string> = {}
): string => {
  if (typeof error === 'string') {
    return error;
  }

  const apiError = error as ApiErrorResponse;
  const status = apiError?.response?.status;

  if (status && overrides[status]) {
    return overrides[status];
  }

  return apiError?.response?.data?.message ?? fallbackMessage;
};

interface User {
  id: string;
  email: string;
  fullName: string;
  instagramId?: string;
  emailVerified: boolean;
  role: 'user' | 'admin' | 'content_manager';
  lastLoginAt?: Date;
  hasPersonalColorDiagnosis?: boolean;
  personalColorResult?: {
    season: string;
    seasonEn: string;
    confidence: number;
    diagnosedAt: Date;
  };
  createdAt: Date;
  updatedAt?: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false, // Start as not authenticated
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AuthAPI.login(email, password);
          const { user } = response.data;
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: unknown) {
          const message = resolveErrorMessage(error, 'Login failed', {
            401: 'The email or password you entered is incorrect. Please try again.'
          });

          set({
            isLoading: false,
            error: message
          });
          throw new Error(message);
        }
      },

      signup: async (email: string, password: string, fullName: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AuthAPI.signup(email, password, fullName);
          const { user } = response.data;
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: unknown) {
          const status = (error as ApiErrorResponse)?.response?.status;
          const friendlyMessage = resolveErrorMessage(error, 'Signup failed', {
            409: 'This email address is already registered. Please sign in or use another email.'
          });

          set({
            isLoading: false,
            error: friendlyMessage
          });

          const enriched = Object.assign(new Error(friendlyMessage), { status });
          throw enriched;
        }
      },

      logout: async () => {
        try {
          await AuthAPI.logout();
        } catch (error) {
          secureError('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            error: null
          });
        }
      },

      refreshAccessToken: async () => {
        try {
          await AuthAPI.refreshToken();
        } catch (error) {
          // If refresh fails, logout the user
          set({
            user: null,
            isAuthenticated: false
          });
          throw error;
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        try {
          const response = await AuthAPI.getMe();
          set({
            user: response.data.user,
            isAuthenticated: true
          });
        } catch {
          // Token might be expired, try to refresh
          try {
            await get().refreshAccessToken();
            // Retry getting user info
            const response = await AuthAPI.getMe();
            set({
              user: response.data.user,
              isAuthenticated: true
            });
          } catch {
            // Both access and refresh failed, logout
            set({
              user: null,
              isAuthenticated: false
            });
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist minimal data - tokens are in HttpOnly cookies
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

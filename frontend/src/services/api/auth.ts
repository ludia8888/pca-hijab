import { apiClient } from './client';
import { sanitizeEmail, sanitizeName } from '@/utils/sanitize';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      fullName: string;
      instagramId?: string;
      emailVerified: boolean;
      role: 'user' | 'admin' | 'content_manager';
      lastLoginAt?: string;
      createdAt: Date;
      updatedAt?: Date;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface UserResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      fullName: string;
      instagramId?: string;
      emailVerified: boolean;
      role: 'user' | 'admin' | 'content_manager';
      lastLoginAt?: string;
      createdAt: Date;
      updatedAt?: Date;
    };
  };
}

export const AuthAPI = {
  // User signup
  signup: async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    console.log('🚀 [Frontend] Signup request:', {
      email,
      fullName,
      passwordLength: password.length
    });
    
    const payload = {
      email: sanitizeEmail(email),
      password, // Don't sanitize passwords as they need to remain exactly as entered
      fullName: sanitizeName(fullName)
    };
    
    console.log('📤 [Frontend] Sending signup payload:', payload);
    
    try {
      const response = await apiClient.post<AuthResponse>('/auth/signup', payload);
      console.log('✅ [Frontend] Signup response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [Frontend] Signup error:', error);
      throw error;
    }
  },

  // User login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email: sanitizeEmail(email),
      password // Don't sanitize passwords
    });
    return response.data;
  },

  // Admin login (ENV-based)
  adminLogin: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/admin-login', {
      email: sanitizeEmail(email),
      password
    });
    return response.data;
  },

  // Refresh access token
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh');
    return response.data;
  },

  // User logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  // Get current user
  getMe: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>('/auth/me');
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },

  // Request password reset
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', { 
      email: sanitizeEmail(email)
    });
    return response.data;
  },

  // (removed) duplicate adminLogin

  // Account reminder (username lookup)
  remindAccount: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/find-account', {
      email: sanitizeEmail(email)
    });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      newPassword
    });
    return response.data;
  },

  // Update personal color diagnosis
  updatePersonalColorDiagnosis: async (diagnosisData: {
    season: string;
    seasonEn: string;
    confidence: number;
  }): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>('/auth/personal-color', diagnosisData);
    return response.data;
  }
};

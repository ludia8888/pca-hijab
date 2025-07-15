export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  instagramId?: string;
  emailVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Session {
  id: string;
  instagramId: string;
  userId?: string;
  uploadedImageUrl?: string;
  analysisResult?: PersonalColorResult;
  journeyStatus?: JourneyStatus;
  priority?: Priority;
  offerSentAt?: Date;
  notes?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export type JourneyStatus = 
  | 'just_started'
  | 'diagnosis_pending'
  | 'diagnosis_done'
  | 'offer_sent'
  | 'recommendation_requested'
  | 'recommendation_processing'
  | 'recommendation_completed'
  | 'inactive';

export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export interface PersonalColorResult {
  personal_color: string;
  personal_color_en: 'spring' | 'summer' | 'autumn' | 'winter';
  personal_color_ko?: string;
  tone: string;
  tone_en: 'warm' | 'cool';
  details: {
    is_warm: number;
    skin_lab_b: number;
    eyebrow_lab_b: number;
    eye_lab_b: number;
    skin_hsv_s: number;
    eyebrow_hsv_s: number;
    eye_hsv_s: number;
  };
  facial_colors: {
    cheek: ColorInfo;
    eyebrow: ColorInfo;
    eye: ColorInfo;
  };
  confidence?: number;
}

export interface ColorInfo {
  rgb: [number, number, number];
  lab: [number, number, number];
  hsv: [number, number, number];
}

export interface UserPreferences {
  style: string[];
  priceRange: string;
  material: string[];
  occasion: string[];
  additionalNotes: string;
}

export interface Recommendation {
  id: string;
  sessionId: string;
  instagramId: string;
  userId?: string;
  personalColorResult: PersonalColorResult;
  userPreferences: UserPreferences;
  uploadedImageUrl?: string;
  status: 'pending' | 'processing' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}
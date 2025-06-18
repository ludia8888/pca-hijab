export interface Session {
  id: string;
  instagramId: string;
  uploadedImageUrl?: string;
  analysisResult?: PersonalColorResult;
  createdAt: Date;
  updatedAt?: Date;
}

export interface PersonalColorResult {
  personal_color: string;
  personal_color_en: 'spring' | 'summer' | 'autumn' | 'winter';
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
  personalColorResult: PersonalColorResult;
  userPreferences: UserPreferences;
  status: 'pending' | 'processing' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}
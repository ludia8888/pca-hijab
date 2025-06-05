// Personal Color Analysis Types
export interface PersonalColorResult {
  personal_color: string;
  personal_color_en: 'spring' | 'summer' | 'autumn' | 'fall' | 'winter';
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
  facial_colors: FacialColors;
  confidence?: number;
}

export interface FacialColors {
  cheek: ColorInfo;
  eyebrow: ColorInfo;
  eye: ColorInfo;
}

export interface ColorInfo {
  rgb: [number, number, number];
  lab: [number, number, number];
  hsv: [number, number, number];
}

// User & Session Types
export interface UserSession {
  sessionId: string;
  instagramId: string;
  createdAt: Date;
}

export interface UserPreferences {
  material: 'summer' | 'winter' | 'allseason';
  transparency: 'opaque' | 'slight' | 'any';
  priceRange: 'under-10k' | '10k-20k' | 'premium';
  fitStyle: 'tight' | 'layer' | 'loose';
  colorPreference: string[];
  additionalNotes?: string;
}

// Form Types
export interface FormStep {
  id: string;
  title: string;
  description?: string;
  validation?: (data: unknown) => boolean;
}

// API Types
export interface ApiError {
  error: string;
  detail: string;
  code?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

// UI Component Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';
export type ToneType = 'warm' | 'cool';

// Analysis Flow Types
export interface AnalysisStep {
  id: string;
  icon?: string;
  message: string;
  progress: number;
  duration: number;
}

// Color Palette Types
export interface Color {
  name: string;
  hex: string;
  rgb: [number, number, number];
}

export interface ColorPalette {
  bestColors: Color[];
  worstColors: Color[];
}
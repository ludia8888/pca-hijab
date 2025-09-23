// Product-related types for admin functionality
export type ProductCategory = 'hijab' | 'lens' | 'lip' | 'eyeshadow' | 'tint';
export type PersonalColorType = 'spring_warm' | 'autumn_warm' | 'summer_cool' | 'winter_cool';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  thumbnailUrl: string;
  detailImageUrls: string[];
  personalColors: PersonalColorType[]; // 해당 상품이 추천되는 퍼스널 컬러들
  description?: string;
  shopeeLink: string; // 쇼피 상품 링크
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFormData {
  name: string;
  category: ProductCategory;
  price: number;
  thumbnailUrl: string;
  detailImageUrls: string[];
  personalColors: PersonalColorType[];
  description?: string;
  shopeeLink: string;
  isActive: boolean;
}

export interface ImageUploadResponse {
  url: string;
  filename: string;
  originalName: string;
  size: number;
}

export interface ProductFilters {
  category?: ProductCategory;
  personalColor?: PersonalColorType;
  searchTerm?: string;
}

// Category labels for UI
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  hijab: 'Hijab',
  lens: 'Contact Lens',
  lip: 'Lipstick',
  eyeshadow: 'Eyeshadow',
  tint: 'Tint'
};

// Personal color labels for UI
export const PERSONAL_COLOR_LABELS: Record<PersonalColorType, string> = {
  spring_warm: 'Spring Warm',
  autumn_warm: 'Autumn Warm',
  summer_cool: 'Summer Cool',
  winter_cool: 'Winter Cool'
};

// Content-related types
export type ContentCategory = 'beauty_tips' | 'hijab_styling' | 'color_guide' | 'trend' | 'tutorial';
export type ContentStatus = 'draft' | 'published';

export interface Content {
  id: string;
  title: string;
  subtitle?: string;
  slug: string; // URL 친화적인 식별자
  thumbnailUrl: string;
  content: string; // HTML 형식의 본문
  excerpt?: string; // 요약/미리보기 텍스트
  category: ContentCategory;
  tags: string[];
  status: ContentStatus;
  publishedAt?: Date;
  metaDescription?: string; // SEO 메타 설명
  metaKeywords?: string; // SEO 키워드
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentFormData {
  title: string;
  subtitle?: string;
  slug: string;
  thumbnailUrl: string;
  content: string;
  excerpt?: string;
  category: ContentCategory;
  tags: string[];
  status: ContentStatus;
  metaDescription?: string;
  metaKeywords?: string;
}

// Content category labels for UI
export const CONTENT_CATEGORY_LABELS: Record<ContentCategory, string> = {
  beauty_tips: 'Beauty Tips',
  hijab_styling: 'Hijab Styling',
  color_guide: 'Color Guide',
  trend: 'Trend',
  tutorial: 'Tutorial'
};

// Content status labels for UI
export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  draft: 'Draft',
  published: 'Published'
};
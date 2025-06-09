# Personal Color Analysis API - Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Specification](#api-specification)
4. [Frontend-Backend Communication](#frontend-backend-communication)
5. [Core Algorithm](#core-algorithm)
6. [Data Models](#data-models)
7. [Installation & Setup](#installation--setup)
8. [Deployment Guide](#deployment-guide)
9. [Frontend Integration](#frontend-integration)
10. [Performance Optimization](#performance-optimization)
11. [Security Considerations](#security-considerations)
12. [Testing](#testing)
13. [Monitoring & Logging](#monitoring--logging)
14. [Troubleshooting](#troubleshooting)

---

## Overview

### Project Description
Personal Color Analysis API는 사용자의 얼굴 이미지를 분석하여 퍼스널 컬러(봄/여름/가을/겨울)를 진단하는 AI 기반 REST API 서비스입니다.

### Key Features
- 얼굴 인식 및 특징점 추출 (dlib 기반)
- 피부, 눈썹, 눈동자 색상 분석
- Lab/HSV 색공간 기반 과학적 분류
- 웜톤/쿨톤 및 계절별 타입 진단
- RESTful API 인터페이스

### Technology Stack
- **Language**: Python 3.9+
- **Framework**: FastAPI
- **Face Detection**: dlib, OpenCV
- **ML/Scientific**: scikit-learn, scipy, numpy
- **Color Processing**: colormath
- **Server**: Uvicorn (ASGI)

---

## Architecture

### System Architecture Diagram
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Client App    │────▶│   FastAPI Server │────▶│  Core Analysis  │
│  (Web/Mobile)   │◀────│   (api.py)       │◀────│    Engine       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │                          │
                               ▼                          ▼
                        ┌──────────────┐          ┌──────────────┐
                        │   CORS       │          │ Face Detection│
                        │ Middleware   │          │   (dlib)     │
                        └──────────────┘          └──────────────┘
                                                          │
                                                          ▼
                                                  ┌──────────────┐
                                                  │Color Analysis│
                                                  │  (K-means)   │
                                                  └──────────────┘
```

### Component Structure
```
ShowMeTheColor/
├── src/
│   ├── api.py                          # FastAPI application
│   ├── personal_color_analysis/
│   │   ├── detect_face.py              # Face detection module
│   │   ├── color_extract.py            # Color extraction module
│   │   ├── tone_analysis.py            # Tone classification
│   │   └── personal_color.py           # Main analysis logic
│   ├── test_api.py                     # API test script
│   └── web_test.html                   # Web test interface
├── res/
│   └── shape_predictor_68_face_landmarks.dat  # dlib model
├── requirements.txt                     # Dependencies
└── README_API.md                       # API documentation
```

---

## API Specification

### Base URL
```
http://localhost:8000
```

### Endpoints

#### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "Personal Color Analysis API"
}
```

#### 2. Root Information
```http
GET /
```

**Response:**
```json
{
  "message": "Personal Color Analysis API",
  "endpoints": {
    "/analyze": "POST - 이미지를 업로드하여 퍼스널 컬러 분석",
    "/health": "GET - API 상태 확인"
  }
}
```

#### 3. Personal Color Analysis
```http
POST /analyze
```

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` (image file)
- Query Parameters: 
  - `debug` (boolean, optional): Include debug information

**Response (200 OK):**
```json
{
  "personal_color": "가을 웜톤",
  "personal_color_en": "fall",
  "tone": "웜톤",
  "tone_en": "warm",
  "details": {
    "is_warm": 1.0,
    "skin_lab_b": 20.48,
    "eyebrow_lab_b": 22.31,
    "eye_lab_b": 11.49,
    "skin_hsv_s": 33.0,
    "eyebrow_hsv_s": 57.0,
    "eye_hsv_s": 29.0
  },
  "facial_colors": {
    "cheek": {
      "rgb": [203, 164, 135],
      "lab": [70.17, 10.23, 20.48],
      "hsv": [25.59, 33.0, 79.61]
    },
    "eyebrow": {
      "rgb": [166, 82, 71],
      "lab": [45.16, 33.77, 22.31],
      "hsv": [6.63, 57.0, 65.29]
    },
    "eye": {
      "rgb": [120, 100, 85],
      "lab": [44.09, 5.53, 11.49],
      "hsv": [25.71, 29.0, 47.25]
    }
  },
  "debug_info": {
    "Lab_b": [20.48, 22.31, 11.49],
    "hsv_s": [33.0, 57.0, 29.0]
  }
}
```

**Error Responses:**

400 Bad Request:
```json
{
  "detail": "이미지 파일만 업로드 가능합니다."
}
```

500 Internal Server Error:
```json
{
  "detail": "분석 중 오류가 발생했습니다: [error message]"
}
```

#### 4. Hijab Recommendation (Backend API Integration)
```http
POST /api/recommendations
```

**Request:**
- Method: `POST`
- Content-Type: `application/json`

```json
{
  "instagramId": "user_instagram",
  "personalColorResult": {
    "personal_color": "가을 웜톤",
    "personal_color_en": "autumn",
    "tone": "웜톤",
    "tone_en": "warm",
    "details": { ... },
    "facial_colors": { ... }
  },
  "preferences": {
    "style": ["simple", "pattern"],
    "priceRange": "30-50",
    "material": ["cotton", "chiffon"],
    "occasion": ["daily", "work"],
    "additionalNotes": "얼굴이 작아 보이는 스타일 선호"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "추천 요청이 성공적으로 전송되었습니다",
  "recommendationId": "rec_1234567890"
}
```

#### 5. Recommendation Status Check
```http
GET /api/recommendations/{recommendationId}/status
```

**Response:**
```json
{
  "status": "pending",
  "updatedAt": "2024-06-06T12:00:00Z"
}
```

---

## Frontend-Backend Communication

### Architecture Overview

#### Frontend (React + TypeScript)
- **Base URL**: Vite proxy를 통한 `/api` 경로
- **실제 Backend URL**: `http://localhost:8000`
- **통신 방식**: Axios 기반 REST API
- **State Management**: Zustand + React Query

#### Backend Integration
- **Backend API (새 API)**: Express.js (포트 3001)
- **AI API (ShowMeTheColor)**: FastAPI (포트 8000)
- **CORS**: 개발 환경에서 모든 origin 허용

### API Client Configuration

```typescript
// services/api/client.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Service Layer Structure

```typescript
// services/api/personalColor.ts
import { apiClient } from './client';
import type { PersonalColorResult } from '@/types';

export class PersonalColorAPI {
  async analyzeImage(file: File, debug = false): Promise<PersonalColorResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<PersonalColorResult>(
      `/analyze${debug ? '?debug=true' : ''}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  async healthCheck() {
    const response = await apiClient.get<{ status: string; service: string }>('/health');
    return response.data;
  }
}

// services/api/recommendation.ts
import { apiClient } from './client';
import type { RecommendationRequest, RecommendationResponse } from '@/types';

export class RecommendationAPI {
  async submitRecommendation(data: RecommendationRequest): Promise<RecommendationResponse> {
    try {
      const response = await apiClient.post<RecommendationResponse>(
        '/recommendations',
        data
      );
      return response.data;
    } catch (error) {
      // Fallback to mock response in development
      if (import.meta.env.DEV) {
        return {
          success: true,
          message: '추천 요청이 성공적으로 전송되었습니다',
          recommendationId: `rec_${Date.now()}`,
        };
      }
      throw error;
    }
  }

  async getRecommendationStatus(recommendationId: string) {
    const response = await apiClient.get(
      `/recommendations/${recommendationId}/status`
    );
    return response.data;
  }
}
```

### Error Handling Strategy

```typescript
// utils/errorHandler.ts
export class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: any): never {
  if (error.response) {
    // Server responded with error
    throw new APIError(
      error.response.status,
      error.response.data.code || 'UNKNOWN_ERROR',
      error.response.data.detail || error.response.data.message || 'An error occurred',
      error.response.data
    );
  } else if (error.request) {
    // Network error
    throw new APIError(
      0,
      'NETWORK_ERROR',
      'Network connection failed. Please check your internet connection.',
      { originalError: error }
    );
  } else {
    // Other errors
    throw new APIError(
      0,
      'CLIENT_ERROR',
      error.message || 'An unexpected error occurred',
      { originalError: error }
    );
  }
}
```

### React Query Integration

```typescript
// hooks/usePersonalColor.ts
import { useMutation } from '@tanstack/react-query';
import { personalColorAPI } from '@/services/api';
import { queryClient } from '@/hooks/queryClient';

export function useAnalyzeImage() {
  return useMutation({
    mutationFn: (file: File) => personalColorAPI.analyzeImage(file),
    onSuccess: (data) => {
      // Cache the result
      queryClient.setQueryData(['personalColor', 'latest'], data);
    },
    onError: (error) => {
      console.error('Analysis failed:', error);
    },
  });
}

// hooks/useRecommendation.ts
export function useSubmitRecommendation() {
  return useMutation({
    mutationFn: (data: RecommendationRequest) => 
      recommendationAPI.submitRecommendation(data),
    onSuccess: (data) => {
      // Store recommendation ID
      localStorage.setItem('latestRecommendationId', data.recommendationId);
    },
  });
}
```

### Development Proxy Configuration

```javascript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
```

### Mock Data for Development

```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.post('/api/analyze', (req, res, ctx) => {
    return res(
      ctx.delay(1000),
      ctx.json({
        personal_color: '가을 웜톤',
        personal_color_en: 'autumn',
        tone: '웜톤',
        tone_en: 'warm',
        details: {
          is_warm: 1,
          skin_lab_b: 15.2,
          eyebrow_lab_b: 12.5,
          eye_lab_b: 8.3,
          skin_hsv_s: 30,
          eyebrow_hsv_s: 40,
          eye_hsv_s: 25,
        },
        facial_colors: {
          cheek: {
            rgb: [255, 200, 180],
            lab: [80, 15, 20],
            hsv: [15, 30, 100],
          },
          eyebrow: {
            rgb: [120, 80, 60],
            lab: [40, 10, 15],
            hsv: [20, 50, 47],
          },
          eye: {
            rgb: [80, 60, 50],
            lab: [30, 5, 10],
            hsv: [20, 37, 31],
          },
        },
        confidence: 0.85,
      })
    );
  }),

  rest.post('/api/recommendations', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        message: '추천 요청이 성공적으로 전송되었습니다',
        recommendationId: `rec_${Date.now()}`,
      })
    );
  }),
];
```

### Image Processing and File Upload

```typescript
// utils/imageProcessor.ts
export async function processImageForUpload(file: File): Promise<File> {
  // Check file size
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    // Compress image
    return await compressImage(file, 0.8);
  }
  return file;
}

export async function compressImage(file: File, quality: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        const MAX_DIMENSION = 1024;
        
        if (width > height && width > MAX_DIMENSION) {
          height = (height * MAX_DIMENSION) / width;
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width = (width * MAX_DIMENSION) / height;
          height = MAX_DIMENSION;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
    };
  });
}
```

### Rate Limiting and Request Management

```typescript
// utils/rateLimiter.ts
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private minInterval = 1000; // 1 second between requests

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - timeSinceLastRequest)
      );
    }
    
    const fn = this.queue.shift()!;
    this.lastRequestTime = Date.now();
    
    await fn();
    this.processing = false;
    this.process();
  }
}

export const apiRateLimiter = new RateLimiter();
```

---

## Core Algorithm

### 1. Face Detection Process
```python
# detect_face.py - DetectFace class
class DetectFace:
    def __init__(self, image_path):
        # Initialize dlib face detector and shape predictor
        self.detector = dlib.get_frontal_face_detector()
        self.predictor = dlib.shape_predictor(predictor_path)
        
    def detect_face_part(self):
        # Extract 68 facial landmarks
        # Return cropped regions for:
        # - Left/Right Cheeks
        # - Left/Right Eyebrows  
        # - Left/Right Eyes
```

### 2. Color Extraction Algorithm
```python
# color_extract.py - DominantColors class
class DominantColors:
    def __init__(self, image, clusters=4):
        # Apply K-means clustering to find dominant colors
        kmeans = KMeans(n_clusters=clusters)
        kmeans.fit(image_pixels)
        
    def getHistogram(self):
        # Sort colors by frequency
        # Filter out blue mask (non-face pixels)
        # Return dominant colors
```

### 3. Tone Analysis Logic
```python
# tone_analysis.py
def is_warm(lab_b_values, weights):
    """
    Warm/Cool classification using Lab color space
    - Warm standard: [11.65, 11.71, 3.65]
    - Cool standard: [4.64, 4.87, 0.19]
    """
    
def is_spr(hsv_s_values, weights):
    """
    Spring/Autumn classification for warm tones
    - Spring standard: [18.59, 30.30, 25.81]
    - Autumn standard: [27.14, 39.75, 37.50]
    """
    
def is_smr(hsv_s_values, weights):
    """
    Summer/Winter classification for cool tones
    - Summer standard: [12.50, 21.72, 24.77]
    - Winter standard: [16.74, 24.83, 31.37]
    """
```

### 4. Classification Weights
```python
# Feature importance weights
LAB_WEIGHTS = [30, 20, 5]  # [skin, eyebrow, eye]
HSV_WEIGHTS = [10, 1, 1]   # [skin, eyebrow, eye]
```

### 5. Color Space Conversions
```python
# RGB → Lab conversion
rgb = sRGBColor(r, g, b, is_upscaled=True)
lab = convert_color(rgb, LabColor)

# RGB → HSV conversion
hsv = convert_color(rgb, HSVColor)
hsv_s_percentage = hsv.hsv_s * 100
```

---

## Data Models

### Pydantic Models

```python
class ColorInfo(BaseModel):
    rgb: List[int]        # [R, G, B] values (0-255)
    lab: List[float]      # [L, a, b] values
    hsv: List[float]      # [H, S, V] values

class FacialFeatureColors(BaseModel):
    cheek: ColorInfo
    eyebrow: ColorInfo
    eye: ColorInfo

class AnalysisResult(BaseModel):
    personal_color: str              # Korean name
    personal_color_en: str           # English name
    tone: str                        # 웜톤/쿨톤
    tone_en: str                     # warm/cool
    details: Dict[str, float]        # Detailed metrics
    facial_colors: FacialFeatureColors
    debug_info: Optional[Dict[str, List[float]]] = None

class ErrorResponse(BaseModel):
    error: str
    detail: str
```

---

## Installation & Setup

### Prerequisites
- Python 3.9+
- macOS/Linux/Windows
- 4GB+ RAM recommended

### Installation Steps

1. **Clone Repository**
```bash
git clone https://github.com/starbucksdolcelatte/ShowMeTheColor.git
cd ShowMeTheColor
```

2. **Create Virtual Environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Dependencies**
```bash
pip install -r requirements.txt
```

4. **Download dlib Model**
Ensure `shape_predictor_68_face_landmarks.dat` exists in `res/` directory

5. **Run Server**
```bash
cd src
python api.py
# or
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

### Dependencies List
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
opencv-python==4.8.1.78
dlib==19.24.2
imutils==0.5.4
numpy==1.24.3
scikit-learn==1.3.2
matplotlib==3.7.2
colormath==3.0.0
scipy==1.11.4
pydantic==2.5.0
```

---

## Deployment Guide

### Development Server
```bash
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

### Production Deployment

#### 1. Using Gunicorn
```bash
pip install gunicorn
gunicorn api:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### 2. Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for dlib
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

WORKDIR /app/src
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 3. Docker Compose
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
    volumes:
      - ./res:/app/res
    restart: unless-stopped
```

#### 4. Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: personal-color-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: personal-color-api
  template:
    metadata:
      labels:
        app: personal-color-api
    spec:
      containers:
      - name: api
        image: personal-color-api:latest
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: personal-color-api-service
spec:
  selector:
    app: personal-color-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: LoadBalancer
```

### Environment Variables
```bash
# .env file
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=info
CORS_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]
MAX_UPLOAD_SIZE=10485760  # 10MB
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # File upload settings
        client_max_body_size 10M;
    }
}
```

---

## Frontend Integration

### JavaScript/TypeScript Example
```typescript
interface PersonalColorResult {
  personal_color: string;
  personal_color_en: string;
  tone: string;
  tone_en: string;
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
}

interface ColorInfo {
  rgb: number[];
  lab: number[];
  hsv: number[];
}

// API Client
class PersonalColorAPI {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL;
  }

  async analyzeImage(imageFile: File, debug: boolean = false): Promise<PersonalColorResult> {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(`${this.baseURL}/analyze?debug=${debug}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Analysis failed');
    }

    return response.json();
  }

  async checkHealth(): Promise<{ status: string; service: string }> {
    const response = await fetch(`${this.baseURL}/health`);
    return response.json();
  }
}

// Usage
const api = new PersonalColorAPI();

// File input handler
async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file) return;

  try {
    const result = await api.analyzeImage(file, true);
    console.log('Personal Color:', result.personal_color);
    displayResult(result);
  } catch (error) {
    console.error('Analysis failed:', error);
    showError(error.message);
  }
}
```

### React Component Example
```jsx
import React, { useState } from 'react';
import { PersonalColorAPI } from './api/personalColor';

const PersonalColorAnalyzer = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = new PersonalColorAPI();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const analysisResult = await api.analyzeImage(file);
      setResult(analysisResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analyzer">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        disabled={loading}
      />
      
      {loading && <div>Analyzing...</div>}
      
      {error && <div className="error">{error}</div>}
      
      {result && (
        <div className="result">
          <h2>{result.personal_color}</h2>
          <p>Type: {result.tone}</p>
          <div className="colors">
            {Object.entries(result.facial_colors).map(([feature, color]) => (
              <div key={feature}>
                <span>{feature}:</span>
                <div 
                  className="color-box" 
                  style={{
                    backgroundColor: `rgb(${color.rgb.join(',')})`
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

### Flutter Integration
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';

class PersonalColorAPI {
  final String baseUrl;
  
  PersonalColorAPI({this.baseUrl = 'http://localhost:8000'});
  
  Future<PersonalColorResult> analyzeImage(File imageFile) async {
    var request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/analyze'),
    );
    
    request.files.add(
      await http.MultipartFile.fromPath(
        'file',
        imageFile.path,
      ),
    );
    
    var response = await request.send();
    var responseData = await response.stream.toBytes();
    var responseString = String.fromCharCodes(responseData);
    
    if (response.statusCode == 200) {
      return PersonalColorResult.fromJson(json.decode(responseString));
    } else {
      throw Exception('Failed to analyze image');
    }
  }
}

class PersonalColorResult {
  final String personalColor;
  final String personalColorEn;
  final String tone;
  final String toneEn;
  final Map<String, double> details;
  final Map<String, ColorInfo> facialColors;
  
  PersonalColorResult.fromJson(Map<String, dynamic> json)
    : personalColor = json['personal_color'],
      personalColorEn = json['personal_color_en'],
      tone = json['tone'],
      toneEn = json['tone_en'],
      details = Map<String, double>.from(json['details']),
      facialColors = (json['facial_colors'] as Map).map(
        (key, value) => MapEntry(key, ColorInfo.fromJson(value))
      );
}
```

---

## Performance Optimization

### 1. Image Preprocessing
```python
# Resize large images before processing
def preprocess_image(image, max_size=1024):
    height, width = image.shape[:2]
    if width > max_size or height > max_size:
        scale = max_size / max(width, height)
        new_width = int(width * scale)
        new_height = int(height * scale)
        return cv2.resize(image, (new_width, new_height))
    return image
```

### 2. Caching Strategy
```python
from functools import lru_cache
import hashlib

@lru_cache(maxsize=100)
def get_cached_analysis(image_hash):
    # Cache analysis results for identical images
    pass

def generate_image_hash(image_data):
    return hashlib.md5(image_data).hexdigest()
```

### 3. Async Processing
```python
from concurrent.futures import ThreadPoolExecutor
import asyncio

executor = ThreadPoolExecutor(max_workers=4)

async def analyze_image_async(image_path):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, analyze_image_sync, image_path)
```

### 4. Load Balancing
```yaml
# nginx load balancing configuration
upstream api_servers {
    least_conn;
    server localhost:8001;
    server localhost:8002;
    server localhost:8003;
    server localhost:8004;
}

server {
    location / {
        proxy_pass http://api_servers;
    }
}
```

---

## Security Considerations

### 1. Input Validation
```python
# File type validation
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_image_file(file):
    if not file.content_type.startswith('image/'):
        raise ValueError("Invalid file type")
    
    # Check file size
    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    
    if size > MAX_FILE_SIZE:
        raise ValueError("File too large")
    
    # Verify actual file content
    header = file.read(512)
    file.seek(0)
    
    if not is_valid_image_header(header):
        raise ValueError("Invalid image file")
```

### 2. Rate Limiting
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100 per hour", "10 per minute"]
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/analyze")
@limiter.limit("5 per minute")
async def analyze_personal_color(request: Request, file: UploadFile):
    # Analysis logic
    pass
```

### 3. CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specific origins in production
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
    max_age=3600,
)
```

### 4. API Authentication (Optional)
```python
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/analyze")
async def analyze_personal_color(
    file: UploadFile = File(...),
    current_user: dict = Depends(verify_token)
):
    # Protected endpoint
    pass
```

---

## Testing

### Unit Tests
```python
# test_tone_analysis.py
import pytest
from personal_color_analysis.tone_analysis import is_warm, is_spr, is_smr

class TestToneAnalysis:
    def test_warm_tone_detection(self):
        # Warm tone sample
        warm_lab_b = [15.0, 14.0, 5.0]
        weights = [30, 20, 5]
        assert is_warm(warm_lab_b, weights) == 1
        
    def test_cool_tone_detection(self):
        # Cool tone sample
        cool_lab_b = [3.0, 4.0, 0.5]
        weights = [30, 20, 5]
        assert is_warm(cool_lab_b, weights) == 0
        
    def test_spring_detection(self):
        # Spring HSV saturation values
        spring_hsv_s = [20.0, 32.0, 26.0]
        weights = [10, 1, 1]
        assert is_spr(spring_hsv_s, weights) == 1
```

### Integration Tests
```python
# test_api_integration.py
import pytest
from fastapi.testclient import TestClient
from api import app

client = TestClient(app)

class TestAPI:
    def test_health_check(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        
    def test_analyze_valid_image(self):
        with open("test_images/face1.jpg", "rb") as f:
            response = client.post(
                "/analyze",
                files={"file": ("test.jpg", f, "image/jpeg")}
            )
        assert response.status_code == 200
        result = response.json()
        assert "personal_color" in result
        assert "facial_colors" in result
        
    def test_analyze_invalid_file(self):
        response = client.post(
            "/analyze",
            files={"file": ("test.txt", b"not an image", "text/plain")}
        )
        assert response.status_code == 400
```

### Load Testing
```python
# locustfile.py
from locust import HttpUser, task, between

class PersonalColorUser(HttpUser):
    wait_time = between(1, 3)
    
    @task
    def analyze_image(self):
        with open("test_image.jpg", "rb") as f:
            self.client.post(
                "/analyze",
                files={"file": ("test.jpg", f, "image/jpeg")}
            )
    
    @task
    def health_check(self):
        self.client.get("/health")
```

Run load test:
```bash
locust -f locustfile.py --host=http://localhost:8000
```

---

## Monitoring & Logging

### Logging Configuration
```python
import logging
from logging.handlers import RotatingFileHandler
import json
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# File handler with rotation
file_handler = RotatingFileHandler(
    'api.log',
    maxBytes=10485760,  # 10MB
    backupCount=5
)
file_handler.setLevel(logging.INFO)

# JSON formatter for structured logging
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        return json.dumps(log_data)

json_formatter = JSONFormatter()
file_handler.setFormatter(json_formatter)
logger = logging.getLogger(__name__)
logger.addHandler(file_handler)
```

### Request Tracking
```python
import uuid
from fastapi import Request

@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    logger.info(
        "Request processed",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "process_time": process_time
        }
    )
    
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

### Prometheus Metrics
```python
from prometheus_client import Counter, Histogram, generate_latest
from fastapi import Response

# Define metrics
request_count = Counter(
    'api_requests_total',
    'Total number of API requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'api_request_duration_seconds',
    'API request duration',
    ['method', 'endpoint']
)

analysis_duration = Histogram(
    'analysis_duration_seconds',
    'Personal color analysis duration'
)

@app.get("/metrics")
async def metrics():
    return Response(
        generate_latest(),
        media_type="text/plain"
    )

# Track metrics in endpoints
@app.post("/analyze")
async def analyze_personal_color(file: UploadFile):
    start_time = time.time()
    
    try:
        # Analysis logic
        result = await perform_analysis(file)
        
        request_count.labels(
            method="POST",
            endpoint="/analyze",
            status="200"
        ).inc()
        
        return result
    finally:
        duration = time.time() - start_time
        request_duration.labels(
            method="POST",
            endpoint="/analyze"
        ).observe(duration)
        analysis_duration.observe(duration)
```

### Health Check Endpoint Enhancement
```python
@app.get("/health")
async def detailed_health_check():
    health_status = {
        "status": "healthy",
        "service": "Personal Color Analysis API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {
            "database": check_database_connection(),
            "dlib_model": check_dlib_model(),
            "disk_space": check_disk_space(),
            "memory": check_memory_usage()
        }
    }
    
    # Overall status
    if not all(health_status["checks"].values()):
        health_status["status"] = "unhealthy"
        
    return health_status

def check_dlib_model():
    try:
        import os
        model_path = "../res/shape_predictor_68_face_landmarks.dat"
        return os.path.exists(model_path) and os.path.getsize(model_path) > 0
    except:
        return False

def check_disk_space():
    import shutil
    stat = shutil.disk_usage("/")
    # Return True if more than 10% free
    return (stat.free / stat.total) > 0.1

def check_memory_usage():
    import psutil
    # Return True if less than 90% memory used
    return psutil.virtual_memory().percent < 90
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Face Detection Failures
**Problem**: "얼굴을 찾을 수 없습니다" error

**Solutions**:
- Ensure image has clear, front-facing face
- Check image resolution (minimum 200x200 recommended)
- Verify lighting conditions
- Add face detection fallback:

```python
def detect_with_fallback(image):
    # Try different detection parameters
    for upsample in [0, 1, 2]:
        faces = detector(gray_image, upsample)
        if faces:
            return faces[0]
    
    # Try with different preprocessing
    enhanced = cv2.equalizeHist(gray_image)
    faces = detector(enhanced, 1)
    if faces:
        return faces[0]
    
    raise ValueError("No face detected")
```

#### 2. Color Extraction Issues
**Problem**: Incorrect color detection due to makeup/lighting

**Solutions**:
- Add white balance correction:
```python
def white_balance_correction(image):
    # Gray world assumption
    avg_b = np.mean(image[:, :, 0])
    avg_g = np.mean(image[:, :, 1])
    avg_r = np.mean(image[:, :, 2])
    avg_gray = (avg_b + avg_g + avg_r) / 3
    
    image[:, :, 0] = np.clip(image[:, :, 0] * (avg_gray / avg_b), 0, 255)
    image[:, :, 1] = np.clip(image[:, :, 1] * (avg_gray / avg_g), 0, 255)
    image[:, :, 2] = np.clip(image[:, :, 2] * (avg_gray / avg_r), 0, 255)
    
    return image.astype(np.uint8)
```

#### 3. Memory Issues
**Problem**: High memory usage with large images

**Solutions**:
- Implement image size limits
- Use streaming for large files
- Add garbage collection:

```python
import gc

@app.post("/analyze")
async def analyze_personal_color(file: UploadFile):
    try:
        # Process image
        result = await process_image(file)
        return result
    finally:
        # Force garbage collection
        gc.collect()
```

#### 4. Performance Issues
**Problem**: Slow analysis for high-resolution images

**Solutions**:
- Implement image pyramids
- Use multiprocessing for batch analysis
- Cache intermediate results:

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def cached_face_detection(image_hash):
    # Cache face detection results
    pass
```

### Debug Mode
Enable detailed debugging:

```python
# Set environment variable
DEBUG_MODE = os.getenv("DEBUG_MODE", "false").lower() == "true"

if DEBUG_MODE:
    # Save intermediate results
    cv2.imwrite("debug_face_detected.jpg", face_image)
    
    # Log detailed information
    logger.debug(f"Face landmarks: {landmarks}")
    logger.debug(f"Dominant colors: {colors}")
    logger.debug(f"Lab values: {lab_values}")
    logger.debug(f"HSV values: {hsv_values}")
```

### Error Codes Reference
| Code | Description | Solution |
|------|------------|----------|
| 400 | Invalid image format | Check file type and content |
| 404 | Endpoint not found | Verify API URL |
| 413 | File too large | Reduce image size |
| 422 | Validation error | Check request parameters |
| 500 | Internal server error | Check server logs |
| 503 | Service unavailable | Check server resources |

---

## Appendix

### A. Personal Color Theory
- **Warm Tone**: Higher Lab b values (yellow undertone)
- **Cool Tone**: Lower Lab b values (blue undertone)
- **Spring**: Warm + Clear (lower saturation)
- **Summer**: Cool + Soft (lower saturation)
- **Autumn**: Warm + Deep (higher saturation)
- **Winter**: Cool + Clear (higher saturation)

### B. Color Space Reference
- **RGB**: Device-dependent, 0-255 per channel
- **Lab**: Perceptually uniform, L(lightness), a(green-red), b(blue-yellow)
- **HSV**: Hue(0-360°), Saturation(0-100%), Value(0-100%)

### C. API Response Time Benchmarks
- Average response time: 200-500ms
- Face detection: 50-100ms
- Color extraction: 30-50ms per region
- Color space conversion: <10ms
- Total analysis: 150-300ms

### D. Resource Requirements
- **Minimum**: 2 CPU cores, 2GB RAM
- **Recommended**: 4 CPU cores, 4GB RAM
- **Storage**: 500MB for application + models
- **Network**: 10Mbps for smooth operation

---

## Version History
- v1.0.0 (2024-06-05): Initial API implementation
  - FastAPI integration
  - Basic personal color analysis
  - Web test interface

## Contact & Support
- GitHub Issues: [Report issues](https://github.com/starbucksdolcelatte/ShowMeTheColor/issues)
- API Documentation: [Swagger UI](http://localhost:8000/docs)

---

*This document is maintained for the ShowMeTheColor Personal Color Analysis API project.*
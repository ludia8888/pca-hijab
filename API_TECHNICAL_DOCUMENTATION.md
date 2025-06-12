# Personal Color Analysis API - Technical Documentation

**Last Updated**: 2025-01-13

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [AI API Specification](#ai-api-specification)
4. [Backend API Specification](#backend-api-specification)
5. [Frontend-Backend Communication](#frontend-backend-communication)
6. [Core Algorithm](#core-algorithm)
7. [Data Models](#data-models)
8. [Installation & Setup](#installation--setup)
9. [Deployment Guide](#deployment-guide)
10. [Frontend Integration](#frontend-integration)
11. [Performance Optimization](#performance-optimization)
12. [Security Considerations](#security-considerations)
13. [Testing](#testing)
14. [Monitoring & Logging](#monitoring--logging)
15. [Troubleshooting](#troubleshooting)

---

## Overview

### Project Description
Personal Color Analysis API is an AI-based system that analyzes user facial images to diagnose personal color types (Spring/Summer/Autumn/Winter) and provides hijab color recommendations.

### System Components
1. **AI API (ShowMeTheColor)**: Core personal color analysis engine
2. **Backend API**: Session management, recommendations, and admin functions
3. **Frontend**: User interface for analysis and results

### Technology Stack
#### AI API
- **Language**: Python 3.9+
- **Framework**: FastAPI
- **Face Detection**: dlib, OpenCV
- **ML/Scientific**: scikit-learn, scipy, numpy
- **Color Processing**: colormath
- **Server**: Uvicorn (ASGI)

#### Backend API
- **Language**: TypeScript
- **Framework**: Express.js 5.1.0
- **Database**: PostgreSQL (production) / In-memory (development)
- **Security**: Helmet, CORS, API key authentication

---

## Architecture

### System Architecture Diagram
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API    │────▶│     Database    │
│  (React/Vite)   │     │   (Express.js)   │     │  (PostgreSQL)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         │                       │
         └───────────┬───────────┘
                     ▼
              ┌──────────────────┐
              │     AI API       │
              │   (FastAPI)      │
              └──────────────────┘
```

### Service Ports
- Frontend: 5173 (development)
- Backend API: 5000
- AI API: 8000

---

## AI API Specification

### Base URL
```
http://localhost:8000
```

### Endpoints

#### 1. Health Check
```http
GET /health
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2024-06-06T12:00:00Z"
}
```

#### 2. Root Information
```http
GET /
```

**Response (200 OK):**
```json
{
  "name": "Personal Color Analysis API",
  "version": "1.0.0",
  "description": "AI-based personal color analysis service"
}
```

#### 3. Personal Color Analysis
```http
POST /analyze
```

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` (image file, JPEG/PNG/JPG)

**Response (200 OK):**
```json
{
  "personal_color": "가을 웜톤",
  "personal_color_en": "autumn",
  "tone": "웜톤",
  "tone_en": "warm",
  "details": {
    "best_colors": ["브릭레드", "머스타드", "카키"],
    "worst_colors": ["쿨핑크", "라벤더", "아이시블루"]
  },
  "facial_colors": {
    "skin": {
      "lab": [75.23, 12.45, 18.67],
      "hsv": [25.3, 0.28, 0.82],
      "hex": "#E8C5A0"
    },
    "eyebrow": {
      "lab": [42.15, 8.23, 15.45],
      "hsv": [35.2, 0.52, 0.48],
      "hex": "#7A5D3F"
    },
    "eye": {
      "lab": [35.67, 6.12, 10.34],
      "hsv": [38.5, 0.45, 0.38],
      "hex": "#614A35"
    }
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

---

## Backend API Specification

### Base URL
```
http://localhost:5000/api
```

### Authentication
Admin endpoints require API key authentication:
```
X-API-Key: [ADMIN_API_KEY]
```

### Public Endpoints

#### 1. Health Check
```http
GET /api/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "pca-hijab-backend",
  "timestamp": "2024-06-06T12:00:00Z",
  "database": "connected"
}
```

#### 2. Create Session
```http
POST /api/sessions
```

**Request:**
```json
{
  "instagramId": "@username"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "session_1234567890_abc",
    "instagramId": "@username",
    "createdAt": "2024-06-06T12:00:00Z"
  }
}
```

#### 3. Get Session
```http
GET /api/sessions/:sessionId
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "session_1234567890_abc",
    "instagramId": "@username",
    "createdAt": "2024-06-06T12:00:00Z"
  }
}
```

#### 4. Create Recommendation
```http
POST /api/recommendations
```

**Request:**
```json
{
  "sessionId": "session_1234567890_abc",
  "instagramId": "@username",
  "preferences": {
    "styles": ["modern", "elegant"],
    "fabricTypes": ["cotton", "silk"],
    "priceRange": "medium",
    "occasions": ["daily", "formal"]
  },
  "personalColorResult": {
    "personal_color_en": "Spring",
    "tone": "Warm",
    "details": {...}
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "rec_1234567890_xyz",
    "sessionId": "session_1234567890_abc",
    "instagramId": "@username",
    "status": "pending",
    "createdAt": "2024-06-06T12:00:00Z"
  }
}
```

#### 5. Get Recommendation
```http
GET /api/recommendations/:recommendationId
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "rec_1234567890_xyz",
    "sessionId": "session_1234567890_abc",
    "instagramId": "@username",
    "personalColorResult": {...},
    "preferences": {...},
    "status": "pending",
    "createdAt": "2024-06-06T12:00:00Z",
    "updatedAt": "2024-06-06T12:00:00Z"
  }
}
```

### Admin Endpoints

All admin endpoints require `X-API-Key` header authentication.

#### 1. Get Statistics
```http
GET /api/admin/statistics
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "byStatus": {
      "pending": 45,
      "processing": 30,
      "completed": 75
    },
    "byPersonalColor": {
      "Spring": 40,
      "Summer": 35,
      "Autumn": 45,
      "Winter": 30
    },
    "recentRequests": [...]
  }
}
```

#### 2. List Recommendations
```http
GET /api/admin/recommendations?limit=50&offset=0&status=pending
```

**Query Parameters:**
- `limit`: Number of results (1-100, default: 50)
- `offset`: Skip n results (default: 0)
- `status`: Filter by status (optional: pending/processing/completed)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "recommendations": [...],
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

#### 3. Get Recommendation Detail
```http
GET /api/admin/recommendations/:id
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "rec_1234567890_xyz",
    "sessionId": "session_1234567890_abc",
    "instagramId": "@username",
    "personalColorResult": {...},
    "preferences": {...},
    "status": "pending",
    "createdAt": "2024-06-06T12:00:00Z",
    "updatedAt": "2024-06-06T12:00:00Z"
  }
}
```

#### 4. Update Recommendation Status
```http
PATCH /api/admin/recommendations/:id/status
```

**Request:**
```json
{
  "status": "completed"
}
```

**Valid status values:** `pending`, `processing`, `completed`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "data": {
    "id": "rec_1234567890_xyz",
    "status": "completed",
    "updatedAt": "2024-06-06T12:00:00Z"
  }
}
```

---

## Frontend-Backend Communication

### Architecture Overview

#### Frontend (React + TypeScript)
- **Development Proxy**: Vite proxy configuration
- **Production**: Direct API calls with CORS
- **State Management**: Zustand + React Query
- **HTTP Client**: Axios

#### API Integration
- **Backend API**: Express.js (port 5001)
- **AI API**: FastAPI (port 8000)
- **CORS**: Configured for specific origins

### API Client Configuration

```typescript
// services/api/client.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const aiApiClient = axios.create({
  baseURL: AI_API_URL,
  timeout: 60000, // Longer timeout for AI processing
});

// Request interceptor for admin authentication
apiClient.interceptors.request.use(
  (config) => {
    const adminKey = localStorage.getItem('adminApiKey');
    if (adminKey && config.url?.includes('/admin')) {
      config.headers['X-API-Key'] = adminKey;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('adminApiKey');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);
```

### Service Layer Example

```typescript
// services/api/personalColor.ts
export class PersonalColorAPI {
  // AI Analysis
  async analyzeImage(file: File): Promise<PersonalColorResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await aiApiClient.post('/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data;
  }
  
  // Session Management
  async createSession(instagramId: string): Promise<Session> {
    const response = await apiClient.post('/api/sessions', { instagramId });
    return response.data.data;
  }
  
  // Recommendation
  async createRecommendation(data: RecommendationRequest): Promise<Recommendation> {
    const response = await apiClient.post('/api/recommendations', data);
    return response.data.data;
  }
}
```

---

## Core Algorithm

### Face Detection Process
1. **Face Detection**: dlib의 68-point face landmark detection
2. **Region Extraction**:
   - Skin: Cheek area (landmarks 1-17)
   - Eyebrow: Eyebrow region (landmarks 17-27)
   - Eye/Iris: Eye region (landmarks 36-48)

### Color Analysis Method
1. **Color Space Conversion**: RGB → Lab, HSV
2. **Representative Color Extraction**: K-means clustering (k=3)
3. **Tone Classification**:
   - Warm/Cool determination based on Lab 'b' value
   - Seasonal type based on HSV saturation and value

### Classification Rules
```python
def classify_tone(lab_b_value):
    return "warm" if lab_b_value > 0 else "cool"

def classify_season(tone, hsv_saturation, hsv_value):
    if tone == "warm":
        return "autumn" if hsv_saturation > 0.3 else "spring"
    else:
        return "winter" if hsv_value < 0.7 else "summer"
```

---

## Data Models

### PersonalColorResult
```typescript
interface PersonalColorResult {
  personal_color: string;      // Korean name
  personal_color_en: string;   // English name (spring/summer/autumn/winter)
  tone: string;               // Korean tone
  tone_en: string;            // English tone (warm/cool)
  details: {
    best_colors: string[];
    worst_colors: string[];
  };
  facial_colors: {
    skin: ColorData;
    eyebrow: ColorData;
    eye: ColorData;
  };
}

interface ColorData {
  lab: [number, number, number];
  hsv: [number, number, number];
  hex: string;
}
```

### Recommendation Models
```typescript
interface Session {
  id: string;
  instagramId: string;
  createdAt: Date;
}

interface Recommendation {
  id: string;
  sessionId: string;
  instagramId: string;
  personalColorResult: PersonalColorResult;
  preferences: UserPreferences;
  status: 'pending' | 'processing' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

interface UserPreferences {
  styles: string[];
  fabricTypes: string[];
  priceRange: string;
  occasions: string[];
}
```

---

## Installation & Setup

### AI API Setup
```bash
# Clone repository
git clone https://github.com/yourusername/pca-hijab.git
cd pca-hijab/ShowMeTheColor

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download dlib model
python download_model.py

# Run the API
cd src
python api.py
```

### Backend API Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Development
npm run dev

# Production
npm run build
npm start
```

### Environment Variables

#### AI API (.env)
```bash
# Optional - defaults work for development
HOST=0.0.0.0
PORT=8000
```

#### Backend API (.env)
```bash
# Server
NODE_ENV=development
PORT=5000

# Database (optional - uses in-memory if not set)
DATABASE_URL=postgresql://user:password@localhost:5432/pca_hijab

# Security
ADMIN_API_KEY=your-secure-admin-key

# Frontend
CLIENT_URL=http://localhost:5173
```

---

## Deployment Guide

### AI API Deployment (Heroku)

1. **Prepare Dockerfile**:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    cmake \
    build-essential \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Download dlib model
RUN python download_model.py

# Expose port
EXPOSE 8000

# Start the application
CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. **Deploy to Heroku**:
```bash
heroku create pca-hijab-ai-api
heroku container:push web
heroku container:release web
```

### Backend API Deployment (Render)

1. **Configure render.yaml** (already in project)
2. **Connect GitHub repository**
3. **Set environment variables in Render dashboard**
4. **Deploy automatically on push**

### Frontend Deployment (Vercel)

1. **Configure vercel.json** (already in project)
2. **Import project in Vercel dashboard**
3. **Set environment variables**:
   - `VITE_AI_API_URL`
   - `VITE_API_BASE_URL`
4. **Deploy automatically on push**

---

## Frontend Integration

### Complete Flow Example

```typescript
// pages/Analysis.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { personalColorAPI } from '@/services/api';

export function AnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleAnalysis = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      // 1. Create session
      const session = await personalColorAPI.createSession('@username');
      
      // 2. Analyze image
      const analysisResult = await personalColorAPI.analyzeImage(file);
      
      // 3. Store result
      localStorage.setItem('sessionId', session.id);
      localStorage.setItem('analysisResult', JSON.stringify(analysisResult));
      
      // 4. Navigate to results
      navigate('/result');
    } catch (error) {
      console.error('Analysis failed:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleAnalysis} disabled={!file || loading}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
    </div>
  );
}
```

---

## Performance Optimization

### AI API Optimization
1. **Image Preprocessing**:
   - Resize images to max 1024x1024
   - Convert to JPEG for smaller size
   - Client-side compression

2. **Caching**:
   - Cache dlib model in memory
   - Reuse face detector instance

3. **Async Processing**:
   - Use FastAPI's async endpoints
   - Background tasks for heavy processing

### Backend API Optimization
1. **Database**:
   - Connection pooling
   - Indexes on frequently queried fields
   - JSONB for flexible schema

2. **Caching**:
   - Redis for session data (future)
   - Query result caching

3. **Response Compression**:
   - Gzip compression enabled
   - Minimal response payloads

---

## Security Considerations

### AI API Security
1. **Input Validation**:
   - File type validation
   - File size limits (10MB)
   - Image format verification

2. **Rate Limiting**:
   - Per-IP rate limits
   - Concurrent request limits

### Backend API Security
1. **Authentication**:
   - API key for admin endpoints
   - Session validation

2. **Data Protection**:
   - Input sanitization
   - SQL injection prevention
   - XSS protection with Helmet.js

3. **CORS Configuration**:
   - Whitelist specific origins
   - Credentials handling

---

## Testing

### AI API Testing
```python
# test_api.py
import pytest
from fastapi.testclient import TestClient
from api import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_analyze_image():
    with open("test_image.jpg", "rb") as f:
        response = client.post(
            "/analyze",
            files={"file": ("test.jpg", f, "image/jpeg")}
        )
    assert response.status_code == 200
    assert "personal_color_en" in response.json()
```

### Backend API Testing
```typescript
// __tests__/api.test.ts
import request from 'supertest';
import app from '../src/index';

describe('API Tests', () => {
  test('GET /api/health', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
  });
  
  test('POST /api/sessions', async () => {
    const response = await request(app)
      .post('/api/sessions')
      .send({ instagramId: '@testuser' });
    expect(response.status).toBe(201);
    expect(response.body.data.instagramId).toBe('@testuser');
  });
});
```

---

## Monitoring & Logging

### Logging Strategy
1. **Application Logs**:
   - Request/response logging
   - Error logging with stack traces
   - Performance metrics

2. **Structured Logging**:
```typescript
// Example log format
{
  "timestamp": "2024-06-06T12:00:00Z",
  "level": "info",
  "service": "backend-api",
  "requestId": "uuid",
  "message": "Recommendation created",
  "metadata": {
    "userId": "@username",
    "personalColor": "spring"
  }
}
```

### Monitoring Tools
- **APM**: New Relic, DataDog
- **Logging**: LogDNA, Papertrail
- **Uptime**: Pingdom, UptimeRobot

---

## Troubleshooting

### Common Issues

#### AI API Issues
1. **"얼굴을 찾을 수 없습니다"**
   - Ensure image contains a clear face
   - Check image orientation
   - Verify dlib model is loaded

2. **Slow Analysis**
   - Check image size (recommend < 2MB)
   - Monitor CPU usage
   - Consider scaling horizontally

#### Backend API Issues
1. **Database Connection Failed**
   - Verify DATABASE_URL
   - Check PostgreSQL is running
   - Review connection pool settings

2. **CORS Errors**
   - Verify CLIENT_URL in environment
   - Check request headers
   - Review CORS configuration

#### Integration Issues
1. **404 Errors**
   - Check API base URLs
   - Verify proxy configuration
   - Review route definitions

2. **Authentication Failures**
   - Verify API key is set
   - Check header format
   - Review middleware order

---

## Version History

### v3.0.0 (December 2024)
- Separated AI and Backend APIs
- Added admin dashboard with X-API-Key authentication
- PostgreSQL integration with in-memory fallback
- Improved error handling
- CI/CD pipeline configuration
- Helmet.js security integration

### v2.0.0 (December 2024)
- Added hijab recommendation system
- User preference collection
- Session management

### v1.0.0 (November 2024)
- Initial release
- Personal color analysis
- Basic API endpoints

---

## Contact & Support

- **GitHub**: [github.com/yourusername/pca-hijab](https://github.com/yourusername/pca-hijab)
- **Issues**: [GitHub Issues](https://github.com/yourusername/pca-hijab/issues)
- **Documentation**: This document

---

*Last Updated: January 2025*
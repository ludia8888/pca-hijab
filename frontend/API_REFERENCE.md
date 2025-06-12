# Frontend API Reference

This document outlines all API endpoints used by the PCA-HIJAB frontend application.

## Base URLs

- **Backend API**: `http://localhost:5001` (development) 
- **AI Service**: `http://localhost:8000` (ShowMeTheColor API)

## Authentication

Admin endpoints require an API key passed in the `x-api-key` header.

## Endpoints

### AI Analysis Service

#### POST `/analyze`
Analyzes an uploaded image to determine personal color.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: 
  - `file`: Image file (JPEG, PNG, HEIC)
  
**Response:**
```typescript
{
  personal_color: string;        // e.g., "봄 웜톤"
  personal_color_en: 'spring' | 'summer' | 'autumn' | 'winter';
  tone: string;                  // e.g., "웜톤"
  tone_en: 'warm' | 'cool';
  confidence: number;            // 0-100
  best_colors: string[];         // Hex color codes
  worst_colors: string[];        // Hex color codes
}
```

#### GET `/health`
Health check for AI service.

**Response:**
```typescript
{
  status: string;
  service: string;
}
```

### Session Management

#### POST `/api/sessions`
Creates a new analysis session.

**Request:**
```typescript
{
  deviceId: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    id: string;
    deviceId: string;
    createdAt: Date;
    updatedAt: Date;
  }
}
```

#### GET `/api/sessions/:sessionId`
Retrieves session details.

**Response:**
```typescript
{
  success: boolean;
  data: {
    id: string;
    deviceId: string;
    personalColorResult?: PersonalColorResult;
    createdAt: Date;
    updatedAt: Date;
  }
}
```

#### PATCH `/api/sessions/:sessionId`
Updates session with analysis results.

**Request:**
```typescript
{
  personalColorResult: PersonalColorResult;
}
```

### Recommendations

#### POST `/api/recommendations`
Creates a new recommendation request.

**Request:**
```typescript
{
  sessionId: string;
  instagramId: string;
  personalColorResult: PersonalColorResult;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    id: string;
    sessionId: string;
    instagramId: string;
    personalColorResult: PersonalColorResult;
    status: 'pending' | 'processing' | 'completed';
    createdAt: Date;
    updatedAt: Date;
  }
}
```

#### GET `/api/recommendations/:id`
Retrieves recommendation status.

**Response:**
```typescript
{
  success: boolean;
  data: Recommendation;
}
```

### Admin Endpoints

All admin endpoints require `x-api-key` header.

#### GET `/api/admin/recommendations`
Lists all recommendations with optional filtering.

**Query Parameters:**
- `status`: Filter by status (optional)
- `limit`: Number of results (default: 50, max: 100)
- `offset`: Pagination offset (default: 0)

**Response:**
```typescript
{
  success: boolean;
  data: {
    recommendations: Recommendation[];
    total: number;
    limit: number;
    offset: number;
  }
}
```

#### GET `/api/admin/recommendations/:id`
Get single recommendation details.

#### PATCH `/api/admin/recommendations/:id/status`
Update recommendation status.

**Request:**
```typescript
{
  status: 'pending' | 'processing' | 'completed';
}
```

#### GET `/api/admin/statistics`
Get overall statistics.

**Response:**
```typescript
{
  success: boolean;
  data: {
    total: number;
    byStatus: {
      pending: number;
      processing: number;
      completed: number;
    };
    byPersonalColor: Record<string, number>;
    recentRequests: Array<{
      id: string;
      instagramId: string;
      personalColor: string;
      status: string;
      createdAt: Date;
    }>;
  }
}
```

## Error Handling

All API errors follow this format:

```typescript
{
  error: string;
  detail?: string;
  code?: string;
}
```

Common error codes:
- `NETWORK_ERROR`: Network connection failed
- `REQUEST_ERROR`: Request configuration error
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Missing or invalid authentication

## Usage Examples

### Personal Color Analysis
```typescript
import { PersonalColorAPI } from '@/services/api';

const file = new File(['...'], 'photo.jpg', { type: 'image/jpeg' });
const result = await PersonalColorAPI.analyzeImage(file);
```

### Create Recommendation
```typescript
import { RecommendationAPI } from '@/services/api';

const recommendation = await RecommendationAPI.createRecommendation({
  sessionId: 'session-123',
  instagramId: '@username',
  personalColorResult: result
});
```

### Admin Dashboard
```typescript
import { AdminAPI } from '@/services/api';

// Get pending recommendations
const { recommendations } = await AdminAPI.getRecommendations(apiKey, {
  status: 'pending',
  limit: 20
});

// Update status
await AdminAPI.updateRecommendationStatus(apiKey, recommendationId, 'completed');
```
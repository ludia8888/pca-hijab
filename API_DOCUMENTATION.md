# API Technical Documentation

## Overview

PCA-HIJAB 프로젝트의 API 통신 구조 및 엔드포인트 명세 문서입니다.

## Architecture

### Frontend (React)
- **Base URL**: Vite proxy를 통한 `/api` 경로
- **실제 Backend URL**: `http://localhost:8000`
- **통신 방식**: Axios 기반 REST API

### Backend (Python FastAPI)
- **Framework**: FastAPI
- **Port**: 8000
- **CORS**: 모든 origin 허용 (개발 환경)

## API Endpoints

### 1. Health Check

서버 상태를 확인합니다.

```
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "PersonalColorAnalysisAPI"
}
```

### 2. Personal Color Analysis

이미지를 업로드하여 퍼스널 컬러를 분석합니다.

```
POST /api/analyze
Content-Type: multipart/form-data
```

**Request:**
- `file`: 이미지 파일 (JPEG, PNG 지원)
- `debug` (optional): 디버그 정보 포함 여부

**Response:**
```json
{
  "personal_color": "가을 웜톤",
  "personal_color_en": "fall",
  "tone": "웜톤",
  "tone_en": "warm",
  "details": {
    "is_warm": 1,
    "skin_lab_b": 15.2,
    "eyebrow_lab_b": 12.5,
    "eye_lab_b": 8.3,
    "skin_hsv_s": 0.3,
    "eyebrow_hsv_s": 0.4,
    "eye_hsv_s": 0.2
  },
  "facial_colors": {
    "cheek": {
      "rgb": [255, 200, 180],
      "lab": [80, 15, 20],
      "hsv": [15, 0.3, 1]
    },
    "eyebrow": {
      "rgb": [120, 80, 60],
      "lab": [40, 10, 15],
      "hsv": [20, 0.5, 0.5]
    },
    "eye": {
      "rgb": [80, 60, 50],
      "lab": [30, 5, 10],
      "hsv": [20, 0.4, 0.3]
    }
  },
  "confidence": 0.85
}
```

**Error Response:**
```json
{
  "error": "No face detected",
  "detail": "얼굴을 찾을 수 없습니다. 정면 사진을 업로드해주세요."
}
```

### 3. Hijab Recommendation (MVP Mock)

히잡 추천을 요청합니다. (현재 Mock 응답)

```
POST /api/recommendations
Content-Type: application/json
```

**Request:**
```json
{
  "instagramId": "user_instagram",
  "personalColorResult": {
    // Personal color analysis result
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

**Response:**
```json
{
  "success": true,
  "message": "추천 요청이 성공적으로 전송되었습니다",
  "recommendationId": "rec_1234567890"
}
```

### 4. Recommendation Status

추천 상태를 조회합니다. (현재 Mock 응답)

```
GET /api/recommendations/{recommendationId}/status
```

**Response:**
```json
{
  "status": "pending",
  "updatedAt": "2024-06-06T12:00:00Z"
}
```

## Frontend API Service Structure

### API Client Configuration

```typescript
// services/api/client.ts
const apiClient = axios.create({
  baseURL: API_BASE_URL, // '/api' for proxy
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Service Classes

1. **PersonalColorAPI**
   - `analyzeImage(file: File, debug?: boolean)`
   - `healthCheck()`

2. **RecommendationAPI**
   - `submitRecommendation(data: RecommendationRequest)`
   - `getRecommendationStatus(recommendationId: string)`

## Error Handling

### Frontend Error Types
- Network errors: 네트워크 연결 실패
- Timeout errors: 요청 시간 초과 (30초)
- API errors: 서버에서 반환한 에러

### Error Response Format
```json
{
  "error": "Error type",
  "detail": "Detailed error message",
  "code": "ERROR_CODE" // optional
}
```

## Development Notes

### CORS Configuration
개발 환경에서는 Vite proxy를 사용하여 CORS 문제를 해결합니다.

```javascript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  }
}
```

### Image Processing
- 최대 파일 크기: 5MB
- 자동 압축: quality 0.8
- 지원 포맷: JPEG, PNG, HEIC (Safari only)

### Rate Limiting
현재 구현되지 않음. 프로덕션 환경에서 추가 예정.

### Authentication
현재 구현되지 않음. Instagram ID 기반 식별만 사용.

## Testing

### Mock Responses
개발 환경에서 백엔드 없이 테스트할 때 사용:

```typescript
// Mock response in catch block
return {
  success: true,
  message: '추천 요청이 성공적으로 전송되었습니다',
  recommendationId: `rec_${Date.now()}`
};
```

### API Testing Tools
- Postman Collection: `docs/postman/pca-hijab.json`
- cURL examples: `docs/api-examples.md`

## Future Improvements

1. **Authentication**: JWT 기반 인증 시스템
2. **Rate Limiting**: IP 기반 요청 제한
3. **Caching**: Redis를 활용한 분석 결과 캐싱
4. **WebSocket**: 실시간 분석 진행 상태 업데이트
5. **File Upload**: S3 직접 업로드 구현
# PCA-HIJAB Backend API

Express.js backend API for the PCA-HIJAB personal color analysis and hijab recommendation service.

## Overview

This backend provides RESTful APIs for:
- Session management
- Recommendation tracking
- Admin dashboard
- Integration with AI analysis service

## Tech Stack

- **Framework**: Express.js 5.1.0
- **Language**: TypeScript
- **Database**: In-memory storage (PostgreSQL ready)
- **Security**: Helmet, CORS, API key authentication
- **Server Port**: 5001

## API Endpoints

### Public Endpoints

#### Health Check
```http
GET /api/health
```
Returns service health status and database connectivity.

#### Create Session
```http
POST /api/sessions
Content-Type: application/json

{
  "instagramId": "@username"
}
```

#### Get Session
```http
GET /api/sessions/:sessionId
```

#### Create Recommendation
```http
POST /api/recommendations
Content-Type: application/json

{
  "sessionId": "ses123",
  "instagramId": "@username",
  "preferences": {
    "styles": ["modern", "elegant"],
    "fabricTypes": ["cotton", "silk"],
    "priceRange": "medium",
    "occasions": ["daily", "formal"]
  },
  "personalColorResult": {
    "personalColor": "Spring",
    "tone": "Warm",
    "details": {...}
  }
}
```

#### Get Recommendation
```http
GET /api/recommendations/:recommendationId
```

### Admin Endpoints

All admin endpoints require authentication via API key header:
```
X-API-Key: [ADMIN_API_KEY]
```

#### Admin Statistics
```http
GET /api/admin/statistics
```
Returns usage statistics including session counts and recommendation status breakdown.

#### List Recommendations
```http
GET /api/admin/recommendations?page=1&limit=20
```
Paginated list of all recommendations with filtering support.

#### Get Recommendation Detail
```http
GET /api/admin/recommendations/:id
```
Detailed information about a specific recommendation.

#### Update Recommendation Status
```http
PUT /api/admin/recommendations/:id/status
Content-Type: application/json

{
  "status": "completed"
}
```

## Environment Variables

```bash
# Required
PORT=5001                    # Server port
NODE_ENV=production         # Environment (development/production)
ADMIN_API_KEY=your-key      # Admin authentication key

# Optional
DATABASE_URL=postgresql://...  # PostgreSQL connection (if available)
CLIENT_URL=https://...        # Frontend URL for CORS
```

## Installation

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build
npm start

# Testing
npm test

# Linting
npm run lint
```

## Database

The application uses an in-memory database by default with automatic fallback. When `DATABASE_URL` is provided, it connects to PostgreSQL.

### Schema

#### Sessions Table
- `id` (UUID)
- `instagramId` (string)
- `createdAt` (timestamp)

#### Recommendations Table
- `id` (UUID)
- `sessionId` (UUID, FK)
- `instagramId` (string)
- `preferences` (JSON)
- `personalColorResult` (JSON)
- `status` (pending/completed)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

## Security

- API key authentication for admin routes
- CORS configured for specific origins
- Helmet.js for security headers
- Input validation on all endpoints
- Rate limiting recommended for production

## Error Handling

All errors follow a consistent format:
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400
  }
}
```

## Development

```bash
# Watch mode
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Fix lint issues
npm run lint:fix
```

## Production Deployment

1. Set environment variables
2. Build the application: `npm run build`
3. Start the server: `npm start`
4. Configure reverse proxy (nginx/Apache)
5. Set up SSL certificates
6. Enable monitoring and logging

## License

MIT
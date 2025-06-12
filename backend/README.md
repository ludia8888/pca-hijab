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

**Important**: The `ADMIN_API_KEY` environment variable must be set in production. The server will fail to start if this is not configured.

#### Admin Statistics
```http
GET /api/admin/statistics
```
Returns usage statistics including session counts and recommendation status breakdown.

#### List Recommendations
```http
GET /api/admin/recommendations?limit=50&offset=0&status=pending
```
Paginated list of all recommendations with filtering support.

Query parameters:
- `limit`: Number of results (1-100, default: 50)
- `offset`: Skip n results (default: 0)
- `status`: Filter by status (optional: pending/processing/completed)

#### Get Recommendation Detail
```http
GET /api/admin/recommendations/:id
```
Detailed information about a specific recommendation.

#### Update Recommendation Status
```http
PATCH /api/admin/recommendations/:id/status
Content-Type: application/json

{
  "status": "completed"
}
```

Valid status values: `pending`, `processing`, `completed`

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
npm test  # Note: Test script not yet implemented

# Linting
npm run lint
```

## Database

The application supports both in-memory storage (development) and PostgreSQL (production).

- **Development**: Uses in-memory storage by default if `DATABASE_URL` is not set
- **Production**: Requires PostgreSQL via `DATABASE_URL` environment variable

**Note**: In production mode (`NODE_ENV=production`), the server will fail to start without a valid `DATABASE_URL`.

### Schema

#### Sessions Table
- `id` (VARCHAR) - Auto-generated session identifier
- `instagram_id` (VARCHAR) - User's Instagram handle
- `created_at` (TIMESTAMP) - Creation timestamp

#### Recommendations Table
- `id` (VARCHAR) - Auto-generated recommendation identifier
- `session_id` (VARCHAR, FK) - Reference to sessions table
- `instagram_id` (VARCHAR) - User's Instagram handle
- `user_preferences` (JSONB) - User style preferences
- `personal_color_result` (JSONB) - AI analysis result
- `status` (VARCHAR) - pending/processing/completed
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

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

### Render Deployment

The project includes Render configuration (`render.yaml`):

1. Connect GitHub repository to Render
2. Environment variables are automatically configured:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `ADMIN_API_KEY` (auto-generated)
   - Set `CLIENT_URL` and `DATABASE_URL` manually
3. Deployment is automatic on git push

### Manual Deployment

1. Set all required environment variables
2. Build: `npm run build`
3. Start: `npm start`
4. Configure reverse proxy (nginx/Apache)
5. Set up SSL certificates
6. Enable monitoring and logging

## License

MIT
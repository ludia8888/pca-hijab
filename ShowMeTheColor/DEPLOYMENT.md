# ShowMeTheColor API Deployment Guide

## Local Development Setup

### 1. Create Virtual Environment
```bash
cd ShowMeTheColor
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the API
```bash
cd src
# Use api_simple.py for stability (recommended)
python api_simple.py

# Or use the full API (requires dlib installation)
python api.py
```

## CORS Configuration

The API is configured to allow requests from the following origins:
- http://localhost:3000
- http://localhost:5173
- http://localhost:5174
- https://pca-hijab.vercel.app
- https://noorai-ashy.vercel.app
- https://noorai.vercel.app
- * (wildcard as fallback)

## Production Deployment (Render)

### Important: Deploy the Updated CORS Configuration

1. Push the updated `api.py` to your repository
2. In Render dashboard, trigger a manual deploy or wait for automatic deploy
3. Ensure the build uses the updated code with new CORS settings

### Environment Variables
No special environment variables required for CORS

### Build Command
```bash
pip install -r requirements.txt
```

### Start Command
```bash
cd src && python api_simple.py
```

## Testing CORS

### Test preflight request:
```bash
curl -X OPTIONS https://showmethecolor-api.onrender.com/analyze \
  -H "Origin: https://noorai-ashy.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Expected response should include:
```
access-control-allow-origin: https://noorai-ashy.vercel.app
```

## Troubleshooting

### Port Already in Use
```bash
lsof -i :8000
kill <PID>
```

### Missing Dependencies
- If `dlib` module is missing, use `api_simple.py` instead
- `dlib` requires additional system dependencies and can be complex to install

### Python Environment Issues on macOS
Use virtual environment to avoid "externally-managed-environment" error

## Notes
- The `api_simple.py` is more stable and recommended for production
- Always test CORS configuration after deployment
- Monitor API logs for any CORS-related errors
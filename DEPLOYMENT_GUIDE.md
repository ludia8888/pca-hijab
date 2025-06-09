# PCA-HIJAB Complete Deployment Guide

This document explains step-by-step how to deploy the PCA-HIJAB project from start to finish.

## 📋 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [GitHub Repository Setup](#-github-repository-setup)
3. [Frontend Deployment (Vercel)](#-frontend-deployment-vercel)
4. [Backend Deployment (Render)](#-backend-deployment-render)
5. [AI API Deployment Options](#-ai-api-deployment-options)
6. [Post-Deployment Configuration](#-post-deployment-configuration)
7. [Monitoring & Optimization](#-monitoring--optimization)
8. [Troubleshooting](#-troubleshooting)

## 🔧 Prerequisites

### Required Accounts
- [ ] GitHub account
- [ ] Vercel account (can login with GitHub)
- [ ] Render account (can login with GitHub)
- [ ] Optional: AWS/GCP account for AI API deployment

### Local Environment Check
```bash
# Check Node.js version (18.0.0+ required)
node --version

# Check Git installation
git --version

# Test project builds
cd frontend && npm run build
cd ../backend && npm run build
```

## 🐙 GitHub Repository Setup

### 1. Create New Repository
1. Go to GitHub.com
2. Click "New repository"
3. Repository name: `pca-hijab`
4. Choose Public/Private
5. Click "Create repository"

### 2. Connect Local Project
```bash
# In project root directory
cd /Users/sihyun/Desktop/pca-hijab

# Initialize Git (skip if already done)
git init

# Add all files
git add .

# First commit
git commit -m "feat: Initial commit - PCA-HIJAB MVP"

# Connect remote repository
git remote add origin https://github.com/YOUR_USERNAME/pca-hijab.git

# Set main branch and push
git branch -M main
git push -u origin main
```

## 🚀 Frontend Deployment (Vercel)

### 1. Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Connect GitHub account (if first time)
5. Select `pca-hijab` repository and click "Import"

### 2. Project Configuration

**Framework Preset**: Select Vite

**Root Directory**: Enter `frontend`

**Build and Output Settings**:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 3. Environment Variables

In "Environment Variables" section, add:

```
VITE_AI_API_URL=http://localhost:8000
VITE_API_BASE_URL=https://pca-hijab-backend.onrender.com/api
```

⚠️ **Important**: Backend should be deployed first to get the URL. You can use localhost temporarily and update later.

### 4. Deploy

1. Click "Deploy" button
2. Monitor deployment progress (takes ~2-3 minutes)
3. Note the provided URL (e.g., `https://pca-hijab.vercel.app`)

### 5. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add custom domain if available

## 🖥 Backend Deployment (Render)

### 1. Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Select "Build and deploy from a Git repository"
4. "Connect GitHub" (if first time)
5. Select `pca-hijab` repository

### 2. Service Configuration

**Name**: `pca-hijab-backend`

**Region**: Singapore (for Asia) or Oregon (for US)

**Branch**: `main`

**Root Directory**: `backend`

**Runtime**: Node

**Build Command**: 
```bash
npm install && npm run build
```

**Start Command**:
```bash
npm start
```

### 3. Environment Variables

In "Environment" tab, add:

```
NODE_ENV=production
PORT=10000
CLIENT_URL=https://pca-hijab.vercel.app
JWT_SECRET=your-super-secret-jwt-key-change-this
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

⚠️ **Important**: 
- Set `CLIENT_URL` to your Vercel Frontend URL
- Change `JWT_SECRET` to a strong random string
- Configure `DATABASE_URL` if using PostgreSQL

### 4. Deploy

1. Click "Create Web Service"
2. First deployment starts automatically (~5-10 minutes)
3. Note the provided URL (e.g., `https://pca-hijab-backend.onrender.com`)

### 5. Health Check

```bash
# Test Backend API health
curl https://pca-hijab-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "pca-hijab-backend",
  "timestamp": "2024-01-06T..."
}
```

## 🤖 AI API Deployment Options

### Option 1: Docker on Cloud Run (Google Cloud)

1. **Create Dockerfile** for ShowMeTheColor API:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
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
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8080"]
```

2. **Deploy to Cloud Run**:
```bash
# Build and push image
gcloud builds submit --tag gcr.io/PROJECT_ID/pca-hijab-ai

# Deploy to Cloud Run
gcloud run deploy pca-hijab-ai \
  --image gcr.io/PROJECT_ID/pca-hijab-ai \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi
```

### Option 2: Heroku Deployment

1. **Create `Procfile`**:
```
web: cd src && uvicorn api:app --host 0.0.0.0 --port $PORT
```

2. **Deploy**:
```bash
heroku create pca-hijab-ai
heroku buildpacks:set heroku/python
git push heroku main
```

### Option 3: AWS EC2/ECS

1. **ECS Task Definition**:
```json
{
  "family": "pca-hijab-ai",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [{
    "name": "ai-api",
    "image": "your-ecr-repo/pca-hijab-ai:latest",
    "portMappings": [{
      "containerPort": 8000,
      "protocol": "tcp"
    }],
    "environment": [
      {"name": "PORT", "value": "8000"}
    ]
  }]
}
```

### Option 4: Keep Local (Development Only)

For MVP/development, you can run the AI API locally:
```bash
cd ShowMeTheColor/src
python api.py
```

Then use ngrok to expose it:
```bash
ngrok http 8000
```

## 🔄 Post-Deployment Configuration

### 1. Update Frontend Environment Variables

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Update `VITE_API_BASE_URL` with actual Backend URL:
   ```
   VITE_API_BASE_URL=https://pca-hijab-backend.onrender.com/api
   ```
3. If AI API is deployed, update:
   ```
   VITE_AI_API_URL=https://your-ai-api-url.com
   ```
4. Redeploy:
   - Go to Deployments tab → Latest deployment → "..." menu → "Redeploy"

### 2. CORS Configuration

Ensure Backend allows Frontend URL:
- Check CORS settings in `backend/src/index.ts`
- Verify `CLIENT_URL` environment variable

### 3. Feature Testing

1. **Main Flow Test**:
   - Enter Instagram ID
   - Upload image
   - AI analysis
   - Submit recommendation form

2. **API Endpoint Tests**:
   ```bash
   # Create session
   curl -X POST https://pca-hijab-backend.onrender.com/api/sessions \
     -H "Content-Type: application/json" \
     -d '{"instagramId": "test_user"}'
   
   # Health check
   curl https://pca-hijab-backend.onrender.com/api/health
   ```

## 📊 Monitoring & Optimization

### Performance Monitoring

#### Frontend (Vercel)
- **Vercel Analytics**: Automatic Web Vitals tracking
- **Speed Insights**: Available with Vercel Speed Insights integration
- **Error Tracking**: Integrate Sentry or LogRocket

#### Backend (Render)
- **Logs**: Available in Render dashboard
- **Metrics**: CPU, Memory usage visible in dashboard
- **Uptime Monitoring**: Use UptimeRobot or Pingdom

### Optimization Tips

#### Frontend
1. **Enable Vercel Edge Functions** for faster responses
2. **Image Optimization**:
   ```javascript
   // next.config.js (if using Next.js)
   module.exports = {
     images: {
       domains: ['your-image-domain.com'],
     },
   }
   ```
3. **Code Splitting**: Already enabled with Vite
4. **Caching Headers**: Configure in `vercel.json`

#### Backend
1. **Database Connection Pooling**
2. **Response Compression**:
   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```
3. **Rate Limiting**:
   ```typescript
   import rateLimit from 'express-rate-limit';
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   ```

### Security Checklist

- [ ] All API keys in environment variables
- [ ] `.env` files in `.gitignore`
- [ ] Strong JWT_SECRET
- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (if using DB)
- [ ] XSS protection headers

## 🐛 Troubleshooting

### Vercel Deployment Issues

**Issue**: Build failure
```
Error: Cannot find module '@/components/...'
```

**Solution**:
1. Check `tsconfig.json` paths configuration
2. Verify `vite.config.ts` alias settings
3. Ensure all import paths are correct

---

**Issue**: Missing environment variables
```
ReferenceError: process is not defined
```

**Solution**:
1. Add all `VITE_` variables to Vercel environment
2. Ensure variable names start with `VITE_`
3. Use `import.meta.env` instead of `process.env`

### Render Deployment Issues

**Issue**: Build failure
```
npm ERR! code ENOENT
```

**Solution**:
1. Verify Root Directory is set to `backend`
2. Check `package.json` exists in backend folder
3. Ensure all dependencies are listed

---

**Issue**: Server start failure
```
Error: Cannot find module '/opt/render/project/src/dist/index.js'
```

**Solution**:
1. Verify Build Command includes `npm run build`
2. Check `tsconfig.json` outDir is `./dist`
3. Ensure TypeScript compilation succeeds

### CORS Errors

**Issue**: 
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solution**:
1. Check Backend `CLIENT_URL` environment variable
2. Verify Frontend URL is correct (including https)
3. Update CORS configuration:
   ```typescript
   app.use(cors({
     origin: process.env.CLIENT_URL || 'http://localhost:5173',
     credentials: true
   }));
   ```

### AI API Connection Issues

**Issue**: Cannot connect to AI API
```
Error: ECONNREFUSED
```

**Solution**:
1. If local: Ensure ShowMeTheColor API is running
2. If deployed: Update `VITE_AI_API_URL`
3. Check firewall/security group settings
4. Verify API health endpoint

### Image Upload Issues

**Issue**: File too large
```
PayloadTooLargeError: request entity too large
```

**Solution**:
1. Implement client-side compression
2. Increase server limit:
   ```typescript
   app.use(express.json({ limit: '10mb' }));
   app.use(express.urlencoded({ limit: '10mb', extended: true }));
   ```
3. Use image optimization service

## 📱 Mobile Testing

### Local Network Testing
```bash
# Expose frontend dev server to network
cd frontend
npm run dev -- --host
```

### Real Device Testing
1. Connect phone and computer to same WiFi
2. Access via computer's IP (e.g., `http://192.168.1.100:5173`)
3. Allow camera permissions
4. Test image upload and camera capture

## 🚀 Continuous Deployment

### GitHub Actions Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install and Test Frontend
      run: |
        cd frontend
        npm ci
        npm run typecheck
        npm run test
    
    - name: Install and Test Backend
      run: |
        cd backend
        npm ci
        npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Trigger Vercel Deployment
      run: |
        curl -X POST ${{ secrets.VERCEL_DEPLOY_HOOK }}
```

### Deployment Hooks
1. **Vercel**: Project Settings → Git → Deploy Hooks
2. **Render**: Automatic deployment on GitHub push
3. **AI API**: Configure webhook for your chosen platform

## 🔄 Rollback Strategy

### Vercel Rollback
1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Render Rollback
1. Go to Events tab
2. Find previous successful deploy
3. Click "Rollback to this deploy"

## 📊 Cost Optimization

### Free Tier Limits
- **Vercel**: 100GB bandwidth, unlimited deployments
- **Render**: 750 hours/month, spins down after 15 min inactivity
- **Cloud Run**: 2 million requests/month free

### Cost Saving Tips
1. Use Vercel Edge Functions for API routes
2. Implement caching strategies
3. Optimize images before upload
4. Use CDN for static assets
5. Monitor usage regularly

## 📞 Support Resources

### Documentation
- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Cloud Run Docs**: https://cloud.google.com/run/docs

### Community
- **Discord**: Join Vercel/Render Discord servers
- **Stack Overflow**: Tag with `vercel`, `render-com`
- **GitHub Issues**: Project-specific issues

### Emergency Contacts
- **Vercel Support**: support@vercel.com
- **Render Support**: support@render.com
- **Project Maintainer**: Create GitHub issue

---

Last Updated: January 6, 2025
Version: 2.0
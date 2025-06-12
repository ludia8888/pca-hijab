# 🚀 PCA-HIJAB Deployment Checklist

## Prerequisites

### 1. Accounts Required
- [ ] Vercel account (Frontend hosting)
- [ ] Render/Railway account (Backend hosting)
- [ ] PostgreSQL database (Supabase/Neon/Render)
- [ ] GitHub account with repository access

### 2. AI API Setup
Choose one of the following options for the ShowMeTheColor AI API:
- [ ] Option 1: Deploy to Google Cloud Run
- [ ] Option 2: Deploy to Heroku
- [ ] Option 3: Deploy to AWS EC2
- [ ] Option 4: Use existing deployment

## Frontend Deployment (Vercel)

### 1. Initial Setup
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Select `frontend` as root directory
4. Framework preset: Vite

### 2. Environment Variables
Add these in Vercel dashboard:
```
VITE_AI_API_URL=<your-ai-api-url>
VITE_API_BASE_URL=<your-backend-url>/api
```

### 3. Build Settings
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Backend Deployment (Render)

### 1. Initial Setup
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Select `backend` as root directory

### 2. Environment Variables
Add these in Render dashboard:
```
NODE_ENV=production
PORT=10000
CLIENT_URL=https://your-frontend.vercel.app
DATABASE_URL=postgresql://... (optional - uses in-memory if not set)
ADMIN_API_KEY=<generate-secure-key>
```

### 3. Build Settings
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Runtime: Node
- Auto-Deploy: Enable for main branch

## Database Setup (PostgreSQL)

### Option 1: Supabase (Recommended)
1. Create project at [supabase.com](https://supabase.com)
2. Get connection string from Settings > Database
3. Run schema:
```sql
-- Copy contents from backend/src/db/schema.sql
```

### Option 2: Render PostgreSQL
1. Create PostgreSQL instance in Render
2. Get internal connection string
3. Run schema using Render's PSQL console

## GitHub Secrets Configuration

Add these secrets in GitHub repository settings:

### Required Secrets
```
VERCEL_TOKEN=<from-vercel-account-settings>
VERCEL_ORG_ID=<from-vercel-project-settings>
VERCEL_PROJECT_ID=<from-vercel-project-settings>
RENDER_SERVICE_ID=<from-render-dashboard>
RENDER_API_KEY=<from-render-account-settings>
```

### Optional Secrets
```
SLACK_WEBHOOK=<for-deployment-notifications>
CODECOV_TOKEN=<for-coverage-reports>
```

## Post-Deployment Checklist

### 1. Frontend Verification
- [ ] Homepage loads correctly
- [ ] Instagram ID validation works
- [ ] Image upload functional
- [ ] AI analysis returns results
- [ ] Result card generation works
- [ ] Recommendation form submits

### 2. Backend Verification
- [ ] Health check endpoint responds (`/api/health`)
- [ ] Session creation works
- [ ] Recommendation storage works
- [ ] Admin login functional
- [ ] Database connection stable

### 3. Admin Panel Setup
1. Access `/admin/login`
2. Use API key from environment (passed as X-API-Key header)
3. Verify dashboard loads
4. Test recommendation status updates

### 4. CORS Configuration
Ensure backend allows frontend domain:
- Update `CLIENT_URL` in backend environment
- Verify no CORS errors in browser console
- Backend uses Helmet.js for security headers

## Monitoring & Maintenance

### 1. Setup Monitoring
- [ ] Vercel Analytics (automatic)
- [ ] Render metrics dashboard
- [ ] Database connection monitoring
- [ ] Error tracking (Sentry optional)

### 2. Backup Strategy
- [ ] Database automatic backups enabled
- [ ] Document backup restoration process
- [ ] Test backup restoration

### 3. Scaling Considerations
- Frontend: Vercel auto-scales
- Backend: Monitor Render metrics
- Database: Check connection limits
- AI API: Monitor response times

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `CLIENT_URL` in backend
   - Verify Vercel domain in backend CORS settings

2. **Database Connection Failed**
   - Check `DATABASE_URL` format
   - Verify SSL requirements
   - Check connection limits

3. **AI API Timeout**
   - Increase timeout in frontend
   - Check AI API deployment status
   - Verify API endpoint URL

4. **Admin Login Failed**
   - Verify `ADMIN_API_KEY` matches
   - Check X-API-Key header is being sent
   - Verify backend logs
   - Ensure header value matches environment variable exactly

## Rollback Procedure

### Frontend
1. Vercel dashboard > Deployments
2. Select previous deployment
3. Click "Promote to Production"

### Backend
1. Render dashboard > Events
2. Select "Rollback"
3. Choose previous deployment

## Security Checklist

- [ ] All API keys are secure
- [ ] Database has strong password
- [ ] Admin API key is complex
- [ ] HTTPS enabled on all services
- [ ] Environment variables not in code
- [ ] No sensitive data in logs

## Final Steps

1. **Test Everything**
   - Complete user flow test
   - Admin panel functionality
   - Mobile responsiveness

2. **Document API Keys**
   - Store securely
   - Share with team securely
   - Update `.env.example` files

3. **Monitor First 24 Hours**
   - Check error logs
   - Monitor performance
   - Gather user feedback

---

## Support Contacts

- Frontend Issues: Check Vercel status page
- Backend Issues: Check Render status page
- Database Issues: Check provider status
- AI API Issues: Check deployment logs

Remember to update this checklist as the deployment evolves!

## Quick Deployment Commands

### Deploy AI API to Heroku
```bash
cd ShowMeTheColor
heroku create pca-hijab-ai
heroku buildpacks:set heroku/python
git push heroku main
```

### Test Endpoints
```bash
# Test Backend Health
curl https://pca-hijab-backend.onrender.com/api/health

# Test AI API
curl http://localhost:8000/health

# Test Admin Auth
curl -H "X-API-Key: your-api-key" https://pca-hijab-backend.onrender.com/api/admin/statistics
```
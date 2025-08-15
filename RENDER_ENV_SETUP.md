# 🚀 Render Environment Variables Setup

## Required Environment Variables for Production

Add these to your Render backend service:

```bash
# Email Service (Resend) - REQUIRED
EMAIL_ENABLED=true
RESEND_API_KEY=re_PspAYXmP_37xPU2MiBMZFiCD2yqwEL1XK
CLIENT_URL=https://pca-hijab.vercel.app
EMAIL_FROM=PCA-HIJAB <onboarding@resend.dev>

# Database - REQUIRED  
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Security - REQUIRED (Generate new ones!)
JWT_SECRET=your-secure-jwt-secret-here-min-32-chars
JWT_REFRESH_SECRET=your-secure-refresh-secret-here-min-32-chars
ADMIN_API_KEY=your-secure-admin-api-key-here

# Server
NODE_ENV=production
PORT=5001
```

## How to Add on Render:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service (`pca-hijab-backend`)
3. Click **Environment** tab
4. Click **Add Environment Variable**
5. Add each variable above (one by one)
6. Click **Save Changes**
7. Service will automatically redeploy

## Generate Secure Secrets:

For JWT_SECRET and JWT_REFRESH_SECRET, generate secure values:

```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Use OpenSSL
openssl rand -hex 32

# Option 3: Use online generator
# https://randomkeygen.com/
```

## Verify Setup:

After deployment, test:

1. Check health: `https://pca-hijab-backend.onrender.com/api/health`
2. Test signup with real email
3. Check email inbox for verification
4. Click verification link
5. Confirm account is activated

## Important Notes:

⚠️ **NEVER commit these values to GitHub**
⚠️ **Generate NEW secret keys - don't use the examples**
⚠️ **Keep RESEND_API_KEY secure**

## Troubleshooting:

- If emails not sending: Check Render logs
- If database errors: Verify DATABASE_URL format
- If auth fails: Check JWT secrets are set

---

Last updated: 2025-01-15
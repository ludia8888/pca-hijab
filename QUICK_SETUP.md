# 🚀 Quick Render Setup - From Terminal!

## Option 1: Interactive Python Script (Easiest)
```bash
cd /Users/isihyeon/Desktop/pca-hijab
python3 scripts/setup_render_env.py
```
The script will ask for your credentials.

## Option 2: Direct Command
```bash
cd /Users/isihyeon/Desktop/pca-hijab
./scripts/setup-render-env.sh YOUR_API_KEY YOUR_SERVICE_ID
```

## How to Get Your Credentials:

### 1. Get Render API Key:
1. Go to: https://dashboard.render.com/account/api-keys
2. Click "Create API Key"
3. Name it: "PCA-HIJAB Setup"
4. Copy the key

### 2. Get Service ID:
1. Go to your backend service on Render
2. Look at the URL: `https://dashboard.render.com/web/srv-xxxxx`
3. Copy the `srv-xxxxx` part

## Example:
```bash
# If your API key is: rnd_AbCdEfGhIjKlMnOpQrStUvWxYz
# And service ID is: srv-co0abc123def456
python3 scripts/setup_render_env.py
# Then enter credentials when prompted
```

## What This Does:
✅ Adds EMAIL_ENABLED=true
✅ Adds RESEND_API_KEY
✅ Adds CLIENT_URL
✅ Adds EMAIL_FROM
✅ Triggers automatic redeploy

## After Running:
1. Wait 2-3 minutes for redeploy
2. Test signup at https://pca-hijab.vercel.app
3. Check your email!

---
**One command, done!** 🎯
#!/bin/bash

# Render Environment Setup Script
# Usage: ./setup-render-env.sh YOUR_RENDER_API_KEY YOUR_SERVICE_ID

RENDER_API_KEY=$1
SERVICE_ID=$2

if [ -z "$RENDER_API_KEY" ] || [ -z "$SERVICE_ID" ]; then
    echo "❌ Usage: ./setup-render-env.sh YOUR_RENDER_API_KEY YOUR_SERVICE_ID"
    echo ""
    echo "To get these values:"
    echo "1. Render API Key: https://dashboard.render.com/account/api-keys"
    echo "2. Service ID: Go to your service → Settings → copy ID from URL"
    echo "   Example URL: https://dashboard.render.com/web/srv-xxxxx"
    echo "   Service ID: srv-xxxxx"
    exit 1
fi

echo "🚀 Setting up Render environment variables..."

# Set environment variables via Render API
curl -X PATCH https://api.render.com/v1/services/$SERVICE_ID/env-vars \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "envVars": [
      {
        "key": "EMAIL_ENABLED",
        "value": "true"
      },
      {
        "key": "RESEND_API_KEY",
        "value": "re_PspAYXmP_37xPU2MiBMZFiCD2yqwEL1XK"
      },
      {
        "key": "CLIENT_URL",
        "value": "https://pca-hijab.vercel.app"
      },
      {
        "key": "EMAIL_FROM",
        "value": "PCA-HIJAB <onboarding@resend.dev>"
      }
    ]
  }'

if [ $? -eq 0 ]; then
    echo "✅ Environment variables added successfully!"
    echo "🔄 Your service will redeploy automatically"
    echo ""
    echo "📧 Email service is now configured with:"
    echo "   - Resend API for email delivery"
    echo "   - Email verification enabled"
    echo "   - Password reset enabled"
else
    echo "❌ Failed to set environment variables"
    echo "Please check your API key and Service ID"
fi
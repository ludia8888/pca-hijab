#!/bin/bash

# Deploy ShowMeTheColor AI API to Heroku

set -e

echo "🚀 Deploying ShowMeTheColor AI API to Heroku..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Please install it first."
    echo "Visit: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Configuration
APP_NAME="pca-hijab-ai-api"
REGION="us"

# Navigate to ShowMeTheColor directory
cd ShowMeTheColor

# Create Heroku app if it doesn't exist
if ! heroku apps:info --app $APP_NAME &> /dev/null; then
    echo "📱 Creating Heroku app..."
    heroku create $APP_NAME --region $REGION --stack heroku-22
else
    echo "✅ Heroku app already exists"
fi

# Add buildpacks
echo "📦 Adding buildpacks..."
heroku buildpacks:add --index 1 heroku/python --app $APP_NAME

# Set environment variables
echo "🔧 Setting environment variables..."
heroku config:set \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    --app $APP_NAME

# Deploy
echo "🚢 Deploying to Heroku..."
git subtree push --prefix=ShowMeTheColor heroku main

# Scale dyno
echo "⚡ Scaling dyno..."
heroku ps:scale web=1 --app $APP_NAME

# Check deployment
echo "✅ Deployment complete!"
echo "🌐 API URL: https://$APP_NAME.herokuapp.com"
echo ""
echo "📊 Checking app status..."
heroku ps --app $APP_NAME
echo ""
echo "📝 Recent logs:"
heroku logs --tail --app $APP_NAME
#!/bin/bash

# Setup GitHub Secrets for CI/CD

set -e

echo "🔐 Setting up GitHub Secrets for PCA-HIJAB project..."
echo ""
echo "This script will help you set up the required GitHub secrets."
echo "You'll need to have the GitHub CLI (gh) installed and authenticated."
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI is not installed. Please install it first."
    echo "Visit: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub. Please run: gh auth login"
    exit 1
fi

# Get repository name
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📍 Repository: $REPO"
echo ""

# Function to set secret
set_secret() {
    local name=$1
    local prompt=$2
    local value=$3
    
    if [ -z "$value" ]; then
        echo -n "$prompt: "
        read -r value
    fi
    
    if [ -n "$value" ]; then
        echo "$value" | gh secret set "$name" -R "$REPO"
        echo "✅ Set $name"
    else
        echo "⏭️  Skipped $name"
    fi
}

echo "📋 Required Secrets for Deployment:"
echo ""

# Vercel Secrets
echo "1️⃣ VERCEL DEPLOYMENT SECRETS"
echo "   Get these from: https://vercel.com/account/tokens"
echo "   and your project settings"
echo ""

set_secret "VERCEL_TOKEN" "Enter Vercel Token"
set_secret "VERCEL_ORG_ID" "Enter Vercel Org ID"
set_secret "VERCEL_PROJECT_ID" "Enter Vercel Project ID"

echo ""

# Render Secrets
echo "2️⃣ RENDER DEPLOYMENT SECRETS"
echo "   Get these from: https://dashboard.render.com/account/api-keys"
echo "   and your service dashboard"
echo ""

set_secret "RENDER_API_KEY" "Enter Render API Key"
set_secret "RENDER_SERVICE_ID" "Enter Render Service ID"

echo ""

# Optional Secrets
echo "3️⃣ OPTIONAL SECRETS"
echo ""

echo -n "Do you want to set up optional secrets? (y/N): "
read -r setup_optional

if [[ "$setup_optional" =~ ^[Yy]$ ]]; then
    set_secret "SLACK_WEBHOOK" "Enter Slack Webhook URL (for notifications)"
    set_secret "CODECOV_TOKEN" "Enter Codecov Token (for coverage reports)"
fi

echo ""
echo "✅ GitHub Secrets setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Verify secrets at: https://github.com/$REPO/settings/secrets/actions"
echo "2. Push to main branch to trigger deployment"
echo "3. Monitor deployment at GitHub Actions tab"
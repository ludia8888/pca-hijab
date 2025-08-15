#!/usr/bin/env python3
"""
Render Environment Variables Setup Script
Automatically configures email service on Render
"""

import sys
import json
import requests

def setup_render_env(api_key, service_id):
    """Set up Render environment variables for email service"""
    
    # Environment variables to set
    env_vars = [
        {"key": "EMAIL_ENABLED", "value": "true"},
        {"key": "RESEND_API_KEY", "value": "re_PspAYXmP_37xPU2MiBMZFiCD2yqwEL1XK"},
        {"key": "CLIENT_URL", "value": "https://pca-hijab.vercel.app"},
        {"key": "EMAIL_FROM", "value": "PCA-HIJAB <onboarding@resend.dev>"}
    ]
    
    # Render API endpoint
    url = f"https://api.render.com/v1/services/{service_id}/env-vars"
    
    # Headers with authentication
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Make API request
    print("🚀 Setting up Render environment variables...")
    
    try:
        response = requests.patch(url, 
            headers=headers, 
            json={"envVars": env_vars}
        )
        
        if response.status_code == 200:
            print("✅ Environment variables added successfully!")
            print("🔄 Your service will redeploy automatically")
            print("\n📧 Email service is now configured with:")
            print("   - Resend API for email delivery")
            print("   - Email verification enabled")
            print("   - Password reset enabled")
            return True
        else:
            print(f"❌ Failed to set environment variables")
            print(f"Response: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def get_render_credentials():
    """Get Render credentials interactively or from arguments"""
    
    if len(sys.argv) == 3:
        return sys.argv[1], sys.argv[2]
    
    print("🔐 Render Setup Helper")
    print("=" * 50)
    print("\nTo get these values:")
    print("1. API Key: https://dashboard.render.com/account/api-keys")
    print("2. Service ID: Your backend service URL contains it")
    print("   Example: https://dashboard.render.com/web/srv-xxxxx")
    print("   Service ID would be: srv-xxxxx")
    print("=" * 50)
    
    api_key = input("\n📝 Enter your Render API Key: ").strip()
    service_id = input("📝 Enter your Service ID (srv-xxxxx): ").strip()
    
    return api_key, service_id

if __name__ == "__main__":
    # Check if requests is installed
    try:
        import requests
    except ImportError:
        print("❌ Please install requests: pip install requests")
        sys.exit(1)
    
    # Get credentials
    api_key, service_id = get_render_credentials()
    
    if not api_key or not service_id:
        print("❌ API Key and Service ID are required")
        sys.exit(1)
    
    # Set up environment
    success = setup_render_env(api_key, service_id)
    sys.exit(0 if success else 1)
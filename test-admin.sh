#!/bin/bash

# Admin 페이지 로컬 테스트 스크립트

echo "🚀 Starting local test environment for Admin page..."

# Backend 환경변수 설정
export NODE_ENV=development
export PORT=5000
export ADMIN_API_KEY=test-admin-key
export DATABASE_URL=""

# Backend 실행
echo "📦 Starting Backend on port 5000..."
cd backend
npm run dev &
BACKEND_PID=$!

# Frontend은 이미 실행 중이라고 가정
echo ""
echo "✅ Test environment is ready!"
echo ""
echo "📋 Test Instructions:"
echo "1. Open browser: http://localhost:3000/admin/login"
echo "2. Enter API Key: test-admin-key"
echo "3. You should see the admin dashboard"
echo ""
echo "🔑 Test Credentials:"
echo "   API Key: test-admin-key"
echo ""
echo "Press Ctrl+C to stop the backend server"

# Wait for backend process
wait $BACKEND_PID
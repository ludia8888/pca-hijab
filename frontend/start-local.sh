#!/bin/bash

echo "🚀 Starting PCA-HIJAB Local Development Environment"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
if lsof -i:5001 > /dev/null; then
    echo -e "${GREEN}✅ Backend API already running on port 5001${NC}"
else
    echo -e "${YELLOW}⚠️  Backend API not running. Please start it with:${NC}"
    echo "   cd ../backend && npm run dev"
fi

# Check if AI API is running
if lsof -i:8000 > /dev/null; then
    echo -e "${GREEN}✅ AI API already running on port 8000${NC}"
else
    echo -e "${YELLOW}⚠️  AI API not running. Please start it with:${NC}"
    echo "   cd ../ShowMeTheColor && source venv/bin/activate && python src/api_simple.py"
fi

# Kill any existing frontend server
echo "Stopping any existing frontend servers..."
for pid in $(lsof -ti:8081); do 
    kill -9 $pid 2>/dev/null || true
done

# Start the SPA server
echo -e "${GREEN}🚀 Starting frontend SPA server on port 8081...${NC}"
node serve.cjs &

echo ""
echo "=================================================="
echo -e "${GREEN}✨ Application URLs:${NC}"
echo "   Frontend:    http://localhost:8081"
echo "   Backend API: http://localhost:5001"
echo "   AI API:      http://localhost:8000"
echo "   Admin Panel: http://localhost:8081/admin/login"
echo ""
echo "Press Ctrl+C to stop the frontend server"
echo "=================================================="

# Keep the script running
wait
#!/bin/bash

# Load environment variables
if [ -f .env.docker ]; then
    export $(cat .env.docker | grep -v '^#' | xargs)
fi

echo "Deploying PCA-HIJAB Docker Stack..."

# Pull latest images (if using a registry)
# docker-compose pull

# Build and start services
docker-compose up -d --build

# Wait for health checks
echo "Waiting for services to be healthy..."
sleep 10

# Check service health
docker-compose ps

echo "Deployment completed!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5001"
echo "AI API: http://localhost:8000"
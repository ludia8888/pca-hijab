#!/bin/bash

echo "Building PCA-HIJAB Docker Stack..."

# Build all images
docker-compose build --parallel

echo "Build completed!"
echo "To run the stack: docker-compose up -d"
echo "To stop the stack: docker-compose down"